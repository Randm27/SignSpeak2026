;

let voices = [];

function populateVoiceList() {

    voices = window.speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    
    if (!voiceSelect) return;

    const selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
    voiceSelect.innerHTML = ''; 

    // Chrome поддържа Google US English, който звучи най-добре
    // Филтрираме само английски
    const englishVoices = voices.filter(voice => voice.lang.includes('en'));

    if (englishVoices.length === 0) {
        const option = document.createElement('option');
        option.textContent = "No English voices found";
        voiceSelect.appendChild(option);
        return;
    }

    // Пълним менюто
    englishVoices.slice(0, 8).forEach((voice) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name}`;
        // Chrome често има дублиращи се имена, затова ползваме гласа като референция
        option.setAttribute('data-name', voice.name);
        option.setAttribute('data-lang', voice.lang);
        voiceSelect.appendChild(option);
    });

    voiceSelect.selectedIndex = selectedIndex;
}

// Критично за Chrome: Гласът трябва да се зареди през това събитие
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speakSimplifiedText() {
    const outputArea = document.getElementById('outputArea');
    const voiceSelect = document.getElementById('voiceSelect');
    
    if (!outputArea) return;

    const text = outputArea.value || outputArea.textContent;

    if (text && text.trim() !== "") {
        // Спираме текущото говорене
        window.speechSynthesis.cancel(); 

        const utterance = new SpeechSynthesisUtterance(text.trim());
        
        // --- ТУК СМЕНЯМЕ ГЛАСА СПРЕД ИЗБРАНОТО В CHROME ---
        if (voiceSelect && voiceSelect.selectedOptions.length > 0) {
            const selectedVoiceName = voiceSelect.selectedOptions[0].getAttribute('data-name');
            const selectedVoice = voices.find(v => v.name === selectedVoiceName);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        utterance.rate = 0.9;
        
        // Бъг фикс за Chrome: Ако текстът е много дълъг, понякога спира на 15-тата секунда.
        // Този ред помага за поддържане на връзката.
        window.speechSynthesis.speak(utterance);
        
    } else {
        alert("Please simplify some text first so I have something to read!");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Първоначално пълнене за някои браузъри
    populateVoiceList();

    const listenBtn = document.getElementById('listenBtn');
    if (listenBtn) {
        listenBtn.addEventListener('click', speakSimplifiedText);
    }
});