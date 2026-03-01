import { formatDisplayNumber } from '../app.js';

export const initFinancialCalculator = (container, mainDisplay, historyDisplay) => {

    let currentMode = 'loan'; // 'loan', 'investment', 'roi'

    const renderUI = () => {
        container.innerHTML = `
            <div class="financial-header">
                <button class="btn fin-tab active" data-tab="loan">Loan/Mortgage</button>
                <button class="btn fin-tab" data-tab="investment">Compound Interest</button>
            </div>
            
            <div id="fin-content" class="fin-content">
                <!-- Content injected here based on tab -->
            </div>
            
            <style>
                .financial-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .fin-tab {
                    font-size: 1rem;
                    padding: 0.8rem;
                    background: rgba(255, 255, 255, 0.03);
                }
                .fin-tab.active {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: var(--accent-primary);
                }
                .fin-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    margin-bottom: 15px;
                }
                .fin-form-group label {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .fin-input {
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--glass-border);
                    color: white;
                    padding: 12px;
                    border-radius: 8px;
                    font-family: var(--font-display);
                    font-size: 1.2rem;
                    outline: none;
                }
                .fin-input:focus {
                    border-color: var(--accent-primary);
                    box-shadow: var(--glow-primary);
                }
                .fin-calc-btn {
                    width: 100%;
                    padding: 15px;
                    margin-top: 10px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, var(--accent-success), #059669);
                    color: white;
                    font-weight: bold;
                    border: none;
                    cursor: pointer;
                    font-size: 1.1rem;
                    transition: transform 0.2s;
                }
                .fin-calc-btn:active {
                    transform: scale(0.98);
                }
            </style>
        `;

        renderTabContent();
    };

    const renderTabContent = () => {
        const contentDiv = container.querySelector('#fin-content');

        if (currentMode === 'loan') {
            contentDiv.innerHTML = `
                <div class="fin-form-group">
                    <label>Principal Amount ($)</label>
                    <input type="number" id="fin-principal" class="fin-input" placeholder="300000">
                </div>
                <div class="fin-form-group">
                    <label>Annual Interest Rate (%)</label>
                    <input type="number" id="fin-rate" class="fin-input" placeholder="5.5" step="0.1">
                </div>
                <div class="fin-form-group">
                    <label>Term (Years)</label>
                    <input type="number" id="fin-years" class="fin-input" placeholder="30">
                </div>
                <button class="fin-calc-btn" id="btn-calc-loan">Calculate Monthly Payment</button>
            `;

            container.querySelector('#btn-calc-loan').addEventListener('click', calculateLoan);
        } else if (currentMode === 'investment') {
            contentDiv.innerHTML = `
                <div class="fin-form-group">
                    <label>Initial Investment ($)</label>
                    <input type="number" id="fin-principal" class="fin-input" placeholder="10000">
                </div>
                <div class="fin-form-group">
                    <label>Monthly Contribution ($)</label>
                    <input type="number" id="fin-contrib" class="fin-input" placeholder="500">
                </div>
                <div class="fin-form-group">
                    <label>Annual Return Rate (%)</label>
                    <input type="number" id="fin-rate" class="fin-input" placeholder="7" step="0.1">
                </div>
                <div class="fin-form-group">
                    <label>Time to Grow (Years)</label>
                    <input type="number" id="fin-years" class="fin-input" placeholder="10">
                </div>
                <button class="fin-calc-btn" id="btn-calc-invest">Calculate Future Value</button>
            `;

            container.querySelector('#btn-calc-invest').addEventListener('click', calculateInvestment);
        }
    };

    const calculateLoan = () => {
        const P = parseFloat(container.querySelector('#fin-principal').value);
        const r = parseFloat(container.querySelector('#fin-rate').value) / 100 / 12; // Monthly rate
        const n = parseFloat(container.querySelector('#fin-years').value) * 12; // Total months

        if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || n <= 0) {
            mainDisplay.innerText = 'Error';
            historyDisplay.innerText = 'Invalid Input';
            return;
        }

        // M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1]
        let M;
        if (r === 0) {
            M = P / n;
        } else {
            const num = r * Math.pow(1 + r, n);
            const den = Math.pow(1 + r, n) - 1;
            M = P * (num / den);
        }

        historyDisplay.innerText = `Loan: $${P.toLocaleString()} @ ${(r * 100 * 12).toFixed(2)}% for ${n / 12}yrs`;
        mainDisplay.innerText = '$' + M.toFixed(2).toLocaleString('en-US');
    };

    const calculateInvestment = () => {
        const P = parseFloat(container.querySelector('#fin-principal').value) || 0;
        const PMT = parseFloat(container.querySelector('#fin-contrib').value) || 0;
        const r = parseFloat(container.querySelector('#fin-rate').value) / 100 / 12;
        const n = parseFloat(container.querySelector('#fin-years').value) * 12;

        if (isNaN(r) || isNaN(n) || n <= 0) {
            mainDisplay.innerText = 'Error';
            historyDisplay.innerText = 'Invalid Input';
            return;
        }

        // FV = P(1+r)^n + PMT [ ((1+r)^n - 1) / r ]
        let FV;
        if (r === 0) {
            FV = P + (PMT * n);
        } else {
            const compoundPrincipal = P * Math.pow(1 + r, n);
            const compoundContrib = PMT * ((Math.pow(1 + r, n) - 1) / r);
            // Assuming end of month contributions
            FV = compoundPrincipal + compoundContrib;
        }

        historyDisplay.innerText = `Inv: $${P} + $${PMT}/mo @ ${(r * 100 * 12).toFixed(2)}% over ${n / 12}yrs`;
        mainDisplay.innerText = '$' + FV.toFixed(2).toLocaleString('en-US');
    };

    const attachListeners = () => {
        const tabs = container.querySelectorAll('.fin-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Update active tab styling
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                // Switch mode and re-render forms
                currentMode = e.target.getAttribute('data-tab');
                renderTabContent();

                // Note: display is not reset automatically here to allow viewing previous result while switching, 
                // but can be adjusted.
            });
        });
    };

    const mount = (newContainer, newMainDisplay, newHistoryDisplay) => {
        container = newContainer;
        mainDisplay = newMainDisplay;
        historyDisplay = newHistoryDisplay;

        mainDisplay.innerText = 'Financial';
        historyDisplay.innerText = 'Select a tool below';

        renderUI();
        attachListeners();
    };

    mount(container, mainDisplay, historyDisplay);

    return { mount };
};
