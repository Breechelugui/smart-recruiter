from fastapi import FastAPI

app = FastAPI(title="Test API")

@app.get("/")
def root():
    return {"message": "Test working"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("test_app:app", host="0.0.0.0", port=8000, reload=True)
