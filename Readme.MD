# Minimalist Expense Tracker - Fenmo Assessment

A full-stack, production-ready minimalist expense tracker built to handle real-world network conditions, focusing on data integrity, idempotency, and a resilient user experience.

## Live Links
* **Live Application:** [[Vercel link](https://expense-tracker-fenmo-jet.vercel.app)]
* **Backend API:** [[Render link](https://expense-tracker-fenmo.onrender.com/)]
* **GitHub Repository:** [[Github link](https://github.com/Venkat11Thadi/expense-tracker-fenmo)]

---

## ✨ Core Features
* **Full CRUD Functionality:** Seamlessly create, view, update, and delete expense entries.
* **Smart Filtering & Sorting:** Case-insensitive partial matching for category searches, with automatic date-descending sorts.
* **Network-Resilient Submissions:** Built-in idempotency prevents duplicate charges if the user double-clicks or the network drops.
* **Dynamic Total Calculation:** Instantly calculates and displays the total sum of currently visible (filtered) expenses.

## 🛠️ Tech Stack
**Backend**
* **Framework:** FastAPI (Python) - Chosen for its high performance and automatic OpenAPI documentation generation.
* **ORM & Validation:** SQLModel (Pydantic + SQLAlchemy) - Drastically reduces boilerplate for schema validation and database operations.
* **Database:** SQLite - Provides persistent relational storage with zero external configuration.

**Frontend**
* **Framework:** React + Vite - For blazing-fast hot module replacement and an optimized production build.
* **Styling:** Tailwind CSS v4 - Utilized for rapid, utility-first styling without external stylesheets.
* **Icons:** Lucide React - For clean, lightweight vector icons.

---

## 🏗️ Architecture & Key Design Decisions

### 1. Financial Data Integrity (No Floating Point Errors)
Floating-point math is notorious for precision loss, which is unacceptable for financial applications. To ensure absolute correctness, all currency amounts are multiplied by 100 on the client-side and stored as **integers (cents)** in the database. They are only parsed back to floating-point decimals at the very end of the UI rendering pipeline.

### 2. Network Resilience & Idempotency
To handle unreliable networks (e.g., users mashing the "Submit" button, or browser retries on slow connections), the application implements strict API idempotency. 
* The frontend generates a unique UUID (`idempotency_key`) for every *new* transaction. 
* The backend verifies this key before insertion. If a network retry occurs with an existing key, the API safely catches the `IntegrityError` and returns a `200 OK` with the existing record, avoiding duplicate records or `500 Server Errors`.

### 3. Accessible, "Notion-Style" UX
The UI was built with a strict minimalist aesthetic, utilizing a custom "Nordic Sage" color palette to reduce optical glare. Data is organized into clean, structured card layouts. Crucially, primary actions (Edit/Delete) are permanently visible rather than hidden behind hover states, ensuring the application remains fully accessible and usable on touchscreens.

---

## ⚖️ Trade-offs (4-Hour Timebox Constraints)

* **Database Selection:** SQLite was chosen to provide immediate persistence that could be deployed instantly. In a true production environment with high concurrency, this would be migrated to PostgreSQL. Note: Render's free tier utilizes ephemeral storage, meaning the SQLite database resets when the server spins down.
* **Pagination:** The `GET /expenses` endpoint currently returns the entire list of filtered expenses. To meet the timebox, I omitted pagination. At scale, cursor-based or offset/limit pagination would be required.
* **Form Reuse:** For the "Edit" functionality, the app re-populates the main creation form at the top of the page rather than utilizing inline table editing or a dedicated modal. This allowed for efficient component reuse while still satisfying the UX heuristic of "User Control and Freedom."

---

## 🚫 Intentionally Omitted

* **Authentication & User Context:** User accounts, login flows, and session management were omitted. Per the assessment guidelines to keep the feature set minimal, I prioritized the core resilience and financial logic over an auth layer.
* **Automated Test Suites:** Setting up `pytest` and `jest` environments would have consumed a significant portion of the timebox. I opted to focus entirely on robust manual edge-case handling (idempotency blocks, input validation, state transitions) within the application itself.

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
