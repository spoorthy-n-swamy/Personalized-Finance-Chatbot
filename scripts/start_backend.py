#!/usr/bin/env python3
"""
Script to start the Personal Finance Chatbot backend server
"""
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing backend requirements...")
    subprocess.check_call([
        sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"
    ])

def start_server():
    """Start the FastAPI server"""
    print("Starting Personal Finance Chatbot backend server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    
    os.chdir("backend")
    subprocess.run([
        "uvicorn", "main:app", 
        "--host", "0.0.0.0", 
        "--port", "8000", 
        "--reload"
    ])

if __name__ == "__main__":
    try:
        install_requirements()
        start_server()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
