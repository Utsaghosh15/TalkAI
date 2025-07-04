import subprocess
import sys
import os

def start_chroma_server():
    """Start ChromaDB server using the CLI"""
    print("🚀 Starting ChromaDB server on http://localhost:8000")
    print("📊 Database will be persisted at ./chroma_data")
    print("Press Ctrl+C to stop the server...")
    
    # Start ChromaDB server using the CLI
    cmd = [
        "chroma", "run",
        "--host", "localhost",
        "--port", "8000",
        "--path", "./chroma_data"
    ]
    
    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start ChromaDB server: {e}")

if __name__ == "__main__":
    start_chroma_server()