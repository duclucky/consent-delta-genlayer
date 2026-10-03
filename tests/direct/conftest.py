"""Narrow RC test-tool adaptations; production SDK/authorization is unchanged.

Use the linter's complete official release download instead of a partial shared
gltest cache. On Windows, defer unlinking fd0's message until stdin is restored.
The transaction clock is supplied by the actual VM message, without a clock shim.
The RC tool's warp refresh omits raw datetime; keep that message field in sync.
"""
import os
import json
import sys
from pathlib import Path
from unittest.mock import patch

from gltest.direct import loader, sdk_loader, wasi_mock
from gltest.direct.vm import VMContext
from genvm_linter.validate.artifacts import download_artifacts

os.environ["GENVM_VERSION"] = "v0.6.0-rc8"
os.environ["GENVM_SOURCE_MODE"] = "release"
os.environ.pop("GENVM_PREBUILT_DIR", None)
os.environ.pop("GENVMROOT", None)

sdk_loader.CACHE_DIR = Path(".local/gltest-direct").resolve()
sdk_loader.BUNDLE_CACHE_DIR = sdk_loader.CACHE_DIR / "bundles-v2"
sdk_loader.TREE_CACHE_DIR = sdk_loader.CACHE_DIR / "trees-v2"
sdk_loader.download_artifacts = download_artifacts

original_inject = loader._inject_message_to_fd0
original_cleanup = VMContext._cleanup_after_deactivate
original_call = wasi_mock._handle_gl_call
original_refresh = VMContext._refresh_gl_message


def refresh_message(vm):
    original_refresh(vm)
    message = sys.modules.get("genlayer.message")
    if message is not None and isinstance(message.raw, dict):
        message.raw["datetime"] = vm._datetime


def inject_message(vm):
    if os.name != "nt":
        return original_inject(vm)
    paths = []
    with patch("os.unlink", side_effect=lambda path: paths.append(path)):
        original_inject(vm)
    vm._consentdelta_message_files = paths


def cleanup(vm):
    paths = getattr(vm, "_consentdelta_message_files", [])
    original_cleanup(vm)
    for path in paths:
        os.unlink(path)
    vm._consentdelta_message_files = []


def host_call(vm, request):
    if isinstance(request, dict) and "ExecPrompt" in request:
        # The pinned v0.3 decoder requires JSON text. The RC mock incorrectly
        # pre-parses JSON into a dict, which is not the actual host wire format.
        response = vm._match_llm_mock(request["ExecPrompt"].get("prompt", ""))
        if response is not None:
            return {"ok": response if isinstance(response, str) else json.dumps(response)}
    return original_call(vm, request)


loader._inject_message_to_fd0 = inject_message
VMContext._cleanup_after_deactivate = cleanup
VMContext._refresh_gl_message = refresh_message
wasi_mock._handle_gl_call = host_call
