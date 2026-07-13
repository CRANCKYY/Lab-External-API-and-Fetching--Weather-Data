// Task 3: Test and Refine
// =======================

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
    API_BASE_URL
} = require('../index.js');

// Mock the fetch API globally
global.fetch = jest.fn();

// Mock DOM elements
document.body.innerHTML = `
    <input id="state-input" />
    <button id="fetch-btn"></button>
    <div id="alert-container"></div>
    <div id="alert-title"></div>
    <div id="alert-count"></div>
    <ul id="alert-list"></ul>
    <div id="loading"></div>
`;

describe('Weather Alert Application', () => {

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Reset DOM elements
        stateInput.value = '';
        alertContainer.className = '';
        alertContainer.style.display = 'none';
        alertTitle.textContent = '';
        alertCount.textContent = '';
        alertList.innerHTML = '';
        loading.classList.remove('show');
        fetchBtn.disabled = false;
    });

    // Test 1: The fetch request is made using the input state abbreviation
    test('fetch request is made using the input state abbreviation', async () => {
        const mockData = {
            features: [
                {
                    properties: {
                        headline: 'Test Alert',
                        areaDesc: 'NY',
                        severity: 'Severe'
                    }
                }
            ]
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        const result = await fetchWeatherData('NY');

        expect(fetch).toHaveBeenCalledWith('https://api.weather.gov/alerts/active/area/NY');
        expect(result).toEqual(mockData);
    });

    // Test 2: When successful fetch, display title and number of alerts
    test('when successful fetch request, displays title and number of alerts', () => {
        const mockData = {
            features: [
                { properties: { headline: 'Alert 1', areaDesc: 'NY' } },
                { properties: { headline: 'Alert 2', areaDesc: 'NY' } },
                { properties: { headline: 'Alert 3', areaDesc: 'NY' } }
            ]
        };

        displayWeather(mockData, 'NY');

        expect(alertTitle.textContent).toBe('Current watches, warnings, and advisories for NY');
        expect(alertCount.textContent).toBe('3 alerts found');
        expect(alertList.children.length).toBe(3);
        expect(alertContainer.className).toContain('success');
    });

    // Test 3: When button is clicked, input clears
    test('when Get Weather Alerts button is clicked, input clears', async () => {
        const mockData = {
            features: [
                { properties: { headline: 'Test Alert', areaDesc: 'NY' } }
            ]
        };

        stateInput.value = 'NY';
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        // Mock the fetchWeatherData and displayWeather calls
        const originalFetchWeatherData = global.fetchWeatherData;
        global.fetchWeatherData = jest.fn().mockResolvedValue(mockData);
        global.displayWeather = jest.fn();

        await handleFetchAlerts();

        expect(stateInput.value).toBe('');

        // Restore
        global.fetchWeatherData = originalFetchWeatherData;
    });

    // Test 4: When unsuccessful request, error message is displayed
    test('when unsuccessful request, error message is displayed', () => {
        const errorMessage = 'Failed to fetch weather data. Status: 404';
        displayError(errorMessage);

        expect(alertContainer.className).toContain('error');
        expect(alertTitle.textContent).toBe('⚠️ Error');
        expect(alertList.innerHTML).toContain(errorMessage);
        expect(loading.classList.contains('show')).toBe(false);
    });

    // Test 5: Error messages are cleared and hidden after successful request
    test('error messages are cleared and hidden after successful request', () => {
        const mockData = {
            features: [
                { properties: { headline: 'Test Alert', areaDesc: 'NY' } }
            ]
        };

        // First show an error
        displayError('Test error message');
        expect(alertContainer.className).toContain('error');

        // Then display success
        displayWeather(mockData, 'NY');
        expect(alertContainer.className).toContain('success');
        expect(alertContainer.className).not.toContain('error');
        expect(alertTitle.textContent).toBe('Current watches, warnings, and advisories for NY');
    });

    // Test 6: Async handling - no unhandled promise rejections
    test('async handling validates no unhandled promise rejections', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        fetch.mockRejectedValueOnce(new Error('Network error'));

        stateInput.value = 'NY';

        // We expect the error to be caught, not unhandled
        await expect(handleFetchAlerts()).resolves.not.toThrow();

        consoleErrorSpy.mockRestore();
    });

    // Test 7: Invalid input validation
    test('invalid input throws appropriate error', async () => {
        await expect(fetchWeatherData('NEWYORK')).rejects.toThrow('Please enter a valid 2-letter state abbreviation');
        await expect(fetchWeatherData('1')).rejects.toThrow('Please enter a valid 2-letter state abbreviation');
        await expect(fetchWeatherData('')).rejects.toThrow('Please enter a valid 2-letter state abbreviation');
    });

    // Test 8: No alerts found
    test('no alerts found throws appropriate error', async () => {
        const emptyData = { features: [] };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => emptyData
        });

        await expect(fetchWeatherData('XX')).rejects.toThrow('No active weather alerts found for XX.');
    });

    // Test 9: 404 error handling
    test('404 error handling displays appropriate message', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 404
        });

        await expect(fetchWeatherData('ZZ')).rejects.toThrow('State "ZZ" not found.');
    });

    // Test 10: 503 error handling
    test('503 error handling displays appropriate message', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 503
        });

        await expect(fetchWeatherData('NY')).rejects.toThrow('The weather service is temporarily unavailable.');
    });
});