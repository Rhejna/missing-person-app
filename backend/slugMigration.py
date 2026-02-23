"""
Database maintenance script to update existing case records.

Scans the database for cases that do not have a 'slug' field and 
generates one based on the person's name using create_slug().
This ensures all old data is compatible with the new slug-based routing.
"""

from pymongo import MongoClient
from pymongo.server_api import ServerApi
from utils import create_slug
from config import MONGODB_URI

def migrate_slugs():
    client = MongoClient(
            MONGODB_URI,
            server_api=ServerApi("1")
        )
    db = client["missing_persons"]
    cases = db.cases.find({"slug": {"$exists": False}})
    
    for case in cases:
        new_slug = create_slug(case["name"])
        db.cases.update_one({"_id": case["_id"]}, {"$set": {"slug": new_slug}})
    print("✅ All old cases now have slugs!")

migrate_slugs()