from uvicorn import run

if __name__ == "__main__":
    run(app="config:app", host="localhost", port=8000)
