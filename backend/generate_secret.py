#!/usr/bin/env python3
"""
Generate a secure secret key for production use.
Run this script to generate a new SECRET_KEY for your .env file.
"""

import secrets

def generate_secret_key(length: int = 32) -> str:
    """Generate a cryptographically secure secret key."""
    return secrets.token_urlsafe(length)

if __name__ == "__main__":
    secret_key = generate_secret_key()
    print("Generated SECRET_KEY:")
    print(f"SECRET_KEY={secret_key}")
    print("\nAdd this to your .env file!")
