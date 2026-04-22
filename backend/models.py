from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

class ExpenseBase(SQLModel):
    # Storing amount in cents ensures production-level money handling
    amount: int = Field(description="Amount in cents")
    category: str
    description: str
    date: str = Field(description="ISO format date string: YYYY-MM-DD")
    
    # Crucial for idempotency (handling duplicate submissions)
    idempotency_key: str = Field(unique=True, index=True)

class Expense(ExpenseBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseRead(ExpenseBase):
    id: int
    created_at: datetime