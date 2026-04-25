;

function showLoader() {
    document.getElementById("outputArea").style.display = "none";
    document.querySelector(".loader-container").style.display = "flex";
}
function hideLoader() {
    document.getElementById("outputArea").style.display = "block";
    document.querySelector(".loader-container").style.display = "none";
}


async function sendTextToBackend() {
    const inputText = document.getElementById("inputArea").value;
    showLoader();

    const { SERVER_SIMPLIFY_URL } = getconfig();

    const response = await fetch(`${SERVER_SIMPLIFY_URL}/simplify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: inputText })
    });

    const data = await response.json();

    hideLoader();

    document.getElementById("outputArea").textContent = data.simplified;
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        // If typing in a box, let Enter work normally unless Ctrl is held
        if (event.target.tagName === "TEXTAREA" && !event.ctrlKey) {
            return; 
        }

        event.preventDefault(); 
        sendTextToBackend(); // Triggers the action
    }
});