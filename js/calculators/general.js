let currentInput = '0';
let previousInput = '';
let currentOperator = null;
let historyStr = '';
let awaitNewInput = false;

// Format numbers nicely
const format = (num) => {
    if (num === 'Error') return num;
    const stringNum = String(num);
    const parts = stringNum.split('.');
    let fp = parseFloat(parts[0]).toLocaleString('en-US');
    if (parts.length > 1) {
        // truncate decimals if too long, avoiding trailing zeros
        return fp + '.' + parts[1].substring(0, 8);
    }
    return fp;
};

// Evaluate the current state
const calculate = () => {
    let result = null;
    let prev = parseFloat(previousInput);
    let curr = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(curr)) return currentInput;

    switch (currentOperator) {
        case '+': result = prev + curr; break;
        case '-': result = prev - curr; break;
        case '*': result = prev * curr; break;
        case '÷': result = prev / curr; break;
        default: return currentInput;
    }

    // Check for div by 0
    if (!isFinite(result)) return 'Error';

    return String(result);
};

export const initGeneralCalculator = (container, mainDisplay, historyDisplay) => {

    const renderUI = () => {
        container.innerHTML = `
            <div class="grid-keypad">
                <button class="btn action">C</button>
                <button class="btn action">±</button>
                <button class="btn action">%</button>
                <button class="btn operator">÷</button>
                
                <button class="btn num">7</button>
                <button class="btn num">8</button>
                <button class="btn num">9</button>
                <button class="btn operator">*</button>
                
                <button class="btn num">4</button>
                <button class="btn num">5</button>
                <button class="btn num">6</button>
                <button class="btn operator">-</button>
                
                <button class="btn num">1</button>
                <button class="btn num">2</button>
                <button class="btn num">3</button>
                <button class="btn operator">+</button>
                
                <button class="btn num span-2">0</button>
                <button class="btn num">.</button>
                <button class="btn equals">=</button>
            </div>
        `;
    };

    const attachListeners = () => {
        const buttons = container.querySelectorAll('.btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = e.target.innerText;

                // Numbers & Decimal
                if (btn.classList.contains('num')) {
                    if (awaitNewInput) {
                        currentInput = val === '.' ? '0.' : val;
                        awaitNewInput = false;
                    } else {
                        if (val === '.') {
                            if (!currentInput.includes('.')) currentInput += '.';
                        } else {
                            currentInput = currentInput === '0' ? val : currentInput + val;
                        }
                    }
                }

                // Operators
                else if (btn.classList.contains('operator')) {
                    if (currentOperator && !awaitNewInput) {
                        currentInput = calculate();
                    }
                    previousInput = currentInput;
                    currentOperator = val;
                    awaitNewInput = true;
                    historyStr = `${format(previousInput)} ${currentOperator}`;
                }

                // Equals
                else if (btn.classList.contains('equals')) {
                    if (currentOperator && previousInput !== '') {
                        historyStr = `${format(previousInput)} ${currentOperator} ${format(currentInput)} =`;
                        currentInput = calculate();
                        previousInput = '';
                        currentOperator = null;
                        awaitNewInput = true;
                    }
                }

                // Actions (Clear, Sign, Percent)
                else if (btn.classList.contains('action')) {
                    if (val === 'C') {
                        currentInput = '0';
                        previousInput = '';
                        currentOperator = null;
                        historyStr = '';
                        awaitNewInput = false;
                    } else if (val === '±') {
                        currentInput = String(parseFloat(currentInput) * -1);
                    } else if (val === '%') {
                        currentInput = String(parseFloat(currentInput) / 100);
                    }
                }

                updateDisplay();
            });
        });
    };

    const updateDisplay = () => {
        mainDisplay.innerText = format(currentInput);
        historyDisplay.innerText = historyStr;
    };

    renderUI();
    attachListeners();

    // Return an object that allowing switching modes back accurately
    return {
        mount: (newContainer, newMainDisplay, newHistoryDisplay) => {
            // Remount the UI if switched back to this mode
            newContainer.innerHTML = container.innerHTML; // Note: innerHTML doesn't bring listeners
            renderUI(); // re-render to attach to new container safely
            attachListeners();
            mainDisplay = newMainDisplay;
            historyDisplay = newHistoryDisplay;
            updateDisplay();
        }
    };
};
