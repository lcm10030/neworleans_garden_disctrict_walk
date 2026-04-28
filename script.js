mapboxgl.accessToken = 'pk.eyJ1IjoibGNtMTAwMzAiLCJhIjoiY21uaTJ1c2lwMDh0aDJ3b2Z4bjUxMjZqciJ9.dwT1gelvqXmJmSNUpUGdnw';
const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/standard', // Use the standard style for the map
    config: {
        basemap: {
            lightPreset: "dawn",
            theme: "monochrome",
        }
    },
    projection: 'globe', // display the map as a globe
    zoom: 13, // initial zoom level, 0 is the world view, higher values zoom in
    center: [-90.08441, 29.93134] // center the map on this longitude and latitude
});


//Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Walking tour state
let currentStop = -1;
let tourStops = [];

// Get DOM elements
const startWalkBtn = document.getElementById('start-walk-btn');
const nextStopBtn = document.getElementById('next-stop-btn');
const stopPanel = document.getElementById('stop-panel');
const stopContent = document.getElementById('stop-content');
const closePanelBtn = document.getElementById('close-panel');

map.on('load', () => {
    //Sources
    // Garden District boundaries source
    map.addSource('garden-boundaries', {
        type: 'geojson',
        data: 'gardenboundaries.json'
    });

    // walking tour route source
    map.addSource('garden-walk', {
        type: 'geojson',
        data: 'gardenwalk.json'
    });

     // tour stops source
    map.addSource('tour-stops', {
        type: 'geojson',
        data: 'gardenstops.json'
    });

    //Layers
    //walking tour line layer
    map.addLayer({
        id: 'garden-walk',
        type: 'line',
        source: 'garden-walk',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#e55e5e',
            'line-width': 2,
            'line-dasharray': [2, 4] // dashed line pattern
        }
    });

    // tour stops point layer
    map.addLayer({
        id: 'tour-stops-points',
        type: 'circle',
        source: 'tour-stops',
        paint: {
            'circle-radius': 8,
            'circle-color': '#e55e5e',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
        }
    });

    // garden district boundaries fill layer
    map.addLayer({
        id: 'garden-boundaries',
        type: 'fill',
        source: 'garden-boundaries',
        paint: {
            'fill-color': '#f9cc8c',
            'fill-opacity': 0.2
        }
    });

    // Fetch tour stops from the JSON
    fetch('gardenstops.json')
        .then(response => response.json())
        .then(data => {
            tourStops = data.features;
        });
});

// Start Walk button - zooms to the start of the walk
startWalkBtn.addEventListener('click', () => {
    if (tourStops.length === 0) return;

    currentStop = 0;
    const startCoords = tourStops[0].geometry.coordinates;

    map.flyTo({
        center: startCoords,
        zoom: 16,
        essential: true
    });

    // Enable the Next Stop button
    nextStopBtn.disabled = false;
    nextStopBtn.textContent = 'Next Stop';

    // Show stop info in side panel
    showStopPopup(tourStops[0]);
});

// Next Stop button - navigates to each subsequent stop
nextStopBtn.addEventListener('click', () => {
    if (currentStop < 0 || currentStop >= tourStops.length - 1) return;

    currentStop++;
    const stopCoords = tourStops[currentStop].geometry.coordinates;

    map.flyTo({
        center: stopCoords,
        zoom: 16,
        essential: true
    });

    // Show stop info in side panel
    showStopPopup(tourStops[currentStop]);

    // Update button text if at the last stop
    if (currentStop === tourStops.length - 1) {
        nextStopBtn.textContent = 'Tour Complete';
        nextStopBtn.disabled = true;
    }
});

// Function to show stop information in the side panel
function showStopPopup(stop) {
    const props = stop.properties;
    
    // Build the HTML content for the side panel
    let html = '';
    
    // Add image if available
    if (props.image) {
        html += `<img src="${props.image}" alt="${props.name || 'Stop image'}">`;
    }
    
    // Add stop name and description
    html += `<h2>${props.name || 'Stop'}</h2>`;
    html += `<p>${props.description || ''}</p>`;
    
    // Insert content into the side panel
    stopContent.innerHTML = html;
    
    // Show the side panel (remove hidden class)
    stopPanel.classList.remove('hidden');
}

// Close the side panel
closePanelBtn.addEventListener('click', () => {
    stopPanel.classList.add('hidden');
});
