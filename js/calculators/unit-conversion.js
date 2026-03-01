import { formatDisplayNumber } from '../app.js';

export const initUnitConversion = (container, mainDisplay, historyDisplay) => {

    let currentCategory = 'length'; // length, weight, temp, data

    const units = {
        length: { meters: 1, kilometers: 0.001, miles: 0.000621371, feet: 3.28084, inches: 39.3701 },
        weight: { grams: 1, kilograms: 0.001, pounds: 0.00220462, ounces: 0.035274 },
        data: { bytes: 1, kb: 0.001, mb: 0.000001, gb: 0.000000001, tb: 0.000000000001 }
    };

    const renderUI = () => {
        container.innerHTML = `
            <div class="conv-header">
                <select id="conv-category" class="conv-select-main">
                    <option value="length">Length</option>
                    <option value="weight">Weight</option>
                    <option value="temp">Temperature</option>
                    <option value="data">Data Size</option>
                </select>
            </div>
            
            <div class="conv-body">
                <div class="conv-group">
                    <input type="number" id="conv-val-from" class="conv-input" value="1">
                    <select id="conv-unit-from" class="conv-select"></select>
                </div>
                
                <div class="conv-icon">
                    <i class="fa-solid fa-arrow-down"></i>
                </div>
                
                <div class="conv-group">
                    <input type="number" id="conv-val-to" class="conv-input" readonly>
                    <select id="conv-unit-to" class="conv-select"></select>
                </div>
            </div>

            <style>
                .conv-header { margin-bottom: 12px; text-align: center; }
                .conv-select-main {
                    padding: 10px; width: 100%; border-radius: 8px;
                    background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);
                    color: white; font-size: 1.1rem; outline: none; cursor: pointer;
                }
                .conv-select-main option { background: var(--bg-color); }

                .conv-body { display: flex; flex-direction: column; gap: 10px; }
                .conv-group { display: flex; flex-direction: column; gap: 8px; }

                .conv-input {
                    width: 100%; padding: 12px; border-radius: 12px;
                    background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
                    color: var(--text-main); font-size: 1.4rem; outline: none; text-align: right;
                    box-sizing: border-box;
                }
                .conv-input:focus:not([readonly]) {
                    border-color: var(--accent-primary); box-shadow: var(--glow-primary);
                }
                .conv-input[readonly] { color: var(--accent-success); font-weight: bold; }

                .conv-select {
                    width: 100%; padding: 10px; border-radius: 12px;
                    background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);
                    color: white; outline: none; cursor: pointer; box-sizing: border-box;
                }
                .conv-select option { background: var(--bg-color); }

                .conv-icon { text-align: center; color: var(--text-muted); font-size: 1.3rem; margin: 4px 0; }

                /* Mobile tweaks */
                @media (max-width: 768px) {
                    .conv-input { font-size: 1.1rem; padding: 10px; }
                    .conv-select-main { font-size: 0.95rem; padding: 8px; }
                    .conv-select { padding: 8px; font-size: 0.9rem; }
                    .conv-icon { margin: 2px 0; font-size: 1rem; }
                    .conv-header { margin-bottom: 8px; }
                    .conv-body { gap: 6px; }
                }
            </style>
        `;

        populateUnits();
    };

    const populateUnits = () => {
        const fromSelect = container.querySelector('#conv-unit-from');
        const toSelect = container.querySelector('#conv-unit-to');

        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';

        let options = [];
        if (currentCategory === 'temp') {
            options = ['celsius', 'fahrenheit', 'kelvin'];
        } else {
            options = Object.keys(units[currentCategory]);
        }

        options.forEach(opt => {
            fromSelect.innerHTML += `<option value="${opt}">${opt}</option>`;
            toSelect.innerHTML += `<option value="${opt}">${opt}</option>`;
        });

        // Default different target
        if (options.length > 1) {
            toSelect.value = options[1];
        }

        convert(); // Run initial calc
    };

    const convert = () => {
        const valFrom = parseFloat(container.querySelector('#conv-val-from').value) || 0;
        const uFrom = container.querySelector('#conv-unit-from').value;
        const uTo = container.querySelector('#conv-unit-to').value;

        let result = 0;

        if (currentCategory === 'temp') {
            if (uFrom === uTo) { result = valFrom; }
            else if (uFrom === 'celsius' && uTo === 'fahrenheit') result = (valFrom * 9 / 5) + 32;
            else if (uFrom === 'celsius' && uTo === 'kelvin') result = valFrom + 273.15;
            else if (uFrom === 'fahrenheit' && uTo === 'celsius') result = (valFrom - 32) * 5 / 9;
            else if (uFrom === 'fahrenheit' && uTo === 'kelvin') result = (valFrom - 32) * 5 / 9 + 273.15;
            else if (uFrom === 'kelvin' && uTo === 'celsius') result = valFrom - 273.15;
            else if (uFrom === 'kelvin' && uTo === 'fahrenheit') result = (valFrom - 273.15) * 9 / 5 + 32;
        } else {
            // Convert to base unit then to target
            const baseVal = valFrom / units[currentCategory][uFrom];
            result = baseVal * units[currentCategory][uTo];
        }

        // Avoid crazy floating points
        result = parseFloat(result.toFixed(6));

        container.querySelector('#conv-val-to').value = result;

        historyDisplay.innerText = `${valFrom} ${uFrom} = ${result} ${uTo}`;
        mainDisplay.innerText = formatDisplayNumber(String(result));
    };

    const attachListeners = () => {
        const categorySelect = container.querySelector('#conv-category');
        const valInput = container.querySelector('#conv-val-from');
        const unitFrom = container.querySelector('#conv-unit-from');
        const unitTo = container.querySelector('#conv-unit-to');

        categorySelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            populateUnits();
        });

        valInput.addEventListener('input', convert);
        unitFrom.addEventListener('change', convert);
        unitTo.addEventListener('change', convert);
    };

    const mount = (newContainer, newMainDisplay, newHistoryDisplay) => {
        container = newContainer;
        mainDisplay = newMainDisplay;
        historyDisplay = newHistoryDisplay;

        mainDisplay.innerText = 'Conversion';
        historyDisplay.innerText = 'Select a category below';

        renderUI();
        attachListeners();
    };

    mount(container, mainDisplay, historyDisplay);

    return { mount };
};
