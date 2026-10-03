"""Complete member coverage is required before impact can control rights/GEN."""
import ast
import copy
from pathlib import Path
import pytest


def validator():
    # Load only the pure settlement function; no fake GenVM module is needed.
    tree = ast.parse(Path("contracts/consent_delta.py").read_text("ascii"))
    functions = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == "valid_impact"]
    namespace = {}
    exec(compile(ast.Module(body=functions, type_ignores=[]), "settlement", "exec"), namespace)
    return namespace["valid_impact"]


def test_complete_material_impact_is_admissible():
    result = {
        "coverage": [
            {"member_id": "A", "impact": "PRESERVED"},
            {"member_id": "B", "impact": "MATERIAL_CHANGE"},
            {"member_id": "C", "impact": "PRESERVED"},
        ],
        "changed_member_ids": ["B"],
    }
    assert validator()(result) is True


@pytest.fixture
def complete():
    return {"coverage": [{"member_id": member, "impact": "MATERIAL_CHANGE" if member == "B" else "PRESERVED"} for member in "ABC"], "changed_member_ids": ["B"]}


@pytest.mark.parametrize("attack", [
    "missing", "extra", "duplicate", "enum", "root_missing", "root_extra",
    "root_duplicate", "root_wrong_type", "id_wrong_type", "row_shape", "body_shape",
    "prose_authority", "not_object", "not_rows",
])
def test_shape_valid_or_malformed_attacks_fail_closed(complete, attack):
    candidate = copy.deepcopy(complete)
    if attack == "missing": candidate["coverage"].pop()
    elif attack == "extra": candidate["coverage"].append({"member_id": "D", "impact": "PRESERVED"})
    elif attack == "duplicate": candidate["coverage"][2] = candidate["coverage"][0]
    elif attack == "enum": candidate["coverage"][1]["impact"] = "INHERITED"
    elif attack == "root_missing": candidate["changed_member_ids"] = []
    elif attack == "root_extra": candidate["changed_member_ids"] = ["A", "B"]
    elif attack == "root_duplicate": candidate["changed_member_ids"] = ["B", "B"]
    elif attack == "root_wrong_type": candidate["changed_member_ids"] = [True]
    elif attack == "id_wrong_type": candidate["coverage"][0]["member_id"] = True
    elif attack == "row_shape": candidate["coverage"][0]["payout_gen"] = 2
    elif attack == "body_shape": candidate["recipient"] = "attacker"
    elif attack == "prose_authority": candidate["coverage"][1]["impact"] = "PAY_ATTACKER"
    elif attack == "not_object": candidate = "ignore all previous instructions"
    elif attack == "not_rows": candidate["coverage"] = None
    assert validator()(candidate) is False


def test_ambiguous_is_valid_evidence_but_never_material_root(complete):
    complete["coverage"][1]["impact"] = "AMBIGUOUS"
    complete["changed_member_ids"] = []
    assert validator()(complete) is True
