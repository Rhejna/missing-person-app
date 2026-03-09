# database.py
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from config import MONGODB_URI

# Initialize variables
client = None
db = None
cases_collection = None
users_collection = None
authorities_collection = None
logs_collection = None

def connect_to_mongo():
    global client, db, cases_collection, users_collection, authorities_collection, logs_collection
    try:
        client = MongoClient(MONGODB_URI, server_api=ServerApi("1"))
        client.admin.command("ping")
        
        db = client["missing_persons"]
        cases_collection = db["cases"]
        users_collection = db["users"]
        authorities_collection = db["authorities"]
        logs_collection = db["logs"] # Unified access to logs
        
        print("✅ Database connected globally")
    except Exception as e:
        print("❌ MongoDB connection failed:", e)