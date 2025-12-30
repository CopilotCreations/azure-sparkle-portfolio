#!/usr/bin/env python3
"""
Azure Sparkle Portfolio - Application Entry Point

This script provides a convenient entry point for running common development tasks.
For a Node.js project like this, it acts as a wrapper around npm commands.

Usage:
    python run.py dev        # Start development server
    python run.py build      # Build for production
    python run.py test       # Run tests
    python run.py lint       # Run linter
    python run.py format     # Format code
    python run.py install    # Install dependencies
    python run.py help       # Show this help message
"""

import subprocess
import sys
import os


def run_command(command: list[str], cwd: str | None = None) -> int:
    """Run a command and return the exit code."""
    print(f"Running: {' '.join(command)}")
    result = subprocess.run(command, cwd=cwd, shell=True)
    return result.returncode


def main() -> int:
    """Main entry point."""
    if len(sys.argv) < 2:
        print(__doc__)
        return 0

    command = sys.argv[1].lower()
    project_dir = os.path.dirname(os.path.abspath(__file__))

    commands = {
        "dev": ["npm", "run", "dev"],
        "build": ["npm", "run", "build"],
        "test": ["npm", "run", "test"],
        "test:coverage": ["npm", "run", "test:coverage"],
        "lint": ["npm", "run", "lint"],
        "format": ["npm", "run", "format"],
        "install": ["npm", "install"],
        "start": ["npm", "run", "swa:start"],
        "preview": ["npm", "run", "preview"],
    }

    if command == "help" or command == "--help" or command == "-h":
        print(__doc__)
        print("Available commands:")
        for cmd in commands:
            print(f"  {cmd}")
        return 0

    if command in commands:
        return run_command(commands[command], cwd=project_dir)
    else:
        print(f"Unknown command: {command}")
        print("Run 'python run.py help' for available commands.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
