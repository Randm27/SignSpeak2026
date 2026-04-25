async function displayTextToSignGrid(text, containerId = 'image-grid-container') {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!text || text.trim().length === 0) {
            container.innerHTML = '';
            return;
        }

        const cfg = typeof getconfig === 'function' ? getconfig() : { SERVER_GESTURE_URL: "http://127.0.0.1:5001" };
        
        // Използваме URL от твоя конфигурационен файл
        const response = await fetch(`${cfg.SERVER_GESTURE_URL}/get-images-for-text/${encodeURIComponent(text)}`);
        
        if (!response.ok) {
            console.error('Error fetching images');
            container.innerHTML = '';
            return;
        }

        const data = await response.json();
        displayImageGrid(data, container);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayImageGrid(data, container) {
    container.innerHTML = '';
    if (!data.images || data.images.length === 0) return;

    const gridWrapper = document.createElement('div');
    gridWrapper.style.display = 'grid';
    gridWrapper.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
    gridWrapper.style.gap = '12px';
    gridWrapper.style.padding = '15px';
    gridWrapper.style.backgroundColor = '#f9f9f9';
    gridWrapper.style.borderRadius = '10px';
    gridWrapper.style.border = '2px solid #26b5a3';

    data.images.forEach((imageObj) => {
        const card = document.createElement('div');
        card.style.backgroundColor = 'white';
        card.style.borderRadius = '6px';
        card.style.textAlign = 'center';
        card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

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
        gridWrapper.appendChild(card);
    });
    container.appendChild(gridWrapper);
}

// Правим функцията достъпна глобално за вградения скрипт в HTML
window.displayTextToSignGrid = displayTextToSignGrid;