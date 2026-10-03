"""Public state/GEN invariants, including stale-phase temporal entrypoints."""
import json
from datetime import datetime, timezone

import pytest

GEN = 10**18
NOW = 1791028800
TERMS = (
    "A may submit spending proposals. A must report approved spending monthly.",
    "B may inspect every report. B has no duty to fund A's spending.",
    "C may request a correction to inaccurate reports. C has no funding duty.",
)
CHANGED = (TERMS[0], "B may inspect every report. B must pay 1 GEN for each inspection.", TERMS[2])


def at(vm, timestamp):
    vm.warp(datetime.fromtimestamp(timestamp, timezone.utc).isoformat())


def read(value):
    return json.loads(value)


@pytest.fixture
def environment(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie, direct_owner):
    at(direct_vm, NOW)
    direct_vm.sender = direct_alice
    contract = direct_deploy("contracts/consent_delta.py")
    from genlayer.types import Address
    return direct_vm, contract, tuple(Address(account) for account in (direct_alice, direct_bob, direct_charlie)), Address(direct_owner)


def create(environment, charter="CD-1", active=True):
    vm, contract, members, _ = environment
    vm.sender = members[0]
    contract.create_charter(charter, "Shared spending charter", members[1], members[2], *TERMS, NOW + 1000)
    if active:
        digest = read(contract.get_charter(charter))["digest"]
        for member in members:
            vm.sender = member
            contract.ratify(charter, digest)
    return read(contract.get_charter(charter))


def propose(environment, charter="CD-1", proposal="AM-1", terms=CHANGED):
    vm, contract, members, _ = environment
    current = read(contract.get_charter(charter))
    vm.sender = members[0]
    vm.value = 2 * GEN
    contract.propose_amendment(charter, proposal, current["version"], current["digest"], *terms, NOW + 500)
    vm.value = 0
    return read(contract.get_proposal(charter, proposal))


def review(environment, impact="MATERIAL_CHANGE"):
    vm, contract, _, _ = environment
    vm.clear_mocks()
    vm.mock_llm(".*ConsentDelta.*", json.dumps({
        "coverage": [{"member_id": member, "impact": impact if member == "B" else "PRESERVED"} for member in "ABC"],
        "changed_member_ids": ["B"] if impact == "MATERIAL_CHANGE" else [],
    }))
    contract.review("CD-1", "AM-1")
    return read(contract.get_proposal("CD-1", "AM-1"))


def snapshot(contract):
    return (contract.get_charter("CD-1"), contract.get_proposal("CD-1", "AM-1"), contract.get_accounting("CD-1"))


def test_affected_consent_controls_adoption_and_fixed_credit(environment):
    vm, contract, members, _ = environment
    create(environment)
    propose(environment)
    proposal = review(environment)
    assert proposal["phase"] == "CONSENT_REQUIRED"
    assert proposal["required"] == ["B"]
    assert read(contract.get_charter("CD-1"))["version"] == 1
    vm.sender = members[1]
    contract.consent("CD-1", "AM-1", proposal["digest"])
    assert read(contract.get_charter("CD-1"))["version"] == 2
    assert read(contract.get_proposal("CD-1", "AM-1"))["phase"] == "ADOPTED"
    assert read(contract.get_credit("CD-1", members[0]))["amount_gen"] == 2
    assert read(contract.get_accounting("CD-1")) == {"funded_gen": 2, "locked_gen": 0, "credits_gen": 2, "withdrawn_gen": 0, "conserved": True}


@pytest.mark.parametrize("terminal", ["reject", "expire"])
def test_refusal_and_expiry_refund_only_fixed_funder(environment, terminal):
    vm, contract, members, outsider = environment
    create(environment)
    propose(environment)
    proposal = review(environment)
    if terminal == "reject":
        vm.sender = members[1]
        contract.reject("CD-1", "AM-1", proposal["digest"])
    else:
        at(vm, NOW + 500)
        vm.sender = outsider
        contract.expire("CD-1", "AM-1")
    assert read(contract.get_charter("CD-1"))["version"] == 1
    assert read(contract.get_credit("CD-1", members[0]))["amount_gen"] == 2
    assert read(contract.get_credit("CD-1", outsider))["amount_gen"] == 0
    before = snapshot(contract)
    with vm.expect_revert():
        contract.expire("CD-1", "AM-1")
    assert snapshot(contract) == before


