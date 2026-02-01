from pymongo import MongoClient
from config import MONGODB_URI

uri = MONGODB_URI

client = MongoClient(uri)
client.admin.command("ping")
print("✅ MongoDB connected")
