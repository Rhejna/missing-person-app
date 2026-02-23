"""
Generates a URL-friendly slug from a person's name.

The process includes:
1. Normalizing Unicode characters (removing accents).
2. Converting to lowercase and replacing non-alphanumeric characters with hyphens.
3. Appending a random 4-character suffix to ensure uniqueness and prevent URL guessing.

Args:
    name (str): The full name of the missing person.
    
Returns:
    str: A hyphenated string like 'john-doe-a1b2'.
"""

import re
import secrets
import string
from unicodedata import normalize


def create_slug(name: str):
    name = normalize('NFKD', name).encode('ascii', 'ignore').decode('ascii').lower()
    slug = re.sub(r'[^a-z0-9]+', '-', name).strip('-')
    suffix = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(4))
    
    return f"{slug}-{suffix}"