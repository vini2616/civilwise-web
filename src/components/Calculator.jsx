import React, { useState, useEffect, useCallback } from 'react';

const Calculator = ({ onClose }) => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    const handleNumber = useCallback((num) => {
        setDisplay(prev => prev === '0' ? String(num) : prev + num);
    }, []);

    const handleOperator = useCallback((op) => {
        setDisplay('0');
        setEquation(prevDisplay => {
            // If we already have an equation pending (e.g. "5 + "), calculate it first for continuous operations?
            // For simplicity, let's just take the current display.
            // But wait, we need the PREVIOUS display value before we cleared it.
            // The issue with the previous logic was: setEquation(display + ' ' + op + ' '); setDisplay('0');
            // This relied on 'display' state which might be stale in a closure if not careful, 
            // but here inside the component body 'display' is current render's display.
            // However, inside useEffect/useCallback, we need to be careful.

            // Let's pass the current display value to this function to avoid dependency issues, 
            // or use the state updater pattern if possible, but we need both states.
            // Actually, the simplest way for the keyboard handler is to call these functions, 
            // so they need to access the latest state.
            return prevDisplay; // Placeholder, see actual logic below
        });
    }, []);

    // Refactored logic to be friendly to both click and keyboard
    // We need to use refs or functional updates to access latest state in event listener,
    // OR just include dependencies in useCallback.

    const onNumberClick = (num) => {
        setDisplay(prev => prev === '0' ? String(num) : prev + num);
    };

    const onOperatorClick = (op) => {
        setEquation(prev => prev + display + ' ' + op + ' ');
        setDisplay('0');
    };

    const onEqualClick = () => {
        try {
            // eslint-disable-next-line no-eval
            const result = eval(equation + display);
            setDisplay(String(result));
            setEquation('');
        } catch (error) {
            setDisplay('Error');
            setEquation('');
        }
    };

    const onClearClick = () => {
        setDisplay('0');
        setEquation('');
    };

    const onDeleteClick = () => {
        setDisplay(prev => prev.slice(0, -1) || '0');
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key;

            // Numbers
            if (/^[0-9]$/.test(key)) {
                e.preventDefault();
                onNumberClick(key);
            }
            // Operators
            else if (['+', '-', '*', '/'].includes(key)) {
                e.preventDefault();
                onOperatorClick(key);
            }
            // Enter or =
            else if (key === 'Enter' || key === '=') {
                e.preventDefault();
                onEqualClick();
            }
            // Backspace
            else if (key === 'Backspace') {
                e.preventDefault();
                onDeleteClick();
            }
            // Escape or c/C
            else if (key === 'Escape' || key.toLowerCase() === 'c') {
                e.preventDefault();
                onClearClick();
            }
            // Decimal
            else if (key === '.' || key === ',') {
                e.preventDefault();
                setDisplay(prev => prev.includes('.') ? prev : prev + '.');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [display, equation]); // Dependencies are crucial here for the handlers to see latest state

    return (
        <div className="popup-overlay">
            <div className="popup-content calculator-popup">
                <div className="popup-header">
                    <h3>Calculator</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <div className="calculator-display">
                    <div className="calc-equation">{equation}</div>
                    <div className="calc-current">{display}</div>
                </div>
                <div className="calculator-grid">
                    <button onClick={onClearClick} className="calc-btn span-2 clear">AC</button>
                    <button onClick={onDeleteClick} className="calc-btn">DEL</button>
                    <button onClick={() => onOperatorClick('/')} className="calc-btn operator">÷</button>

                    <button onClick={() => onNumberClick('7')} className="calc-btn">7</button>
                    <button onClick={() => onNumberClick('8')} className="calc-btn">8</button>
                    <button onClick={() => onNumberClick('9')} className="calc-btn">9</button>
                    <button onClick={() => onOperatorClick('*')} className="calc-btn operator">×</button>

                    <button onClick={() => onNumberClick('4')} className="calc-btn">4</button>
                    <button onClick={() => onNumberClick('5')} className="calc-btn">5</button>
                    <button onClick={() => onNumberClick('6')} className="calc-btn">6</button>
                    <button onClick={() => onOperatorClick('-')} className="calc-btn operator">-</button>

                    <button onClick={() => onNumberClick('1')} className="calc-btn">1</button>
                    <button onClick={() => onNumberClick('2')} className="calc-btn">2</button>
                    <button onClick={() => onNumberClick('3')} className="calc-btn">3</button>
                    <button onClick={() => onOperatorClick('+')} className="calc-btn operator">+</button>

                    <button onClick={() => onNumberClick('0')} className="calc-btn span-2">0</button>
                    <button onClick={() => setDisplay(prev => prev.includes('.') ? prev : prev + '.')} className="calc-btn">.</button>
                    <button onClick={onEqualClick} className="calc-btn operator">=</button>
                </div>
            </div>
        </div>
    );
};

export default Calculator;
