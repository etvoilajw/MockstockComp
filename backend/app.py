from server import app

if __name__ == "__main__":
    app.run(
        threaded=False,
        host="0.0.0.0",
        processes=1,
        port=5080,
    )
