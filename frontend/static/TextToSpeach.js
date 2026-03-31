const listenBtn = document.getElementById('listenBtn');
const outputArea = document.getElementById('outputArea');

listenBtn.addEventListener('click', () => {
    const text = outputArea.value;
    if (text.trim() !== "") {
        window.speechSynthesis.cancel(); // Stop any existing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; 
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Please simplify some text first so I have something to read!");
    }
});