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

    const { SERVER_SIMPLIFY_URL } = getconfgi();

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