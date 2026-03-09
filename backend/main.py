from fastapi import FastAPI, HTTPException, File, UploadFile, Form, APIRouter, Depends, status, Request, Response
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient, GEOSPHERE
from pymongo.server_api import ServerApi
import shutil
import os
from bson import ObjectId

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import MONGODB_URI, SECRET_KEY, ALGORITHM
from utils import create_slug
from logs import create_log
from admin import router as admin_router
from auth import (
    UserSignup, 
    UserLogin, 
    hash_password, 
    verify_password, 
    create_access_token, 
    get_current_user
)
import database

app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(admin_router)

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

security = HTTPBearer()

@app.on_event("startup")
def startup_db():
    database.connect_to_mongo()

# --- Case creation ---
def get_next_case_id():
    last_case = database.cases_collection.find_one(
        sort=[("id", -1)]
    )
    if last_case:
        return last_case["id"] + 1
    return 1


# --- Routes ---
def require_db():
    if database.cases_collection is None:
        raise HTTPException(
            status_code=503,
            detail="Database not connected"
        )
    # Activate the index and treat the "location" field like a map.
    database.authorities_collection.create_index([("location", GEOSPHERE)])

@app.get("/")
def root():
    return {"status": "API is running"}


@app.post("/auth/signup")
def signup(user: UserSignup, request: Request):
    require_db()

    existing_user = database.users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)

    user_document = {
        "email": user.email,
        "password": hashed_pw,
        "phone": user.phone,
        "fullName": user.fullName,
        "createdAt": datetime.utcnow()
    }

    result = database.users_collection.insert_one(user_document)

    create_log("user_signup", str(result.inserted_id), f"New user: {user.email}", request)

    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }


@app.post("/auth/login")
def login(user: UserLogin, request: Request):
    require_db()

    db_user = database.users_collection.find_one({"email": user.email})

    if not db_user:
        create_log("login_failed", None, f"Failed login: {user.email}", request)
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # --- NEW CHECK HERE ---
    if db_user.get("blocked") is True:
        create_log("login_blocked", str(db_user["_id"]), f"Blocked user tried to login: {user.email}", request)
        raise HTTPException(
            status_code=403, 
            detail="Your account has been deactivated. Please contact support."
        )
    # ----------------------

    if not verify_password(user.password, db_user["password"]):
        create_log("login_failed", None, f"Failed login: {user.email}", request)
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": str(db_user["_id"])
        }
    )

    create_log("user_login", str(db_user["_id"]), f"Login success: {user.email}", request)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.post("/auth/admin-login")
async def admin_login(data: UserLogin, request: Request):
    require_db()

    user = database.users_collection.find_one({"email": data.email})
    
    # 1. Check if user exists and password is correct
    if not user or not verify_password(data.password, user["password"]):
        create_log("admin_login_failed", None, f"Failed admin login attempt: {data.email}", request)
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    # 2. Check the role field
    if user.get("role") != "admin":
        # Log this specifically! It might be a regular user trying to guess the admin URL
        create_log("admin_access_denied", str(user["_id"]), f"Unauthorized admin access attempt: {data.email}", request)
        raise HTTPException(status_code=403, detail="Access denied: Admins only")

    # 3. Successful Admin Login
    token = create_access_token(
        data={
            "sub": user["email"], 
            "user_id": str(user["_id"]), 
            "role": "admin"
        }
    )
    
    create_log("admin_login_success", str(user["_id"]), f"Admin login success: {data.email}", request)
    
    return {
        "access_token": token, 
        "token_type": "bearer"
    }

@app.get("/me")
def get_me(user_id: str = Depends(get_current_user)):
    require_db()

    user = database.users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "fullName": user["fullName"],
        "email": user["email"],
        "phone": user["phone"]
    }

@app.get("/cases")
def get_cases():
    require_db()
    cases = list(database.cases_collection.find({"deleted": False}))
    for case in cases:
        case["_id"] = str(case["_id"])  # Convert ObjectId to string for JSON
    return cases


