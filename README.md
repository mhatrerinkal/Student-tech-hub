# 🎓 Student Tech Hub

A clean, beginner-friendly full-stack web application designed for student developer communities. It demonstrates how a modern frontend (HTML, CSS, JavaScript) connects with a lightweight Python backend (FastAPI) through REST API endpoints.

---

## 📌 Project Overview

**Student Tech Hub** allows students to:
1. **Browse upcoming technical events** (workshops, hackathons, and speaker sessions) fetched dynamically from the FastAPI backend.
2. **Register for events** by submitting their name and email through a clean registration form.
3. **Experience full-stack communication** without the complexity of heavy frameworks, authentication, or external databases.

---

## 📁 Project Structure

```text
student-tech-hub/
├── frontend/
│   ├── index.html        # Clean, responsive HTML5 layout
│   ├── style.css         # Modern, custom CSS styling
│   └── script.js         # Plain JavaScript using fetch() to talk to backend
├── backend/
│   ├── main.py           # FastAPI server with CORS and REST endpoints
│   └── requirements.txt  # Minimal dependencies (FastAPI + Uvicorn)
└── README.md             # Project documentation and setup guide
```

---

## 🚀 Getting Started

Follow these step-by-step instructions to get the backend and frontend up and running on your local machine.

### Prerequisites

Ensure you have **Python 3.8+** installed on your computer:
* **Download Python:** [https://www.python.org/downloads/](https://www.python.org/downloads/)
* *Important for Windows users:* Check the box that says **"Add Python to PATH"** during installation.

---

### Step 1: Install & Run the Backend

1. **Open your terminal** (PowerShell, Command Prompt, or Terminal).
2. **Navigate into the `backend` folder**:
   ```bash
   cd backend
   ```

3. *(Optional but recommended)* Create and activate a Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **Windows (Command Prompt):**
     ```cmd
     python -m venv venv
     venv\Scripts\activate.bat
     ```
   * **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

4. **Install the required packages**:
   ```bash
   pip install -r requirements.txt
   ```
   *(Or on Windows if `pip` is not recognized: `python -m pip install -r requirements.txt`)*

5. **Start the FastAPI backend server**:
   ```bash
   uvicorn main:app --reload
   ```
   *(Or on Windows if `uvicorn` is not recognized: `python -m uvicorn main:app --reload` or simply `python main.py`)*

   > 💡 The `--reload` flag tells Uvicorn to restart automatically whenever you modify `main.py`.

6. **Verify the backend is running**:
   * Open your browser and visit: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   * You should see: `{"status": "online", "message": "Welcome to the Student Tech Hub API!"}`
   * **Interactive API Documentation:** Visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to view and test all endpoints using FastAPI's built-in Swagger UI!

---

### Step 2: Run the Frontend

The frontend is built using standard web technologies and requires no build tools or package managers.

#### Option A: Direct Browser Launch (Simplest)
1. Open your file explorer and navigate to the `frontend/` folder.
2. Double-click **`index.html`** to open it in your default web browser (Chrome, Edge, Firefox, etc.).

#### Option B: Using VS Code Live Server
1. If you use Visual Studio Code, install the **Live Server** extension.
2. Right-click `frontend/index.html` and choose **"Open with Live Server"**.

#### Option C: Using Python's built-in HTTP server
Open a new terminal window and run:
```bash
cd frontend
python -m http.server 3000
```
Then visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 How the Frontend Communicates with the Backend

The frontend and backend communicate over HTTP using **JSON** (JavaScript Object Notation).

```
+------------------------------------+            HTTP Requests (fetch)            +------------------------------------+
|             FRONTEND               | -------------------------------------------> |             BACKEND                |
|       (HTML + CSS + JS)            |                                              |        (Python + FastAPI)          |
|                                    | <------------------------------------------- |                                    |
|  - Renders event cards             |            JSON Responses                    |  - In-memory event database        |
|  - Submits registration form       |                                              |  - Validates and stores signups    |
+------------------------------------+                                              +------------------------------------+
```

### 1. Fetching Events (`GET /api/events`)
* When you click the **"Load Events"** button, the browser executes `loadEvents()` in `frontend/script.js`.
* JavaScript sends an HTTP `GET` request using the `fetch()` function:
  ```javascript
  const response = await fetch("http://127.0.0.1:8000/api/events");
  const data = await response.json();
  ```
* The FastAPI backend receives the request at the `@app.get("/api/events")` endpoint in `backend/main.py` and returns a JSON list of events.
* JavaScript dynamically creates HTML cards for each event and adds them to the page.

### 2. Submitting Registration (`POST /api/register`)
* When a student fills in their **Full Name** and **Email** and clicks **"Register Now"**:
  1. The form submission event is intercepted by `e.preventDefault()`.
  2. JavaScript gathers the input values and packages them into a JSON string:
     ```javascript
     const response = await fetch("http://127.0.0.1:8000/api/register", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ name: name, email: email })
     });
     ```
  3. The FastAPI endpoint `@app.post("/api/register")` receives and validates the data using the Pydantic `RegistrationRequest` model.
  4. The registration is added to an in-memory Python list `REGISTRATIONS_DATABASE`.
  5. The backend returns a confirmation message back to the frontend:
     ```json
     {
       "success": true,
       "message": "Awesome! Alex, your registration was received successfully.",
       "student": { "id": 1, "name": "Alex", "email": "alex@university.edu" }
     }
     ```
  6. The frontend shows a confirmation alert banner and resets the form.

---

## 🛡️ What is CORS and Why Is It Needed?

When developing web applications locally:
* Your **frontend** may run from `file:///...` or `http://localhost:3000`.
* Your **backend** runs on `http://127.0.0.1:8000`.

Web browsers enforce a security mechanism called the **Same-Origin Policy** that prevents scripts running on one origin (port/domain) from accessing resources on another origin.

To allow our frontend to talk to our FastAPI backend, we enabled **CORS (Cross-Origin Resource Sharing)** in `backend/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Allows frontend requests from any origin
    allow_credentials=True,
    allow_methods=["*"],       # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],       # Allows custom headers like Content-Type
)
```
This tells the browser that requests from the frontend are safe and permitted.

---

## 💡 Key Takeaways for Beginners

* **No Complicated Build Steps:** No npm install, no bundlers, no transpilers required.
* **Separation of Concerns:** The frontend only handles presentation and user interaction; the backend handles logic and data serving.
* **Interactive Docs:** FastAPI provides automatic API testing docs at `http://127.0.0.1:8000/docs`.
* **Standard Fetch API:** Modern browsers have built-in `fetch()` so no third-party libraries (like Axios) are needed.
