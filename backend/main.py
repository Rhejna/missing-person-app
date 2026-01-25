from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # allow all headers
)

# --- Dummy data (NO DB YET) ---
cases = [
    {
        "id": 1,
        "name": "Samuel Nkomo",
        "age": 34,
        "lastSeen": "Jan 10, 2025 at 2:00 PM",
        "location": "Deido, Douala",
        "photo": "/missing-person-male.jpg",
        "status": "missing",
        "verified": True,
        "description": "Last seen wearing blue shirt and dark pants near the market",
        "reporterContact": "Jane Nkomo (Sister)",
        "reporterPhone": "+237600000001",
        "reportedDate": "Jan 10, 2025",
        "caseNumber": "MISS-2025-0001",
        "updates": [
            {
                "date": "Jan 12, 2025",
                "status": "Possible sighting near Bonanjo reported",
                "type": "sighting",
            },
            {
                "date": "Jan 10, 2025",
                "status": "Case reported and verified",
                "type": "reported",
            },
        ],
        "comments": [
            {
                "id": 1,
                "author": "Anonymous",
                "verified": False,
                "date": "Jan 11, 2025",
                "text": "I saw someone matching this description near the central market yesterday around 3 PM",
            }
        ],
    },
    {
        "id": 2,
        "name": "Brenda Eyenga",
        "age": 19,
        "lastSeen": "Feb 2, 2025 at 6:30 PM",
        "location": "Bastos, Yaoundé",
        "photo": "/missing-person-female.jpg",
        "status": "found",
        "verified": True,
        "description": "Left home after an argument, phone unreachable",
        "reporterContact": "Paul Eyenga (Father)",
        "reporterPhone": "+237600000002",
        "reportedDate": "Feb 3, 2025",
        "caseNumber": "MISS-2025-0002",
        "updates": [
            {
                "date": "Feb 4, 2025",
                "status": "Found safe at a friend’s place",
                "type": "found",
            }
        ],
        "comments": [],
    },
]

# --- Routes ---

@app.get("/")
def root():
    return {"status": "API is running"}

@app.get("/cases")
def get_cases():
    return cases

@app.get("/cases/{case_id}")
def get_case(case_id: int):
    for case in cases:
        if case["id"] == case_id:
            return case
    raise HTTPException(status_code=404, detail="Case not found")