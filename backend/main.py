from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import shutil
import os
from config import MONGODB_URI

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], #origins,
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # allow all headers
)

# MongoDB connection
client: MongoClient | None = None
db = None
cases_collection = None

@app.on_event("startup")
def startup_db():
    global client, db, cases_collection
    try:
        client = MongoClient(
            MONGODB_URI,
            server_api=ServerApi("1")
        )
        client.admin.command("ping")
        db = client["missing_persons"]
        cases_collection = db["cases"]
        print("✅ Connected to MongoDB")
    except Exception as e:
        print("❌ MongoDB connection failed:", e)



# --- Case creation ---
class CaseCreate(BaseModel):
    firstName: str
    lastName: str
    age: int
    description: str
    lastSeenLocation: str
    lastSeenDate: str
    lastSeenTime: Optional[str] = None
    reporterName: str
    reporterRelation: str
    reporterPhone: str
    reporterEmail: str

def get_next_case_id():
    last_case = cases_collection.find_one(
        sort=[("id", -1)]
    )
    if last_case:
        return last_case["id"] + 1
    return 1


# --- Routes ---
def require_db():
    if cases_collection is None:
        raise HTTPException(
            status_code=503,
            detail="Database not connected"
        )

@app.get("/")
def root():
    return {"status": "API is running"}

@app.get("/cases")
def get_cases():
    require_db()
    # return cases
    return list(cases_collection.find({}, {"_id": 0}))

@app.get("/cases/{case_id}")
def get_case(case_id: int):
    require_db()
    for case in list(cases_collection.find({}, {"_id": 0})):
        if case["id"] == case_id:
            return case
    raise HTTPException(status_code=404, detail="Case not found")

@app.post("/cases")
def create_case(data: CaseCreate):
    require_db()
    new_id = get_next_case_id()

    full_name = f"{data.firstName} {data.lastName}"

    last_seen = data.lastSeenDate
    if data.lastSeenTime:
        last_seen += f" at {data.lastSeenTime}"

    case_document = {
        "id": new_id,
        "name": full_name,
        "age": data.age,
        "lastSeen": last_seen,
        "location": data.lastSeenLocation,
        "photo": "/missing-person-unknown.jpg",
        "status": "missing",
        "verified": False,
        "description": data.description,
        "reporterContact": f"{data.reporterName} ({data.reporterRelation})",
        "reporterPhone": data.reporterPhone,
        "reportedDate": datetime.now().strftime("%b %d, %Y"),
        "caseNumber": f"MISS-{datetime.now().year}-{str(new_id).zfill(4)}",
        "updates": [
            {
                "date": datetime.now().strftime("%b %d, %Y"),
                "status": "Case reported",
                "type": "reported",
            }
        ],
        "comments": [],
    }

    cases_collection.insert_one(case_document)

    # ✅ IMPORTANT LINE
    case_document.pop("_id", None)

    return case_document