# Beginner Setup Guide - Smart Food Distribution Platform

This step-by-step guide is written specifically for students and beginners to run the project smoothly on Windows, macOS, or Linux.

---

## 1. System Prerequisites

Before starting, ensure you have the following installed on your computer:
1. **Python** (version 3.10 or higher): [Download Python](https://www.python.org/downloads/)
   - *Note for Windows users*: Check the box **"Add Python to PATH"** during installation.
2. **Node.js** (version 18 or higher): [Download Node.js](https://nodejs.org/)

---

## 2. Quick-Start (Run in Under 3 Minutes)

The project includes an automatic fallback system. By default, it runs with a local SQLite database (`smart_food.db`) so you **do not** need to install or configure MySQL to run and test all features immediately!

### Step 2.1: Open Two Terminal Windows
Open two PowerShell or Command Prompt windows:
- **Terminal 1**: For the Python FastAPI Backend.
- **Terminal 2**: For the React + Vite Frontend.

---

### Step 2.2: Start the Backend (Terminal 1)

1. Open PowerShell and navigate to the project directory:
```powershell
cd "c:\Users\ganga\OneDrive\Desktop\smart food distribution platform\SmartFoodDistribution"
```

2. Create and activate a Python virtual environment:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*(On Linux/macOS: `source venv/bin/activate`)*

3. Install required Python packages:
```powershell
pip install -r backend/requirements.txt
```

4. Launch the FastAPI server:
```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

> [!NOTE]
> On the very first launch, the server will automatically create all database tables and seed realistic demo accounts (`donor@demo.com`, `ngo@demo.com`, `beneficiary@demo.com`, `admin@demo.com`) with password `password123`.

You should see:
```text
INFO: Application startup complete.
INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

You can test that the backend is working by visiting:
- **API Health**: `http://localhost:8000/`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`

---

### Step 2.3: Start the Frontend (Terminal 2)

1. Open a second terminal window and navigate to the `frontend/` folder:
```powershell
cd "c:\Users\ganga\OneDrive\Desktop\smart food distribution platform\SmartFoodDistribution\frontend"
```

2. Install dependencies:
```powershell
npm install
```

3. Launch the Vite development server:
```powershell
npm run dev
```

You will see:
```text
  VITE v5.3.1  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

4. Open your browser and go to:
👉 **`http://localhost:5173`**

---

## 3. Optional: Connecting to a Local MySQL Server

If your evaluator specifically requires MySQL:

1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or MySQL CLI).
2. Execute the provided schema file:
```sql
SOURCE database/schema.sql;
```
3. Open `.env` (or `backend/.env`) and update the `DATABASE_URL` line:
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/smart_food_db
```
4. Restart the FastAPI backend server. It will automatically connect to your MySQL database!

---

## 4. Troubleshooting Common Questions

### Q1: PowerShell says "running scripts is disabled on this system"
Run this command in PowerShell as Administrator to allow virtual environments:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Q2: What are the demo login credentials?
- **Donor**: `donor@demo.com` / `password123`
- **NGO**: `ngo@demo.com` / `password123`
- **Beneficiary**: `beneficiary@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`
Or simply click the **1-Click Demo Login** buttons on the Login page!

### Q3: How do I stop the servers?
Press `Ctrl + C` in each terminal window.
