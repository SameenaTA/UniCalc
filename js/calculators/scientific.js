import { formatDisplayNumber } from '../app.js';

export const initScientificCalculator = (container, mainDisplay, historyDisplay) => {
    let currentInput = '0';
    let previousInput = '';
    let currentOperator = null;
    let historyStr = '';
    let awaitNewInput = false;
    let isDegree = true;

    const calculateAdvanced = (func, val) => {
        let num = parseFloat(val);
        if (isNaN(num)) return val;

        let result = 0;

        // Handle Trig modes
        let rad = isDegree ? num * (Math.PI / 180) : num;

        switch (func) {
            case 'sin': result = Math.sin(rad); break;
            case 'cos': result = Math.cos(rad); break;
            case 'tan': result = Math.tan(rad); break;
            case 'log': result = Math.log10(num); break;
            case 'ln': result = Math.log(num); break;
            case 'sqrt': result = Math.sqrt(num); break;
            case 'sq': result = Math.pow(num, 2); break;
            case 'cube': result = Math.pow(num, 3); break;
            case '1/x': result = 1 / num; break;
            case 'fact':
                result = 1;
                for (let i = 2; i <= num; i++) result *= i;
                break;
            default: return val;
        }

        // Clean up small floating point rounding issues for trig (e.g. cos(90) = 6.12e-17)
        return Math.abs(result) < 1e-10 ? '0' : String(result);
    };

    const calculateBasic = (op, prev, curr) => {
        let p = parseFloat(prev);
        let c = parseFloat(curr);
        if (isNaN(p) || isNaN(c)) return String(c);

        switch (op) {
            case '+': return String(p + c);
            case '-': return String(p - c);
            case '*': return String(p * c);
            case '÷': return String(p / c);
            case '^': return String(Math.pow(p, c));
            default: return String(c);
        }
    };

    const renderUI = () => {
        // A wider grid for scientific
        container.innerHTML = `
            <div class="grid-keypad" style="grid-template-columns: repeat(5, 1fr);">
                <!-- Row 1 -->
                <button class="btn action mode-toggle">${isDegree ? 'DEG' : 'RAD'}</button>
                <button class="btn adv">sin</button>
                <button class="btn adv">cos</button>
                <button class="btn adv">tan</button>
                <button class="btn action">C</button>
                
                <!-- Row 2 -->
                <button class="btn adv">x²</button>
                <button class="btn adv">log</button>
                <button class="btn adv">ln</button>
                <button class="btn adv">(</button>
                <button class="btn adv">)</button>
                
                <!-- Row 3 -->
                <button class="btn adv">√x</button>
                <button class="btn num">7</button>
                <button class="btn num">8</button>
                <button class="btn num">9</button>
                <button class="btn operator">÷</button>
                
                <!-- Row 4 -->
                <button class="btn operator">x^y</button>
                <button class="btn num">4</button>
                <button class="btn num">5</button>
                <button class="btn num">6</button>
                <button class="btn operator">*</button>
                
                <!-- Row 5 -->
                <button class="btn adv">x!</button>
                <button class="btn num">1</button>
                <button class="btn num">2</button>
                <button class="btn num">3</button>
                <button class="btn operator">-</button>
                
                <!-- Row 6 -->
                <button class="btn adv">π</button>
                <button class="btn adv">e</button>
                <button class="btn num">0</button>
                <button class="btn num">.</button>
                <button class="btn operator">+</button>
                
                <!-- Row 7 -->
                <button class="btn action span-2">±</button>
                <button class="btn adv">1/x</button>
                <button class="btn equals span-2">=</button>
            </div>
        `;
    };

    const attachListeners = () => {
        const buttons = container.querySelectorAll('.btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = e.target.innerText;

                if (btn.classList.contains('mode-toggle')) {
                    isDegree = !isDegree;
                    e.target.innerText = isDegree ? 'DEG' : 'RAD';
                    return;
                }

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
                else if (val === 'π') {
                    currentInput = String(Math.PI);
                    awaitNewInput = true;
                }
                else if (val === 'e') {
                    currentInput = String(Math.E);
                    awaitNewInput = true;
                }
                else if (val === 'C') {
                    currentInput = '0';
                    previousInput = '';
                    currentOperator = null;
                    historyStr = '';
                    awaitNewInput = false;
                }
                else if (val === '±') {
                    currentInput = String(parseFloat(currentInput) * -1);
                }
                else if (btn.classList.contains('operator')) {
                    let op = val === 'x^y' ? '^' : val;
                    if (currentOperator && !awaitNewInput) {
                        currentInput = calculateBasic(currentOperator, previousInput, currentInput);
                    }
                    previousInput = currentInput;
                    currentOperator = op;
                    awaitNewInput = true;
                    historyStr = `${formatDisplayNumber(previousInput)} ${op}`;
                }
                else if (btn.classList.contains('adv')) {
                    let funcMap = {
                        'sin': 'sin', 'cos': 'cos', 'tan': 'tan',
                        'log': 'log', 'ln': 'ln', '√x': 'sqrt',
                        'x²': 'sq', 'x!': 'fact', '1/x': '1/x'
                    };

                    if (funcMap[val]) {
                        historyStr = `${val}(${formatDisplayNumber(currentInput)})`;
                        currentInput = calculateAdvanced(funcMap[val], currentInput);
                        awaitNewInput = true;
                    }
                }
                else if (btn.classList.contains('equals')) {
                    if (currentOperator && previousInput !== '') {
                        historyStr = `${formatDisplayNumber(previousInput)} ${currentOperator} ${formatDisplayNumber(currentInput)} =`;
                        currentInput = calculateBasic(currentOperator, previousInput, currentInput);
                        previousInput = '';
                        currentOperator = null;
                        awaitNewInput = true;
                    }
                }

                updateDisplay();
            });
        });
    };

    const updateDisplay = () => {
        mainDisplay.innerText = formatDisplayNumber(currentInput);
        historyDisplay.innerText = historyStr;
    };

    const mount = (newContainer, newMainDisplay, newHistoryDisplay) => {
        container = newContainer;
        mainDisplay = newMainDisplay;
        historyDisplay = newHistoryDisplay;
        renderUI();
        attachListeners();
        updateDisplay();
    };

    mount(container, mainDisplay, historyDisplay);

    return { mount };
};
