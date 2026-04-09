;

const signToText = document.getElementById("sign-to-text");
const textToSign = document.getElementById("text-to-sign");
const switchButton = document.getElementById("switch-button");
const camera_status = document.getElementById("camera_status");
const textInput = document.getElementById("text-input");

switchButton.addEventListener("click", () =>{
    signToText.classList.toggle("mode-active");  
    signToText.classList.toggle("secondary-mode");

    textToSign.classList.toggle("mode-active");
    textToSign.classList.toggle("secondary-mode");

    const timer = document.getElementById("countdown");
    if(timer){
        if(signToText.classList.contains("mode-active")){
            timer.style.display = "block";
        }
        else{
            timer.style.display = "none";
        }
    }

    const camera_status_value=camera_status.textContent;
    console.log(camera_status_value);
    if(camera_status_value=="camera_on"){
        camera_status.textContent="camera_off";
    }
    else{
        camera_status.textContent="camera_on";
    }
});

// Handle text input to display images in grid (ONLY in text-to-sign mode)
if (textInput) {
    textInput.addEventListener("input", (e) => {
        // Only trigger grid display if text-to-sign mode is active
        if (textToSign.classList.contains("mode-active")) {
            const text = e.target.value.trim();
            displayTextToSignGrid(text, 'image-grid-container');
        }
    });
}