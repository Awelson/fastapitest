from typing import Optional
import cv2
import numpy as np

from fastapi import FastAPI, UploadFile, File, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Mount the 'static' directory
app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return FileResponse("index.html")

@app.post("/invert-image")
async def invert_image(file: UploadFile = File(...)):
    # Read the image file
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Invert the image
    inverted_img = cv2.bitwise_not(img)

    # Encode the inverted image back to PNG format
    is_success, buffer = cv2.imencode(".png", inverted_img)
    if not is_success:
        return Response(status_code=500, content="Error encoding image")

    # Return the inverted image
    return Response(content=buffer.tobytes(), media_type="image/png")