import { initGeneralCalculator } from './calculators/general.js';
import { initScientificCalculator } from './calculators/scientific.js';
import { initFinancialCalculator } from './calculators/financial.js';
import { initUnitConversion } from './calculators/unit-conversion.js';

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links li');
const calculatorGlass = document.querySelector('.calculator-glass');
const historyDisplay = document.getElementById('history-display');
const mainDisplay = document.getElementById('main-display');
const keypadContainer = document.getElementById('keypad-container');

// State
let currentMode = 'general';
let calculatorInstances = {};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Add click listeners to nav
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const mode = link.getAttribute('data-mode');
            if (mode !== currentMode) {
                switchMode(mode, link);
            }
        });
    });

    // Initialize the default calculator
    calculatorInstances['general'] = initGeneralCalculator(keypadContainer, mainDisplay, historyDisplay);
});

function switchMode(newMode, activeLinkElement) {
    // Update active class on nav
    navLinks.forEach(link => link.classList.remove('active'));
    activeLinkElement.classList.add('active');

    // Animate out current keypad
    keypadContainer.style.opacity = 0;

    setTimeout(() => {
        // Clear displays
        mainDisplay.innerText = '0';
        historyDisplay.innerText = '';
        currentMode = newMode;

        // Adjust container width based on mode
        if (newMode === 'scientific' || newMode === 'financial' || newMode === 'unit') {
            calculatorGlass.style.maxWidth = '600px';
        } else {
            calculatorGlass.style.maxWidth = '400px';
        }

        // Initialize or restore calculator instance
        switch (newMode) {
            case 'general':
                if (!calculatorInstances['general']) {
                    calculatorInstances['general'] = initGeneralCalculator(keypadContainer, mainDisplay, historyDisplay);
                } else {
                    calculatorInstances['general'].mount(keypadContainer, mainDisplay, historyDisplay);
                }
                break;
            case 'scientific':
                if (!calculatorInstances['scientific']) {
                    calculatorInstances['scientific'] = initScientificCalculator(keypadContainer, mainDisplay, historyDisplay);
                } else {
                    calculatorInstances['scientific'].mount(keypadContainer, mainDisplay, historyDisplay);
                }
                break;
            case 'financial':
                if (!calculatorInstances['financial']) {
                    calculatorInstances['financial'] = initFinancialCalculator(keypadContainer, mainDisplay, historyDisplay);
                } else {
                    calculatorInstances['financial'].mount(keypadContainer, mainDisplay, historyDisplay);
                }
                break;
            case 'unit':
                if (!calculatorInstances['unit']) {
                    calculatorInstances['unit'] = initUnitConversion(keypadContainer, mainDisplay, historyDisplay);
                } else {
                    calculatorInstances['unit'].mount(keypadContainer, mainDisplay, historyDisplay);
                }
                break;
        }

        // Fade back in
        keypadContainer.style.opacity = 1;
        attachRippleEffects();
    }, 300); // Wait for fade out
}

// Utility: Attach ripple effect to buttons
// Utility: Attach ripple effect to the keypad container via delegation
export function attachRippleEffects() {
    // Only attach to container once to avoid duplicate delegation
    if (keypadContainer.dataset.rippleAttached) return;

    keypadContainer.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripples = document.createElement('span');
        ripples.style.left = x + 'px';
        ripples.style.top = y + 'px';
        ripples.classList.add('ripple');

        btn.appendChild(ripples);

        setTimeout(() => {
            ripples.remove();
        }, 600);
    });

    keypadContainer.dataset.rippleAttached = 'true';
}

// Global utility for formatting large numbers
export function formatDisplayNumber(numString) {
    if (numString === 'Error' || numString === 'NaN') return 'Error';
    if (numString.includes('.')) {
        const parts = numString.split('.');
        const integerPart = parseFloat(parts[0]).toLocaleString('en-US');
        // Prevent floating point quirks from displaying
        const decimalPart = parts[1].slice(0, 8);
        return `${integerPart}.${decimalPart}`;
    }
    return parseFloat(numString).toLocaleString('en-US');
}
