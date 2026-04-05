async function startCamera() {
  const video = document.getElementById("camera");
  const outputText = document.getElementById("output-text") || document.querySelector(".output-text");

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

      // Force play for mobile Safari/Chrome
      await video.play();

      // Hide placeholder if it exists
      const icon = document.querySelector('.camera-placeholder-icon');
      if (icon) icon.style.display = 'none';

      // Single interval for frame analysis
      setInterval(async () => {
          const result = await sendFrameToBackend();
          if (result && result.gesture && outputText) {
              outputText.textContent += result.gesture;
          }
      }, 60 * 1000);

  } catch (err) {
      console.error("Camera Error:", err);
      alert("Make sure you are on HTTPS and have granted camera permissions.");
  }
}

function captureFrame() {
  const video = document.getElementById("camera");
  const canvas = document.getElementById("canvas");
  
  // Safety check: ensure video is actually playing and has dimensions
  if (!video || video.readyState < 2 || video.videoWidth === 0) return null;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.7); // 0.7 compression helps mobile upload speed
}

// Logic to handle mobile vs desktop start
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
      // Desktop can usually auto-start, but many browsers now prefer a click here too
      startCamera();
  }
}

document.addEventListener("DOMContentLoaded", initApp);
async function sendFrameToBackend() {
  const el = document.getElementById("camera_status");
  if (!el) return null;
  
  const camera_status_value = el.textContent;  if(camera_status_value=="camera_off"){
    return ;
  }
  const frame = captureFrame();
  if(!frame) return null;

  console.log();
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
};

document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  if (isMobile) {
      const btn = document.getElementById("startBtn");
      if (btn) {
          btn.style.display = "block";

          btn.onclick = () => {
              startCamera();
              btn.style.display = "none";
          };
      }
  } else {
      startCamera();
  }
});
// document.addEventListener("DOMContentLoaded", () => {
//   console.log("JS running and DOM loaded"); // debug line
//   initCamera(); // we will create this function to start the camera / button logic
// });