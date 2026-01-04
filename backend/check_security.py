#!/usr/bin/env python3
"""Security vulnerability scanner for Python dependencies."""
import subprocess
import sys
import os


def check_safety():
    """Check dependencies using safety (if installed)."""
    try:
        result = subprocess.run(
            ["safety", "check", "-r", "requirements.txt"],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(__file__)
        )
        if result.returncode == 0:
            print("✓ No known security vulnerabilities found (safety)")
            return True
        else:
            print("⚠ Security vulnerabilities found:")
            print(result.stdout)
            print(result.stderr)
            return False
    except FileNotFoundError:
        print("⚠ 'safety' not installed. Install with: pip install safety")
        print("  Then run: safety check -r requirements.txt")
        return None


def check_pip_audit():
    """Check dependencies using pip-audit (if installed)."""
    try:
        result = subprocess.run(
            ["pip-audit", "-r", "requirements.txt"],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(__file__)
        )
        if result.returncode == 0:
            print("✓ No known security vulnerabilities found (pip-audit)")
            return True
        else:
            print("⚠ Security vulnerabilities found:")
            print(result.stdout)
            print(result.stderr)
            return False
    except FileNotFoundError:
        print("⚠ 'pip-audit' not installed. Install with: pip install pip-audit")
        print("  Then run: pip-audit -r requirements.txt")
        return None


def main():
    """Run security checks."""
    print("Checking Python dependencies for security vulnerabilities...\n")
    
    # Try pip-audit first (more modern)
    result = check_pip_audit()
    if result is not None:
        sys.exit(0 if result else 1)
    
    # Fall back to safety
    result = check_safety()
    if result is not None:
        sys.exit(0 if result else 1)
    
    print("\n⚠ No security scanner found. Please install one:")
    print("  pip install pip-audit  # Recommended")
    print("  or")
    print("  pip install safety")
    sys.exit(1)


if __name__ == "__main__":
    main()

