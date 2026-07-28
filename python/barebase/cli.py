"""BareBase installer + project scaffolder (Python front door). Zero dependencies, stdlib only.

Mirrors the npm `barebase` CLI so pip users get the same UX. The engine ships as a separate
licensed distribution; this tool scaffolds a project and launches the engine when present.
"""
import json
import os
import shutil
import subprocess
import sys

VERSION = "0.1.0"
SITE = "https://barebase.io"
BLUE = "\033[38;2;97;153;246m" if sys.stdout.isatty() else ""
DIM = "\033[2m" if sys.stdout.isatty() else ""
OFF = "\033[0m" if sys.stdout.isatty() else ""


def banner():
    print(f"{BLUE}barebase{OFF} {DIM}v{VERSION}{OFF}  -  everything your backend needs, nothing it does not")


def help_text():
    banner()
    print()
    print("Usage: barebase <command> [options]")
    print()
    print("Commands:")
    print("  init [dir]     Scaffold a new BareBase project (config + starter)")
    print("  dev            Run the engine in development (requires the engine)")
    print("  start          Run the engine in production (requires the engine)")
    print("  version        Print the CLI version")
    print("  help           Show this help")
    print()
    print(f"Docs: {SITE}")


def write_if_absent(path, content):
    if os.path.exists(path):
        print(f"{DIM}skip{OFF} {path} (exists)")
        return False
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"{BLUE}create{OFF} {path}")
    return True


def init(args):
    target = os.path.abspath(args[0] if args else ".")
    os.makedirs(target, exist_ok=True)
    banner()
    print()
    config = {
        "$schema": "https://barebase.io/schema/config.json",
        "port": 3320,
        "store": {"driver": "sqlite", "filename": "./barebase.db"},
        "admin": {"enabled": True, "path": "/admin"},
        "mcp": {"enabled": True},
        "mounts": [],
    }
    write_if_absent(os.path.join(target, "barebase.config.json"), json.dumps(config, indent=2) + "\n")
    write_if_absent(os.path.join(target, ".gitignore"), "node_modules/\nbarebase.db*\n.env\n")
    write_if_absent(
        os.path.join(target, "README.md"),
        f"# BareBase project\n\nRun the engine:\n\n    barebase dev\n\nDocs: {SITE}\n",
    )
    print()
    print("Next:")
    print(f"  {DIM}cd {args[0] if args else '.'}{OFF}")
    print(f"  {DIM}barebase dev{OFF}")
    print()
    print(f"Get the engine and a free license at {SITE}")


def run(mode):
    engine = shutil.which("barebase-engine")
    if engine:
        return subprocess.call([engine, mode])
    banner()
    print()
    print("The BareBase engine is not installed.")
    print(f"Install it and claim a free self-host license at {SITE}")
    return 1


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    cmd = argv[0] if argv else "help"
    rest = argv[1:]
    if cmd == "init":
        init(rest)
    elif cmd == "dev":
        sys.exit(run("dev"))
    elif cmd == "start":
        sys.exit(run("start"))
    elif cmd in ("version", "--version", "-v"):
        print(VERSION)
    elif cmd in ("help", "--help", "-h"):
        help_text()
    else:
        print(f"Unknown command: {cmd}")
        help_text()
        sys.exit(1)


if __name__ == "__main__":
    main()
