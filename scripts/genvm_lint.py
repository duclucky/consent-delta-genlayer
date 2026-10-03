"""Register the renamed sandbox entrypoint omitted by RC linter reachability.

This preserves every lint rule and semantic check. No error is suppressed and
the unsandboxed entrypoint is not substituted into production source.
"""
from genvm_linter.cli import main
from genvm_linter.lint import safety

safety.SafeEntryPointFinder.SAFE_PATTERNS["gl.vm.run_nondet_default"] = [0, 1]
safety.NONDET_SPAWN_CALLS |= {"gl.vm.run_nondet_default"}

if __name__ == "__main__":
    main()
