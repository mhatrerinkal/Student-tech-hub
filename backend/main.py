"""
Student Tech Hub - Backend API
Built with Python and FastAPI.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize the FastAPI application
app = FastAPI(
    title="Student Tech Hub API",
    description="A beginner-friendly REST API for managing technical events and student registrations.",
    version="1.0.0"
)

# ---------------------------------------------------------------------------
# CORS (Cross-Origin Resource Sharing) Configuration
# ---------------------------------------------------------------------------
# Browsers block requests between different ports (e.g. frontend at file:// or port 5500
# and backend at port 8000) for security. Adding CORSMiddleware allows our frontend to communicate
# with our FastAPI backend without being blocked.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Allows requests from any origin (ideal for local development)
    allow_credentials=True,
    allow_methods=["*"],       # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],       # Allows all HTTP headers
)

# ---------------------------------------------------------------------------
# Data Models (Pydantic)
# ---------------------------------------------------------------------------
# Defines the expected shape of data when a student registers.
class RegistrationRequest(BaseModel):
    name: str
    email: str

# ---------------------------------------------------------------------------
# In-Memory Sample Data (No complex database needed!)
# ---------------------------------------------------------------------------
# Sample upcoming technical events for students
EVENTS_DATABASE = [
    {
        "id": 1,
        "title": "Web Development Fundamentals",
        "category": "Frontend",
        "date": "October 15, 2026",
        "time": "4:00 PM - 5:30 PM",
        "location": "Tech Hall 101 & Online",
        "speaker": "Sarah Jenkins (Full-Stack Engineer)",
        "description": "Learn the essentials of HTML5, modern CSS layouts, and interactive JavaScript to build your first web apps from scratch."
    },
    {
        "id": 2,
        "title": "Python & Data Science Workshop",
        "category": "Data & AI",
        "date": "October 22, 2026",
        "time": "5:00 PM - 6:30 PM",
        "location": "Innovation Lab 3",
        "speaker": "Dr. Michael Chen (AI Researcher)",
        "description": "Discover Python libraries like Pandas and Matplotlib. Clean data, generate insights, and build simple machine learning models."
    },
    {
        "id": 3,
        "title": "Campus Hackathon 2026: Code the Future",
        "category": "Hackathon",
        "date": "November 5-6, 2026",
        "time": "9:00 AM (24 Hours)",
        "location": "Main Campus Arena",
        "speaker": "Student Tech Hub Community",
        "description": "Collaborate in teams of 2 to 4 to design, build, and pitch real-world software solutions. Mentors and prizes provided!"
    },
    {
        "id": 4,
        "title": "Git & GitHub for Team Projects",
        "category": "Tools",
        "date": "November 12, 2026",
        "time": "3:30 PM - 4:45 PM",
        "location": "Online via Zoom",
        "speaker": "Liam Patel (Open Source Contributor)",
        "description": "Master version control, branches, pull requests, and merge conflict resolution to work seamlessly on team projects."
    },
    {
        "id": 5,
        "title": "Cloud & API Deployment 101",
        "category": "DevOps",
        "date": "November 19, 2026",
        "time": "4:00 PM - 5:30 PM",
        "location": "Computer Lab B",
        "speaker": "Elena Rostova (Cloud Architect)",
        "description": "Learn how to take your local backend API and deploy it live to the web using modern cloud platforms and container concepts."
    }
]

# In-memory list to store registrations submitted via POST
REGISTRATIONS_DATABASE = []

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def read_root():
    """
    Health check and welcome endpoint.
    Visiting http://localhost:8000/ shows this message.
    """
    return {
        "status": "online",
        "message": "Welcome to the Student Tech Hub API!",
        "endpoints": {
            "events": "/api/events",
            "register": "/api/register",
            "docs": "/docs"
        }
    }


@app.get("/api/events")
def get_events():
    """
    Returns the list of upcoming technical events.
    """
    return {
        "success": True,
        "count": len(EVENTS_DATABASE),
        "events": EVENTS_DATABASE
    }


@app.post("/api/register")
def register_student(registration: RegistrationRequest):
    """
    Accepts student registration with name and email.
    Validates input and stores it in the in-memory database.
    """
    # Simple input validation
    clean_name = registration.name.strip()
    clean_email = registration.email.strip()

    if not clean_name:
        raise HTTPException(status_code=400, detail="Name cannot be empty.")

    if not clean_email or "@" not in clean_email or "." not in clean_email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")

    # Create new record
    new_entry = {
        "id": len(REGISTRATIONS_DATABASE) + 1,
        "name": clean_name,
        "email": clean_email
    }

    # Save to our in-memory list
    REGISTRATIONS_DATABASE.append(new_entry)

    # Return friendly confirmation response
    return {
        "success": True,
        "message": f"Awesome! {clean_name}, your registration was received successfully.",
        "student": new_entry
    }


# Helpful for local execution via `python main.py`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