def test_ambiguity_retains_purse_and_can_expire(environment):
    vm, contract, _, _ = environment
    create(environment)
    propose(environment)
    proposal = review(environment, "AMBIGUOUS")
    assert proposal["phase"] == "RETRYABLE"
    assert read(contract.get_accounting("CD-1"))["locked_gen"] == 2
    assert read(contract.get_charter("CD-1"))["version"] == 1
    at(vm, NOW + 500)
    contract.expire("CD-1", "AM-1")
    assert read(contract.get_accounting("CD-1"))["credits_gen"] == 2


@pytest.mark.parametrize("method", ["review", "consent", "reject"])
@pytest.mark.parametrize("offset", [-1, 0, 1])
def test_each_proposal_write_checks_own_deadline_with_stale_phase(environment, method, offset):
    vm, contract, members, _ = environment
    create(environment)
    propose(environment)
    proposal = review(environment)
    if method == "review":
        # REVIEWABLE is deliberately left stale until after the deadline.
        create(environment, "CD-2")
        propose(environment, "CD-2")
        charter = "CD-2"
        proposal = read(contract.get_proposal(charter, "AM-1"))
    else:
        charter = "CD-1"
        vm.sender = members[1]
    at(vm, NOW + 500 + offset)
    before = (contract.get_charter(charter), contract.get_proposal(charter, "AM-1"), contract.get_accounting(charter))
    args = (charter, "AM-1") + (() if method == "review" else (proposal["digest"],))
    if offset >= 0:
        with vm.expect_revert("DEADLINE"):
            getattr(contract, method)(*args)
        assert (contract.get_charter(charter), contract.get_proposal(charter, "AM-1"), contract.get_accounting(charter)) == before
    else:
        getattr(contract, method)(*args)


@pytest.mark.parametrize("offset", [-1, 0, 1])
def test_initial_ratification_clock_is_independent_of_phase(environment, offset):
    vm, contract, members, _ = environment
    current = create(environment, active=False)
    vm.sender = members[1]
    at(vm, NOW + 1000 + offset)
    before = contract.get_charter("CD-1")
    if offset >= 0:
        with vm.expect_revert("DEADLINE"):
            contract.ratify("CD-1", current["digest"])
        assert contract.get_charter("CD-1") == before
    else:
        contract.ratify("CD-1", current["digest"])


@pytest.mark.parametrize("method", ["expire", "expire_charter"])
@pytest.mark.parametrize("offset", [-1, 0, 1])
def test_recovery_requires_its_own_expiry_boundary(environment, method, offset):
    vm, contract, _, _ = environment
    create(environment, active=method == "expire")
    if method == "expire": propose(environment)
    at(vm, NOW + (500 if method == "expire" else 1000) + offset)
    before = contract.get_charter("CD-1"), contract.get_accounting("CD-1")
    args = ("CD-1", "AM-1") if method == "expire" else ("CD-1",)
    if offset < 0:
        with vm.expect_revert("NOT_EXPIRED"):
            getattr(contract, method)(*args)
        assert (contract.get_charter("CD-1"), contract.get_accounting("CD-1")) == before
    else:
        getattr(contract, method)(*args)


@pytest.mark.parametrize("amount", [0, 1, 3])
def test_wrong_gen_value_cannot_open_purse(environment, amount):
    vm, contract, members, _ = environment
    current = create(environment)
    before = contract.get_charter("CD-1"), contract.get_accounting("CD-1")
    vm.sender = members[0]
    vm.value = amount * GEN
    with vm.expect_revert("EXACTLY_2_GEN"):
        contract.propose_amendment("CD-1", "AM-1", 1, current["digest"], *CHANGED, NOW + 500)
    vm.value = 0
    assert (contract.get_charter("CD-1"), contract.get_accounting("CD-1")) == before


@pytest.mark.parametrize("actor", [0, 2, 3])
def test_unaffected_proposer_or_outsider_cannot_refuse_or_assent(environment, actor):
    vm, contract, members, outsider = environment
    create(environment)
    propose(environment)
    proposal = review(environment)
    vm.sender = (*members, outsider)[actor]
    before = snapshot(contract)
    for method in ("consent", "reject"):
        with vm.expect_revert():
            getattr(contract, method)("CD-1", "AM-1", proposal["digest"])
        assert snapshot(contract) == before
