/**
 * Fetches first image for each letter in text and displays in a grid
 * @param {string} text - Text to get images for
 * @param {string} containerId - Container to display grid
 */
async function displayTextToSignGrid(text, containerId = 'image-grid-container') {
    try {
        // Get container
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Validate input
        if (!text || text.trim().length === 0) {
            container.innerHTML = '';
            return;
        }

        // Fetch images from backend
        const response = await fetch(`http://localhost:5001/get-images-for-text/${encodeURIComponent(text)}`);
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Error:', error.error);
            container.innerHTML = '';
            return;
        }

        const data = await response.json();
        displayImageGrid(data, container);
        
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

/**
 * Displays images in a grid
 * @param {object} data - Data containing images
 * @param {HTMLElement} container - Container element
 */
function displayImageGrid(data, container) {
    container.innerHTML = '';

    if (!data.images || data.images.length === 0) {
        container.innerHTML = '';
        return;
    }

    // Create grid wrapper
    const gridWrapper = document.createElement('div');
    gridWrapper.style.display = 'grid';
    gridWrapper.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
    gridWrapper.style.gap = '12px';
    gridWrapper.style.padding = '15px';
    gridWrapper.style.backgroundColor = '#f9f9f9';
    gridWrapper.style.borderRadius = '8px';
    gridWrapper.style.border = '1px solid #26b5a3';
    gridWrapper.style.marginBottom = '15px';

    // Create image items
    data.images.forEach((imageObj) => {
        const card = document.createElement('div');
        card.style.backgroundColor = 'white';
        card.style.borderRadius = '6px';
        card.style.overflow = 'hidden';
        card.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.1)';
        card.style.transition = 'transform 0.2s ease';
        card.style.cursor = 'pointer';

        const img = document.createElement('img');
        img.src = imageObj.data;

        // FIX: support both "letter" and "character"
        const char = imageObj.letter || imageObj.character;

        img.alt = `Letter ${char}`;
        img.style.width = '100%';
        img.style.height = '130px';
        img.style.objectFit = 'cover';
        img.style.display = 'block';

        const label = document.createElement('div');
        label.textContent = char.toUpperCase();
        label.style.textAlign = 'center';
        label.style.padding = '8px';
        label.style.fontSize = '14px';
        label.style.fontWeight = 'bold';
        label.style.color = '#26b5a3';
        label.style.backgroundColor = '#fafafa';

        card.appendChild(img);
        card.appendChild(label);
        gridWrapper.appendChild(card);
    });

    container.appendChild(gridWrapper);
}