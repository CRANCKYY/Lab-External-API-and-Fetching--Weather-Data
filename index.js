// DOM Elements
const stateInput = document.getElementById('state-input');
const fetchBtn = document.getElementById('fetch-btn');
const alertContainer = document.getElementById('alert-container');
const alertTitle = document.getElementById('alert-title');
const alertCount = document.getElementById('alert-count');
const alertList = document.getElementById('alert-list');
const loading = document.getElementById('loading');
const alertsDisplay = document.getElementById('alerts-display');
const errorMessage = document.getElementById('error-message');

// API Configuration
const API_BASE_URL = 'https://api.weather.gov/alerts/active?area=';

// Step 1: Fetch Alerts for a State from the API
async function fetchWeatherData(state) {
    if (!state || state.length !== 2 || !/^[A-Za-z]{2}$/.test(state)) {
        throw new Error('Please enter a valid 2-letter state abbreviation (e.g., NY, CA, TX).');
    }

    const url = API_BASE_URL + state.toUpperCase();

    try {
        const response = await fetch(url);

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

        if (!data.features || data.features.length === 0) {
            throw new Error(`No active weather alerts found for ${state.toUpperCase()}.`);
        }

        return data;

    } catch (error) {
        throw error;
    }
}

// Step 2: Display the Alerts on the Page
function displayWeather(data, state) {
    const features = data.features;
    const alertCountNum = features.length;

    let stateName = state.toUpperCase();
    if (features.length > 0 && features[0].properties && features[0].properties.areaDesc) {
        const areaDesc = features[0].properties.areaDesc;
        const stateMatch = areaDesc.match(/\b([A-Z]{2})\b/);
        if (stateMatch) {
            stateName = stateMatch[0];
        }
    }

    // Update title and count
    alertTitle.textContent = `Current watches, warnings, and advisories for ${stateName}`;
    alertCount.textContent = `${alertCountNum} alert${alertCountNum > 1 ? 's' : ''} found`;

    // Update alerts display for tests
    if (alertsDisplay) {
        alertsDisplay.textContent = `Weather Alerts: ${alertCountNum}`;
    }

    // Clear previous list
    alertList.innerHTML = '';

    // Loop through each alert and add to list
    features.forEach(function(feature) {
        const properties = feature.properties;

        const li = document.createElement('li');

        const headline = document.createElement('div');
        headline.className = 'headline';
        headline.textContent = properties.headline || properties.event || 'Unknown Alert';
        li.appendChild(headline);

        const details = document.createElement('div');
        details.className = 'details';

        if (properties.severity) {
            const severity = document.createElement('span');
            severity.textContent = `Severity: ${properties.severity} | `;
            details.appendChild(severity);
        }

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
    alertContainer.style.display = 'block';
    loading.classList.remove('show');

    // Hide error message on success
    if (errorMessage) {
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    }
}

// Step 3: Clear and Reset the UI
function clearUI() {
    alertTitle.textContent = '';
    alertCount.textContent = '';
    alertList.innerHTML = '';
    alertContainer.className = '';
    alertContainer.style.display = 'none';
    loading.classList.remove('show');
    if (alertsDisplay) {
        alertsDisplay.textContent = '';
    }
    if (errorMessage) {
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    }
}

// Step 4: Implement Error Handling
function displayError(message) {
    alertContainer.className = 'show error';
    alertContainer.style.display = 'block';
    alertTitle.textContent = '⚠️ Error';
    alertCount.textContent = '';
    alertList.innerHTML = `<li class="error-message">${message}</li>`;
    loading.classList.remove('show');

    // Show error message for tests
    if (errorMessage) {
        errorMessage.classList.remove('hidden');
        errorMessage.textContent = message;
    }
}

// Step 5: Optional Additional Features
if (stateInput) {
    stateInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
    });

    stateInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            handleFetchAlerts();
        }
    });
}

// Auto-focus on page load
window.addEventListener('DOMContentLoaded', function() {
    if (stateInput) {
        stateInput.focus();
    }
});

// Main function to handle fetch and display
async function handleFetchAlerts() {
    const state = stateInput ? stateInput.value.trim().toUpperCase() : '';

    if (loading) loading.classList.add('show');
    if (fetchBtn) fetchBtn.disabled = true;

    alertContainer.className = '';
    alertContainer.style.display = 'none';
    alertTitle.textContent = '';
    alertCount.textContent = '';
    alertList.innerHTML = '';

    if (alertsDisplay) {
        alertsDisplay.textContent = '';
    }

    try {
        const data = await fetchWeatherData(state);
        displayWeather(data, state);

        // CLEAR THE INPUT AFTER SUCCESSFUL FETCH
        if (stateInput) {
            stateInput.value = '';
        }

    } catch (error) {
        displayError(error.message);
    } finally {
        if (fetchBtn) fetchBtn.disabled = false;
        if (loading) loading.classList.remove('show');
    }
}

// Event listener for the button
if (fetchBtn) {
    fetchBtn.addEventListener('click', handleFetchAlerts);
}

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
        alertsDisplay,
        errorMessage,
        API_BASE_URL
    };
}
