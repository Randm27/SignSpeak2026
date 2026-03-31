;

const signToText = document.getElementById("sign-to-text");
const textToSign = document.getElementById("text-to-sign");
const switchButton = document.getElementById("switch-button");
const camera_status = document.getElementById("camera_status");

switchButton.addEventListener("click", () =>{
    signToText.classList.toggle("mode-active");  
    signToText.classList.toggle("secondary-mode");

    textToSign.classList.toggle("mode-active");
    textToSign.classList.toggle("secondary-mode");
    const camera_status_value=camera_status.textContent;
    console.log(camera_status_value);
    if(camera_status_value=="camera_on"){
        camera_status.textContent="camera_off";
    }
    else{
        camera_status.textContent="camera_on";
    }
});