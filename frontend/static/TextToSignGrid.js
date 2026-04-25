async function displayTextToSignGrid(text, containerId = 'image-grid-container') {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!text || text.trim().length === 0) {
            container.innerHTML = '';
            return;
        }

        const cfg = typeof getconfig === 'function'
            ? getconfig()
            : { SERVER_GESTURE_URL: "http://127.0.0.1:5001" };
        
        const response = await fetch(`${cfg.SERVER_GESTURE_URL}/get-images-for-text/${encodeURIComponent(text)}`);
        
        if (!response.ok) {
            console.error('Error fetching images');
            container.innerHTML = '';
            return;
        }

        const data = await response.json();

        // ✅ pass original text
        displayImageGrid(data, container, text);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayImageGrid(data, container, originalText) {
    container.innerHTML = '';
    if (!data.images || data.images.length === 0) return;

    const gridWrapper = document.createElement('div');
    gridWrapper.style.display = 'flex';
    gridWrapper.style.flexDirection = 'column'; // stack words vertically
    gridWrapper.style.gap = '15px';
    gridWrapper.style.padding = '15px';
    gridWrapper.style.backgroundColor = '#f9f9f9';
    gridWrapper.style.borderRadius = '10px';
    gridWrapper.style.border = '2px solid #26b5a3'; // ✅ border stays

    // 🔑 split words from original text
    const words = originalText.trim().split(/\s+/);

    let imageIndex = 0;

    words.forEach(word => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.flexWrap = 'wrap';
        row.style.gap = '12px';

        for (let i = 0; i < word.length; i++) {
            const imageObj = data.images[imageIndex++];
            if (!imageObj) break;

            const card = document.createElement('div');
            card.style.backgroundColor = 'white';
            card.style.borderRadius = '6px';
            card.style.textAlign = 'center';
            card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            card.style.width = '140px';

            const img = document.createElement('img');
            img.src = imageObj.data;
            img.style.width = '100%';
            img.style.height = '130px';
            img.style.objectFit = 'cover';

            const label = document.createElement('div');
            label.textContent = (imageObj.letter || imageObj.character).toUpperCase();
            label.style.padding = '5px';
            label.style.fontWeight = 'bold';
            label.style.color = '#26b5a3';

            card.appendChild(img);
            card.appendChild(label);
            row.appendChild(card);
        }

        gridWrapper.appendChild(row);
    });

    container.appendChild(gridWrapper);
}

// make globally accessible
window.displayTextToSignGrid = displayTextToSignGrid;