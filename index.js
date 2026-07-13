// Task 1: Define Project Needs and Goals
// ======================================
// This application fetches weather alerts from the National Weather Service API
// for a specific U.S. state and displays them on the page.

// Task 2: Design and Develop Code
// ================================

// DOM Elements
const stateInput = document.getElementById('state-input');
const fetchBtn = document.getElementById('fetch-btn');
const alertContainer = document.getElementById('alert-container');
const alertTitle = document.getElementById('alert-title');
const alertCount = document.getElementById('alert-count');
const alertList = document.getElementById('alert-list');
const loading = document.getElementById('loading');

// API Configuration
const API_BASE_URL = 'https://api.weather.gov/alerts/active/area/';

// Step 1: Fetch Alerts for a State from the API
// =============================================
async function fetchWeatherData(state) {
    // Validate input - must be exactly 2 letters
    if (!state || state.length !== 2 || !/^[A-Za-z]{2}$/.test(state)) {
        throw new Error('Please enter a valid 2-letter state abbreviation (e.g., NY, CA, TX).');
    }

    const url = API_BASE_URL + state.toUpperCase();

    try {
        const response = await fetch(url);

        // Check if response is ok (status 200-299)
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`State "${state.toUpperCase()}" not found. Please enter a valid U.S. state abbreviation.`);
            } else if (response.status === 503) {
                throw new Error('The weather service is temporarily unavailable. Please try again later.');
            } else {
                throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
            }
        }

        const data = await response.json();

        // Check if features array exists and has data
        if (!data.features || data.features.length === 0) {
            throw new Error(`No active weather alerts found for ${state.toUpperCase()}.`);
        }

        return data;

    } catch (error) {
        // Re-throw the error to be handled by the caller
        throw error;
    }
}

// Step 2: Display the Alerts on the Page
// ======================================
function displayWeather(data, state) {
    const features = data.features;
    const alertCountNum = features.length;

    // Get state name from the first feature
    let stateName = state.toUpperCase();
    if (features.length > 0 && features[0].properties && features[0].properties.areaDesc) {
        const areaDesc = features[0].properties.areaDesc;
        // Try to extract state name from area description
        const stateMatch = areaDesc.match(/\b([A-Z]{2})\b/);
        if (stateMatch) {
            stateName = stateMatch[0];
        }
    }

    // Update title and count
    alertTitle.textContent = `Current watches, warnings, and advisories for ${stateName}`;
    alertCount.textContent = `${alertCountNum} alert${alertCountNum > 1 ? 's' : ''} found`;

    // Clear previous list
    alertList.innerHTML = '';

    // Loop through each alert and add to list
    features.forEach(function(feature) {
        const properties = feature.properties;

        const li = document.createElement('li');

        // Headline
        const headline = document.createElement('div');
        headline.className = 'headline';
        headline.textContent = properties.headline || properties.event || 'Unknown Alert';
        li.appendChild(headline);

        // Details
        const details = document.createElement('div');
        details.className = 'details';

        // Severity
        if (properties.severity) {
            const severity = document.createElement('span');
            severity.textContent = `Severity: ${properties.severity} | `;
            details.appendChild(severity);
        }

        // Area
        if (properties.areaDesc) {
            const area = document.createElement('span');
            area.textContent = `Area: ${properties.areaDesc}`;
            details.appendChild(area);
        }

        li.appendChild(details);

        alertList.appendChild(li);
    });

    // Show the container with success styling
    alertContainer.className = 'show success';
    loading.classList.remove('show');
}

// Step 3: Clear and Reset the UI
// ==============================
function clearUI() {
    alertTitle.textContent = '';
    alertCount.textContent = '';
    alertList.innerHTML = '';
    alertContainer.className = '';
    alertContainer.style.display = 'none';
    loading.classList.remove('show');
}

// Step 4: Implement Error Handling
// ================================
function displayError(message) {
    alertContainer.className = 'show error';
    alertContainer.style.display = 'block';
    alertTitle.textContent = '⚠️ Error';
    alertCount.textContent = '';
    alertList.innerHTML = `<li class="error-message">${message}</li>`;
    loading.classList.remove('show');
}

// Clear error messages and hide after successful request
function clearErrorAndShowSuccess(data, state) {
    displayWeather(data, state);
}

// Step 5: Optional Additional Features
// ====================================
// Feature 1: Input validation - only allow letters, max 2 characters
stateInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
});

// Feature 2: Enter key support
stateInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        handleFetchAlerts();
    }
});

// Feature 3: Auto-focus on page load
window.addEventListener('DOMContentLoaded', function() {
    stateInput.focus();
});

// Main function to handle fetch and display
async function handleFetchAlerts() {
    const state = stateInput.value.trim().toUpperCase();

    // Show loading state
    loading.classList.add('show');
    fetchBtn.disabled = true;

    // Clear previous results (but keep loading visible)
    alertContainer.className = '';
    alertContainer.style.display = 'none';
    alertTitle.textContent = '';
    alertCount.textContent = '';
    alertList.innerHTML = '';

    try {
        // Step 1: Fetch data
        const data = await fetchWeatherData(state);

        // Step 2 & 4: Display data and clear errors on success
        displayWeather(data, state);

        // Step 3: Clear input after successful fetch
        stateInput.value = '';

    } catch (error) {
        // Step 4: Display error message
        displayError(error.message);
    } finally {
        // Always re-enable the button and hide loading
        fetchBtn.disabled = false;
        loading.classList.remove('show');
    }
}

// Event listener for the button
fetchBtn.addEventListener('click', handleFetchAlerts);

// Export for testing (Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchWeatherData,
        displayWeather,
        displayError,
        clearUI,
        handleFetchAlerts,
        stateInput,
        fetchBtn,
        alertContainer,
        alertTitle,
        alertCount,
        alertList,
        loading,
        API_BASE_URL
    };
}