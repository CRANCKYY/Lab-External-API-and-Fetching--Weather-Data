// test/weather.test.js
const fetchMock = jest.fn();
global.fetch = fetchMock;

// Set up DOM
document.body.innerHTML = `
    <input id="state-input" />
    <button id="fetch-btn"></button>
    <div id="alert-container"></div>
    <div id="alert-title"></div>
    <div id="alert-count"></div>
    <ul id="alert-list"></ul>
    <div id="loading"></div>
    <div id="alerts-display"></div>
    <div id="error-message" class="hidden"></div>
`;

// Import after DOM is set up
const {
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
} = require('../index.js');

const container = document.body;

describe('Weather Alerts App - Input clearing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetchMock.mockClear();
        
        // Reset DOM
        if (alertContainer) {
            alertContainer.className = '';
            alertContainer.style.display = 'none';
        }
        if (alertTitle) alertTitle.textContent = '';
        if (alertCount) alertCount.textContent = '';
        if (alertList) alertList.innerHTML = '';
        if (loading) loading.classList.remove('show');
        if (alertsDisplay) alertsDisplay.textContent = '';
        if (errorMessage) {
            errorMessage.classList.add('hidden');
            errorMessage.textContent = '';
        }
        
        // Reset input
        const input = document.getElementById('state-input');
        if (input) {
            input.value = '';
        }
    });

    test('calls fetch with the correct state in the URL', async () => {
        const mockData = {
            features: [
                { properties: { headline: 'Test Alert', areaDesc: 'CA' } }
            ]
        };
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        const input = document.getElementById('state-input');
        if (input) {
            input.value = 'CA';
        }

        await handleFetchAlerts();

        expect(fetchMock).toHaveBeenCalledWith('https://api.weather.gov/alerts/active?area=CA');
    });

    test('displays fetched alert data in the DOM after a successful fetch', async () => {
        const mockData = {
            features: [
                { properties: { headline: 'Flood warning in your area', areaDesc: 'NY' } },
                { properties: { headline: 'Tornado watch for the region', areaDesc: 'NY' } }
            ]
        };
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        const input = document.getElementById('state-input');
        if (input) {
            input.value = 'NY';
        }

        await handleFetchAlerts();

        const displayDiv = container.querySelector('#alerts-display');
        if (displayDiv) {
            expect(displayDiv.textContent).toContain('Weather Alerts: 2');
            expect(displayDiv.textContent).toContain('Flood warning in your area');
            expect(displayDiv.textContent).toContain('Tornado watch for the region');
        }
    });

    test('clears the input field after clicking fetch', async () => {
        const mockData = {
            features: [
                { properties: { headline: 'Test Alert', areaDesc: 'TX' } }
            ]
        };
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        const input = document.getElementById('state-input');
        if (input) {
            input.value = 'TX';
        }

        await handleFetchAlerts();

        if (input) {
            expect(input.value).toBe('');
        }
    });

    test('displays an error message when fetch fails', async () => {
        // Mock a failed fetch (network error)
        fetchMock.mockRejectedValueOnce(new Error('Network failure'));

        const input = document.getElementById('state-input');
        if (input) {
            input.value = 'CA';
        }

        await handleFetchAlerts();

        const errorDiv = container.querySelector('#error-message');
        if (errorDiv) {
            expect(errorDiv.classList.contains('hidden')).toBe(false);
            expect(errorDiv.textContent).toContain('Network failure');
        }
    });

    test('clears the error message after a successful fetch', async () => {
        // First cause an error
        fetchMock.mockRejectedValueOnce(new Error('Network issue'));
        
        const input = document.getElementById('state-input');
        if (input) {
            input.value = 'ZZ';
        }

        await handleFetchAlerts();

        // Error should be shown
        const errorDiv = container.querySelector('#error-message');
        if (errorDiv) {
            expect(errorDiv.classList.contains('hidden')).toBe(false);
        }

        // Now make a successful fetch
        const mockData = {
            features: [
                { properties: { headline: 'Test Alert', areaDesc: 'NY' } }
            ]
        };
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        if (input) {
            input.value = 'NY';
        }

        await handleFetchAlerts();

        // Error should be cleared
        if (errorDiv) {
            expect(errorDiv.classList.contains('hidden')).toBe(true);
            expect(errorDiv.textContent).toBe('');
        }
    });
});
