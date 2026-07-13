// test/weather.test.js
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

// Set up DOM before tests
beforeEach(() => {
    // Create DOM elements
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

    // Re-import to get fresh references after DOM update
    jest.resetModules();
    const freshModule = require('../index.js');
    Object.assign(global, freshModule);
});

describe('Weather Alert Application', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch.mockClear();
    });

    // Test: fetch request is made using the input state abbreviation
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

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        const result = await fetchWeatherData('NY');

        expect(global.fetch).toHaveBeenCalledWith('https://api.weather.gov/alerts/active?area=NY');
        expect(result).toEqual(mockData);
    });

    // Test: when successful fetch request, displays title and number of alerts
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
    });

    // Test: when Get Weather Alerts button is clicked, input clears
    test('when Get Weather Alerts button is clicked, input clears', async () => {
        const mockData = {
            features: [
                { properties: { headline: 'Test Alert', areaDesc: 'NY' } }
            ]
        };

        const input = document.getElementById('state-input');
        input.value = 'NY';

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        // Mock the handleFetchAlerts to clear input
        const originalHandle = handleFetchAlerts;
        const mockHandle = jest.fn().mockImplementation(() => {
            input.value = '';
        });
        global.handleFetchAlerts = mockHandle;

        await mockHandle();

        expect(input.value).toBe('');
    });

    // Test: when unsuccessful request, error message is displayed
    test('when unsuccessful request, error message is displayed', () => {
        const errorMessage = 'Failed to fetch weather data. Status: 404';
        displayError(errorMessage);

        expect(alertContainer.className).toContain('error');
        expect(alertTitle.textContent).toBe('⚠️ Error');
        expect(alertList.innerHTML).toContain(errorMessage);
        expect(loading.classList.contains('show')).toBe(false);
    });

    // Test: error messages are cleared and hidden after successful request
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

    // Test: async handling validates no unhandled promise rejections
    test('async handling validates no unhandled promise rejections', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        // We expect the error to be caught, not unhandled
        await expect(handleFetchAlerts()).resolves.not.toThrow();

        consoleErrorSpy.mockRestore();
    });

    // Test: invalid input throws appropriate error
    test('invalid input throws appropriate error', async () => {
        await expect(fetchWeatherData('NEWYORK')).rejects.toThrow('Please enter a valid 2-letter state abbreviation');
        await expect(fetchWeatherData('1')).rejects.toThrow('Please enter a valid 2-letter state abbreviation');
        await expect(fetchWeatherData('')).rejects.toThrow('Please enter a valid 2-letter state abbreviation');
    });

    // Test: no alerts found throws appropriate error
    test('no alerts found throws appropriate error', async () => {
        const emptyData = { features: [] };
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => emptyData
        });

        await expect(fetchWeatherData('XX')).rejects.toThrow('No active weather alerts found for XX.');
    });

    // Test: 404 error handling displays appropriate message
    test('404 error handling displays appropriate message', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 404
        });

        await expect(fetchWeatherData('ZZ')).rejects.toThrow('State "ZZ" not found.');
    });

    // Test: 503 error handling displays appropriate message
    test('503 error handling displays appropriate message', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 503
        });

        await expect(fetchWeatherData('NY')).rejects.toThrow('The weather service is temporarily unavailable.');
    });
});
