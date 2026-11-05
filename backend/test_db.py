from sqlalchemy import text
from app.database import engine

try:
    with engine.connect() as connection:

        result = connection.execute(text("SELECT version()"))
        print("Database connected successfully!")

        print("PostgreSQL Version:")
        print(result.scalar())

        result = connection.execute(text("SELECT current_database()"))
        print("Database Name:", result.scalar())

except Exception as e:
    print("Connection Failed!")
    print("Error:", e)