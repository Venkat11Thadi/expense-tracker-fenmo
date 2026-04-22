# Minimalist Expense Tracker - Fenmo Assessment

A full-stack, production-ready minimalist expense tracker built to handle real-world network conditions, focusing on data integrity, idempotency, and a resilient user experience.

## Live Links
* **Live Application:** [Insert Vercel Link Here]
* **Backend API:** [[Render link](https://expense-tracker-fenmo.onrender.com/)]
* **GitHub Repository:** [https://github.com/Venkat11Thadi/expense-tracker-fenmo]

## Tech Stack
* **Backend:** Python, FastAPI, SQLModel, SQLite
* **Frontend:** React (Vite), Tailwind CSS v4, Lucide React (Icons)

---

## 🏗️ Key Design Decisions & Data Correctness

### 1. Financial Data Integrity (No Floating Point Errors)
Floating-point math is notorious for precision loss, which is unacceptable for financial applications. To ensure absolute correctness, all currency amounts are multiplied by 100 on the frontend and stored as **integers (cents)** in the database. They are only converted back to decimals at the very end of the UI rendering pipeline.

### 2. Network Resilience & Idempotency
To handle users double-clicking the "Submit" button or browsers refreshing during a slow network call, the application implements strict idempotency. 
* The frontend generates a unique UUID (`idempotency_key`) for every new transaction. 
* The backend checks this key before insertion. If a network retry occurs with an existing key, the API safely catches it and returns a `200 OK` with the existing record rather than creating a duplicate charge or crashing with a `500 Server Error`.

### 3. Accessible, High-Contrast UX
The UI utilizes a custom "Nordic Sage" aesthetic. Actions (like Edit and Delete) are permanently visible rather than hidden behind hover states to ensure full accessibility across both desktop and touchscreen devices. The frontend also implements case-insensitive partial matching for category filtering, significantly improving the user experience over strict exact-match searches.

---

## ⚖️ Trade-offs Due to the 4-Hour Timebox

* **Database Selection:** SQLite was chosen to provide zero-config relational persistence that could be spun up and deployed instantly. In a true production environment, this would be swapped for PostgreSQL to handle high concurrency.
* **Pagination:** The `GET /expenses` endpoint currently returns the entire list of filtered expenses. To meet the timebox, I omitted pagination. In production, cursor-based or offset/limit pagination would be necessary to handle scale.
* **Inline Form Editing:** For the "Edit" functionality, the app populates the main creation form rather than using inline table editing or a dedicated modal. This allowed me to reuse state logic and components efficiently while still satisfying the UX requirement for "User Control and Freedom."

---

## 🚫 Intentionally Omitted

* **Authentication & User Context:** User accounts, login flows, and JWT authorizations were intentionally omitted. The assessment explicitly stated to keep the feature set small, so I prioritized the core resilience and idempotency of the expense logic over building out an auth layer.
* **Automated Test Suites:** While highly valuable for production, setting up `pytest` and `jest` environments would have consumed a significant portion of the timebox. I opted to focus entirely on robust manual edge-case handling (idempotency blocks, input validation, state management) within the app itself.
* **Complex Data Visualizations:** A dashboard or charting library (like Recharts) for category summaries was skipped to ensure the core CRUD operations and filtering mechanisms were absolutely bulletproof.

---

## 🚀 How to Run Locally

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `pip install -r requirements.txt` *(Note: requires fastapi, uvicorn, sqlmodel)*
3. Run the development server: `uvicorn main:app --reload`
4. The API will be available at `http://127.0.0.1:8000` (Swagger UI at `/docs`).

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. The application will be available at `http://localhost:5173`.