@app.get("/cases/{case_id}")
def get_case(case_id: str): # Changed to str
    require_db()
    
    try:
        # We search by _id using the ObjectId wrapper
        case = database.cases_collection.find_one(
            {"_id": ObjectId(case_id), "deleted": False}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Convert _id to string so JSON can handle it
    case["_id"] = str(case["_id"]) 
    return case

@app.get("/cases/view/{slug}")
def get_case_by_slug(slug: str):
    require_db()
    case = database.cases_collection.find_one({"slug": slug, "deleted": False})
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case["_id"] = str(case["_id"])
    return case


@app.get("/my-cases")
def get_my_cases(user_id: str = Depends(get_current_user)):
    require_db()
    cases = list(database.cases_collection.find({"user_id": user_id, "deleted": False}))
    for case in cases:
        case["_id"] = str(case["_id"])
    return cases



# Créez un dossier pour stocker les images
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


@app.post("/cases")
async def create_case(
    request: Request,
    user_id: str = Depends(get_current_user),
    firstName: str = Form(...),
    lastName: str = Form(...),
    age: int = Form(...),
    description: str = Form(...),
    lastSeenLocation: str = Form(...),
    lastSeenDate: str = Form(...),
    reporterName: str = Form(...),
    reporterRelation: str = Form(...),
    reporterPhone: str = Form(...),
    reporterEmail: str = Form(...),
    lastSeenTime: Optional[str] = Form(None),
    photo: UploadFile = File(...)
):
    require_db()
    new_id = get_next_case_id()
    full_name = f"{firstName} {lastName}"
    case_slug = create_slug(full_name) # Generate the slug

    last_seen = lastSeenDate
    if lastSeenTime:
        last_seen += f" at {lastSeenTime}"

    # Image handling using the SLUG instead of ID for better privacy
    file_extension = photo.filename.split(".")[-1]
    file_name = f"{case_slug}.{file_extension}" 
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    case_document = {
        "id": new_id,
        "slug": case_slug, # Added slug to DB
        "user_id": user_id,
        "name": full_name,
        "age": age,
        "lastSeen": last_seen,
        "location": lastSeenLocation,
        "photo": f"/uploads/{file_name}",
        "status": "missing",
        "deleted": False,
        "verified": False,
        "description": description,
        "reporterContact": f"{reporterName} ({reporterRelation})",
        "reporterPhone": reporterPhone,
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

    database.cases_collection.insert_one(case_document)
    
    # Log with slug for better tracking
    create_log("case_created", user_id, f"Case Slug: {case_slug}", request)
    
    case_document["_id"] = str(case_document["_id"])
    return case_document


@app.get("/cases/{case_id}/edit")
def get_case_for_edit(case_id: str, user_id: str = Depends(get_current_user)):
    require_db()

    try:
        query = {"_id": ObjectId(case_id), "user_id": user_id, "deleted": False}
        case = database.cases_collection.find_one(query)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or not authorized")

    case["_id"] = str(case["_id"])
    return case
    

@app.put("/cases/{case_id}")
async def update_case(
    request: Request,
    case_id: str,
    firstName: str = Form(...),
    lastName: str = Form(...),
    age: int = Form(...),
    description: str = Form(...),
    lastSeenLocation: str = Form(...),
    lastSeenDate: str = Form(...),
    reporterName: str = Form(...),
    reporterRelation: str = Form(...),
    reporterPhone: str = Form(...),
    reporterEmail: Optional[str] = Form(None), # Made Optional
    lastSeenTime: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    user_id: str = Depends(get_current_user),
):
    require_db()

    # Query using ObjectId
    query = {"_id": ObjectId(case_id), "user_id": user_id}
    case = database.cases_collection.find_one(query)
    
    if not case:
        raise HTTPException(status_code=404, detail="Not allowed or not found")

    # Combine them back into the DB format
    if lastSeenTime:
        combined_last_seen = f"{lastSeenDate} at {lastSeenTime}"
    else:
        combined_last_seen = lastSeenDate

    update_data = {
        "name": f"{firstName} {lastName}",
        "age": age,
        "description": description,
        "location": lastSeenLocation,
        "reporterContact": f"{reporterName} ({reporterRelation})",
        "reporterPhone": reporterPhone,
        # Ensure we keep these fields updated for the frontend fetch
        "lastSeen": combined_last_seen,
    }

    if photo:
        file_extension = photo.filename.split(".")[-1]
        file_name = f"case_{case_id}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        update_data["photo"] = f"/uploads/{file_name}"

    database.cases_collection.update_one(query, {"$set": update_data})
    
    create_log("case_updated", user_id, f"Case UID: {case_id}", request)
    return {"message": "Case updated successfully"}


@app.patch("/cases/{case_id}/status")
def update_status(request: Request, case_id: str, new_status: str, user_id: str = Depends(get_current_user)):
    require_db()

    # Query using ObjectId
    query = {"_id": ObjectId(case_id), "user_id": user_id}
    case = database.cases_collection.find_one(query)
    
    if not case:
        raise HTTPException(status_code=404)

    database.cases_collection.update_one(
        query,
        {
            "$set": {"status": new_status},
            "$push": {
                "updates": {
                    "date": datetime.now().strftime("%b %d, %Y"),
                    "status": f"Status changed to {new_status}",
                    "type": "status_update",
                }
            }
        }
    )

    # NEW LOG
    create_log("status_changed", user_id, f"Case {case_id} moved to {new_status}", request)
    return {"message": "Status updated"}


@app.patch("/cases/{case_id}/delete")
def delete_case(request: Request, case_id: str, user_id: str = Depends(get_current_user)):
    require_db()

    # Query using ObjectId
    query = {"_id": ObjectId(case_id), "user_id": user_id}
    case = database.cases_collection.find_one(query)
    
    if not case:
        raise HTTPException(status_code=404, detail="Not allowed or not found")

    database.cases_collection.update_one(query, {"$set": {"deleted": True}})

    # NEW LOG
    create_log("case_archived", user_id, f"Case ID: {case_id} was deleted/archived", request)
    return {"message": "Case archived"}


def parse_authority(doc):
    return {
        "name": doc.get("name", "Unknown Authority"),
        "type": doc.get("type", "ngo"),
        "phones": doc.get("phones", []), # Ensure this is an array
        "address": doc.get("address", "Address not available"),
        "hours": doc.get("hours", "Contact for hours"),
        "location": {
            "lat": doc["location"]["coordinates"][1] if "location" in doc else 0,
            "lng": doc["location"]["coordinates"][0] if "location" in doc else 0
        }
    }

@app.get("/api/authorities")
def get_nearest_authorities(lat: float, lng: float):
    require_db()
    
    try:
        pipeline = [
            {
                "$geoNear": {
                    "near": { "type": "Point", "coordinates": [lng, lat] },
                    "distanceField": "dist_meters",
                    "spherical": True
                }
            },
            { "$limit": 4 }
        ]
        
        # Convert cursor to list immediately to catch errors early
        results = list(database.authorities_collection.aggregate(pipeline))
        
        if not results:
            return [] # Return empty list if no authorities found nearby

        output = []
        for doc in results:
            parsed = parse_authority(doc)
            dist = doc.get('dist_meters', 0)
            parsed["distance"] = f"{round(dist / 1000, 1)} km"
            output.append(parsed)
            
        return output
        
    except Exception as e:
        print(f"❌ Geospatial Error: {e}")
        raise HTTPException(status_code=500, detail="Database map index missing or data improperly formatted.")
