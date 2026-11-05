from sqlalchemy import text
from app.database import engine

try:
    with engine.connect() as connection:
        dialect = engine.dialect.name
        if dialect == "postgresql":
            result = connection.execute(text("SELECT version()"))
            db_name = connection.execute(text("SELECT current_database()")).scalar()
            print("PostgreSQL Database connected successfully!")
            print("PostgreSQL Version:", result.scalar())
            print("Database Name:", db_name)
        else:
            result = connection.execute(text("SELECT sqlite_version()"))
            print("Database engine connected (SQLite local fallback mode)!")
            print("SQLite Version:", result.scalar())
            print("Database URL:", engine.url)

except Exception as e:
    print("Connection Failed!")
    print("Error:", e)
