from sqlmodel import SQLModel, create_engine, Session

sqlite_file_name = "expenses.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# check_same_thread=False is needed for FastAPI + SQLite concurrency
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=False, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session