#!/usr/bin/env python3
"""bump_version.py — SemVer increment helper (deterministic, testable).

Usage:
    python3 bump_version.py <version> <type>
        <version>  "X.Y.Z", tùy chọn tiền tố "v"/"V" và hậu tố prerelease/build.
        <type>     major | minor | patch
        In ra version mới.

Chạy không có argument -> chạy self-check (assert).

Quy tắc (SemVer 2.0.0):
    major  -> (M+1).0.0, bỏ prerelease/build
    minor  -> M.(m+1).0, bỏ prerelease/build
    patch  -> M.m.(p+1), giữ nguyên prerelease/build
"""

import re
import sys

_VALID = re.compile(r"^([vV]?)(\d+)\.(\d+)\.(\d+)([-+].*)?$")


def bump(version: str, typ: str) -> str:
    m = _VALID.match(version.strip())
    if not m:
        raise ValueError(f"Không parse được version: {version!r} (cần dạng X.Y.Z[+pre/build])")
    prefix = m.group(1)
    major, minor, patch = int(m.group(2)), int(m.group(3)), int(m.group(4))
    suffix = m.group(5) or ""

    if typ == "major":
        major, minor, patch, suffix = major + 1, 0, 0, ""
    elif typ == "minor":
        minor, patch, suffix = minor + 1, 0, ""
    elif typ == "patch":
        patch += 1
    else:
        raise ValueError(f"typ phải là major|minor|patch, nhận: {typ!r}")

    return f"{prefix}{major}.{minor}.{patch}{suffix}"


def main() -> None:
    if len(sys.argv) == 3:
        print(bump(sys.argv[1], sys.argv[2]))
        return

    # Self-check
    checks = [
        ("0.2.13", "minor", "0.3.0"),
        ("0.2.13", "patch", "0.2.14"),
        ("0.2.13", "major", "1.0.0"),
        ("1.2.3", "major", "2.0.0"),
        ("1.2.3", "minor", "1.3.0"),
        ("1.2.3", "patch", "1.2.4"),
        ("1.2.3-beta.1", "minor", "1.3.0"),
        ("1.2.3-beta.1", "patch", "1.2.4-beta.1"),
        ("v0.2.13", "minor", "v0.3.0"),
        ("0.0.0", "patch", "0.0.1"),
    ]
    for ver, typ, expected in checks:
        got = bump(ver, typ)
        assert got == expected, f"{ver} {typ}: {got!r} != {expected!r}"
    print(f"OK: {len(checks)} checks passed")


if __name__ == "__main__":
    main()
