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
    if (alertTitle) alertTitle.textContent = `Current watches, warnings, and advisories for ${stateName}`;
    if (alertCount) alertCount.textContent = `${alertCountNum} alert${alertCountNum > 1 ? 's' : ''} found`;

    // Update alerts display for tests - include headlines
    if (alertsDisplay) {
        let displayText = `Weather Alerts: ${alertCountNum}`;
        // Add headlines to display
        features.forEach(function(feature) {
            const headline = feature.properties.headline || feature.properties.event || 'Unknown Alert';
            displayText += ` | ${headline}`;
        });
        alertsDisplay.textContent = displayText;
    }

    // Clear previous list
    if (alertList) alertList.innerHTML = '';

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
        if (alertList) alertList.appendChild(li);
    });

    // Show the container with success styling
    if (alertContainer) {
        alertContainer.className = 'show success';
        alertContainer.style.display = 'block';
    }
    if (loading) loading.classList.remove('show');

    // Hide error message on success
    if (errorMessage) {
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    }
}
