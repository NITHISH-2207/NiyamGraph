"""
Vercel Serverless Function entry point for NiyamGraph FastAPI backend.
Enables serverless execution under @vercel/python.
"""
import sys
import os

# Insert backend directory into sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")
if os.path.isdir(backend_dir) and backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

# Vercel's Python runtime discovers 'app' ASGI instance
__all__ = ["app"]
