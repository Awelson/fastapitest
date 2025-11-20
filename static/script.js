const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearButton');
const invertedImage = document.getElementById('invertedImage');

let isDrawing = false;

// Set initial drawing properties
ctx.lineWidth = 4;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    throttledSendCanvasToServer();
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx.closePath();
});

canvas.addEventListener('mouseout', () => {
    isDrawing = false;
    ctx.closePath();
});

clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    invertedImage.src = ""; // Clear the inverted image as well
});

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

const throttledSendCanvasToServer = throttle(sendCanvasToServer, 20); // 100ms throttle

async function sendCanvasToServer() {
    // Convert canvas to Blob
    canvas.toBlob(async (blob) => {
        if (!blob) {
            console.error("Failed to create blob from canvas.");
            return;
        }

        const formData = new FormData();
        formData.append('file', blob, 'drawing.png');

        try {
            const response = await fetch('/invert-image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                invertedImage.src = imageUrl;
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }, 'image/png');
}

// Initial clear to ensure white background
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);