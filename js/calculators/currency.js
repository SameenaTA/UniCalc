import { formatDisplayNumber } from '../app.js';

export const initCurrencyCalculator = (container, mainDisplay, historyDisplay) => {

    let exchangeRates = null;
    let ratesTimestamp = null;

    const POPULAR_CURRENCIES = [
        'USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF',
        'CNY', 'HKD', 'SGD', 'AED', 'SAR', 'MYR', 'KRW', 'BRL',
        'MXN', 'ZAR', 'NOK', 'SEK', 'DKK', 'NZD', 'THB', 'TRY'
    ];

    const fetchRates = async () => {
        const rateStatus = container.querySelector('#rate-status');
        if (rateStatus) rateStatus.innerText = '⏳ Fetching live rates...';
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await response.json();
            if (data.result === 'success') {
                exchangeRates = data.rates;
                ratesTimestamp = new Date(data.time_last_update_utc).toLocaleString();
                if (rateStatus) rateStatus.innerText = `✅ Live · Updated: ${ratesTimestamp}`;
                convert();
            } else {
                if (rateStatus) rateStatus.innerText = '❌ Could not load rates';
            }
        } catch {
            if (rateStatus) rateStatus.innerText = '❌ Network error – check your connection';
        }
    };

    const renderUI = () => {
        container.innerHTML = `
            <div class="curr-body">
                <div class="curr-group">
                    <label class="curr-label">From</label>
                    <div class="curr-row">
                        <input type="number" id="curr-val-from" class="curr-input" value="1">
                        <select id="curr-unit-from" class="curr-select"></select>
                    </div>
                </div>

                <div class="curr-swap-wrap">
                    <button id="curr-swap" class="curr-swap-btn" title="Swap">
                        <i class="fa-solid fa-right-left"></i>
                    </button>
                </div>

                <div class="curr-group">
                    <label class="curr-label">To</label>
                    <div class="curr-row">
                        <input type="number" id="curr-val-to" class="curr-input" readonly>
                        <select id="curr-unit-to" class="curr-select"></select>
                    </div>
                </div>

                <div id="rate-status" class="rate-status"></div>

                <button id="curr-refresh" class="curr-refresh-btn">
                    <i class="fa-solid fa-rotate"></i> Refresh Rates
                </button>
            </div>

            <style>
                .curr-body { display: flex; flex-direction: column; gap: 14px; }
                .curr-group { display: flex; flex-direction: column; gap: 6px; }
                .curr-label { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
                .curr-row { display: flex; flex-direction: column; gap: 8px; }

                .curr-input {
                    width: 100%; padding: 14px; border-radius: 14px;
                    background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);
                    color: var(--text-main); font-size: 1.8rem; font-family: var(--font-display);
                    outline: none; text-align: right; box-sizing: border-box;
                    transition: border-color 0.2s;
                }
                .curr-input:focus:not([readonly]) {
                    border-color: var(--accent-primary); box-shadow: var(--glow-primary);
                }
                .curr-input[readonly] { color: var(--accent-success); font-weight: 700; }

                .curr-select {
                    width: 100%; padding: 10px 14px; border-radius: 12px;
                    background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border);
                    color: white; outline: none; cursor: pointer; font-size: 1rem;
                    box-sizing: border-box;
                }
                .curr-select option { background: #0b0f19; }

                .curr-swap-wrap { display: flex; justify-content: center; }
                .curr-swap-btn {
                    background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3);
                    color: var(--accent-primary); border-radius: 50%; width: 40px; height: 40px;
                    cursor: pointer; font-size: 1rem; transition: all 0.2s;
                    display: flex; align-items: center; justify-content: center;
                }
                .curr-swap-btn:hover {
                    background: rgba(59,130,246,0.3); transform: rotate(180deg);
                }

                .rate-status {
                    font-size: 0.78rem; color: var(--text-muted); text-align: center; min-height: 1rem;
                }

                .curr-refresh-btn {
                    width: 100%; padding: 10px; border-radius: 30px;
                    background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border);
                    color: var(--text-muted); cursor: pointer; font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .curr-refresh-btn:hover {
                    background: rgba(255,255,255,0.08); color: var(--text-main);
                }

                @media (max-width: 768px) {
                    .curr-input { font-size: 1.3rem; padding: 10px; }
                    .curr-select { font-size: 0.9rem; padding: 8px 10px; }
                    .curr-body { gap: 10px; }
                }
            </style>
        `;

        // Populate dropdowns
        const fromSelect = container.querySelector('#curr-unit-from');
        const toSelect = container.querySelector('#curr-unit-to');
        POPULAR_CURRENCIES.forEach(code => {
            fromSelect.innerHTML += `<option value="${code}">${code}</option>`;
            toSelect.innerHTML += `<option value="${code}">${code}</option>`;
        });
        fromSelect.value = 'USD';
        toSelect.value = 'INR';

        attachListeners();
        fetchRates();
    };

    const convert = () => {
        if (!exchangeRates) return;
        const valFrom = parseFloat(container.querySelector('#curr-val-from').value) || 0;
        const uFrom = container.querySelector('#curr-unit-from').value;
        const uTo = container.querySelector('#curr-unit-to').value;

        const inUSD = valFrom / exchangeRates[uFrom];
        const result = parseFloat((inUSD * exchangeRates[uTo]).toFixed(4));

        container.querySelector('#curr-val-to').value = result;
        historyDisplay.innerText = `${valFrom} ${uFrom} = ${result} ${uTo}`;
        mainDisplay.innerText = result.toLocaleString('en-US', { maximumFractionDigits: 4 });
    };

    const attachListeners = () => {
        container.querySelector('#curr-val-from').addEventListener('input', convert);
        container.querySelector('#curr-unit-from').addEventListener('change', convert);
        container.querySelector('#curr-unit-to').addEventListener('change', convert);

        container.querySelector('#curr-swap').addEventListener('click', () => {
            const fromSel = container.querySelector('#curr-unit-from');
            const toSel = container.querySelector('#curr-unit-to');
            const tmp = fromSel.value;
            fromSel.value = toSel.value;
            toSel.value = tmp;
            convert();
        });

        container.querySelector('#curr-refresh').addEventListener('click', () => {
            exchangeRates = null;
            fetchRates();
        });
    };

    const mount = (newContainer, newMainDisplay, newHistoryDisplay) => {
        container = newContainer;
        mainDisplay = newMainDisplay;
        historyDisplay = newHistoryDisplay;
        mainDisplay.innerText = 'Currency';
        historyDisplay.innerText = 'Live exchange rates';
        renderUI();
    };

    mount(container, mainDisplay, historyDisplay);

    return { mount };
};
