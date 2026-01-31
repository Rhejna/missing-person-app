from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
from config import MONGODB_URI

uri = MONGODB_URI

try:
    client = MongoClient(
        uri,
        server_api=ServerApi('1'),
        tls=True,
        tlsCAFile=certifi.where(),
        connectTimeoutMS=30000,
        socketTimeoutMS=30000,
    )
    
    # Test de connexion
    client.admin.command('ping')
    print("✅ Connexion réussie à MongoDB!")
    
    # Lister les bases de données
    print("Bases de données disponibles:", client.list_database_names())
    
    # Lister les collections
    db = client["missing_persons"]
    print("Collections:", db.list_collection_names())
    
except Exception as e:
    print(f"❌ Erreur de connexion: {e}")