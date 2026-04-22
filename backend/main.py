from fastapi import FastAPI, Depends, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlmodel import col
from contextlib import asynccontextmanager
from typing import List, Optional
from database import create_db_and_tables, get_session
from models import Expense, ExpenseCreate, ExpenseRead

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan, title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Removed the hardcoded status_code=201 from the decorator
@app.post("/expenses", response_model=ExpenseRead)
def create_expense(
    expense: ExpenseCreate, 
    response: Response, 
    session: Session = Depends(get_session)
):
    """
    Creates a new expense. Uses idempotency_key to safely handle network retries.
    Returns 201 if created, 200 if the record already exists.
    """
    # 1. Check if the idempotency key already exists
    existing_expense = session.exec(
        select(Expense).where(Expense.idempotency_key == expense.idempotency_key)
    ).first()
    
    if existing_expense:
        # If it exists, return 200 OK and the existing record
        response.status_code = 200
        return existing_expense

    # 2. If it does not exist, create it
    db_expense = Expense.model_validate(expense)
    session.add(db_expense)
    session.commit()
    session.refresh(db_expense)
    
    # Set status to 201 Created for a new record
    response.status_code = 201
    return db_expense

@app.get("/expenses", response_model=List[ExpenseRead])
def get_expenses(
    category: Optional[str] = Query(None, description="Filter by category"),
    sort: Optional[str] = Query(None, description="Sort order, e.g., date_desc"),
    session: Session = Depends(get_session)
):
    query = select(Expense)
    
    if category:
        # Uses case-insensitive partial matching (e.g. "foo" matches "Food")
        query = query.where(col(Expense.category).like(f"%{category}%"))
        
    if sort == "date_desc":
        query = query.order_by(Expense.date.desc(), Expense.created_at.desc())
        
    results = session.exec(query).all()
    return results