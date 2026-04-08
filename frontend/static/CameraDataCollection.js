let intervalId = null;
let isRunning = false;
let countdownInterval = null;
let cameraInitialized = false; // Add this flag

async function startCamera() {
  // Prevent double initialization
  if (cameraInitialized) return;
  cameraInitialized = true;
  
  const video = document.getElementById("camera");
  const outputText = document.getElementById("output-text") || document.querySelector(".output-text");
  const start_stopButton = document.getElementById("start-and-stop");

  try {
    const constraints = {
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    await video.play().catch(err => console.error("Video play error:", err));

    const icon = document.querySelector('.camera-placeholder-icon');
    if (icon) icon.style.display = 'none';

    start_stopButton.addEventListener("click", () => {
      if (isRunning) {
        clearInterval(intervalId);
        clearInterval(countdownInterval);
        intervalId = null;
        countdownInterval = null;
        isRunning = false;
        return;
      }

      outputText.textContent = "";
      isRunning = true;

      startCountdown();

      intervalId = setInterval(async () => {
        startCountdown();
        const result = await sendFrameToBackend();
        if (result && result.gesture && outputText) {
          outputText.textContent += result.gesture;
        }
      }, 5 * 1000);
    });

  } catch (err) {
    console.error("Camera Error:", err);
    alert("Make sure you are on HTTPS and have granted camera permissions.");
    cameraInitialized = false; // Reset flag on error
  }
}

function startCountdown() {
  const countdownEl = document.getElementById("countdown");
  if (!countdownEl) return;

  let timeLeft = 5;
  countdownEl.textContent = timeLeft;

  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    timeLeft--;
    countdownEl.textContent = timeLeft;
    if (timeLeft <= 1) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

window.addEventListener("load", startCamera);

function captureFrame() {
  const video = document.getElementById("camera");
  const canvas = document.getElementById("canvas");
  
  if (!video || video.readyState < 2 || video.videoWidth === 0) return null;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.7);
}

function initApp() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches;
  const btn = document.getElementById("startBtn");

  if (isMobile && btn) {
      btn.style.display = "block";
      btn.onclick = () => {
          startCamera();
          btn.style.display = "none";
      };
  } else {
      startCamera();
  }
}

document.addEventListener("DOMContentLoaded", initApp);

async function sendFrameToBackend() {
  const el = document.getElementById("camera_status");
  if (!el) return null;
  
  const camera_status_value = el.textContent;
  if(camera_status_value=="camera_off"){
    return;
  }
  
  const frame = captureFrame();
  if(!frame) return null;

  const { SERVER_GESTURE_URL } = getconfig();

  const response = await fetch(`${SERVER_GESTURE_URL}/analyze-frame`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({image: frame})
  });

  const data = await response.json();
  return data;
}