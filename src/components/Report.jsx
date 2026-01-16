import React, { useState } from 'react';
import ConcreteTestForm from './ReportForms/ConcreteTestForm';
import SteelTestForm from './ReportForms/SteelTestForm';
import BrickTestForm from './ReportForms/BrickTestForm';
import TestList from './TestList';
import TestResultPage from './TestResultPage';
import { checkPermission } from '../utils/permissions';

const Report = ({ currentUser }) => {
    const permission = checkPermission(currentUser, 'report');

    if (permission === 'no_access') {
        return (
            <div className="report-container flex items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="text-xl text-red-600 font-bold">🚫 Access Denied</h2>
                    <p className="text-gray-500 mt-2">You do not have permission to view the Report module.</p>
                </div>
            </div>
        );
    }

    const [activeView, setActiveView] = useState('concrete'); // concrete, steel, brick
    const [selectedTest, setSelectedTest] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const handleEnterResult = (test, day) => {
        setSelectedTest(test);
        setSelectedDay(day);
        setActiveView('enter-result');
    };

    const handleEdit = (test, type) => {
        setSelectedTest(test); // Contains full report data
        if (type === 'concrete') setActiveView('add-concrete');
        if (type === 'steel') setActiveView('add-steel');
        if (type === 'brick') setActiveView('add-brick');
    };

    const renderContent = () => {
        switch (activeView) {
            case 'concrete':
                return <TestList type="concrete" onNavigate={setActiveView} onEnterResult={handleEnterResult} onEdit={(t) => handleEdit(t, 'concrete')} />;
            case 'steel':
                return <TestList type="steel" onNavigate={setActiveView} onEdit={(t) => handleEdit(t, 'steel')} />;
            case 'brick':
                return <TestList type="brick" onNavigate={setActiveView} onEdit={(t) => handleEdit(t, 'brick')} />;
            case 'add-concrete':
                return <ConcreteTestForm
                    onBack={() => { setActiveView('concrete'); setSelectedTest(null); }}
                    initialData={selectedTest}
                />;
            case 'add-steel':
                return <SteelTestForm
                    onBack={() => { setActiveView('steel'); setSelectedTest(null); }}
                    initialData={selectedTest}
                />;
            case 'add-brick':
                return <BrickTestForm
                    onBack={() => { setActiveView('brick'); setSelectedTest(null); }}
                    initialData={selectedTest}
                />;
            case 'enter-result':
                return <TestResultPage test={selectedTest} day={selectedDay} onBack={() => setActiveView('concrete')} />;
            default:
                return <TestList type="concrete" onNavigate={setActiveView} />;
        }
    };

    return (
        <div className="report-container fade-in">
            <div className="report-sidebar">
                <div className="sidebar-header">
                    <h3>📑 Reports</h3>
                </div>
                <ul className="report-menu">
                    <li className={activeView === 'concrete' || activeView === 'add-concrete' ? 'active' : ''} onClick={() => setActiveView('concrete')}>
                        🧊 Concrete Cubes
                    </li>
                    <li className={activeView === 'steel' || activeView === 'add-steel' ? 'active' : ''} onClick={() => setActiveView('steel')}>
                        🏗️ Steel Tests
                    </li>
                    <li className={activeView === 'brick' || activeView === 'add-brick' ? 'active' : ''} onClick={() => setActiveView('brick')}>
                        🧱 Block / Brick
                    </li>
                </ul>
            </div>
            <div className="report-content">
                {renderContent()}
            </div>

            <style>{`
                .report-container {
                    display: flex;
                    gap: 24px;
                    height: calc(100vh - 100px); /* Adjust based on top bar */
                }

                .report-sidebar {
                    width: 250px;
                    background: white;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-md);
                    padding: 20px;
                    flex-shrink: 0;
                }

                .sidebar-header h3 {
                    margin-bottom: 20px;
                    color: var(--primary-color);
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 10px;
                }

                .report-menu {
                    list-style: none;
                    padding: 0;
                }

                .report-menu li {
                    padding: 12px 16px;
                    margin-bottom: 8px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                    color: var(--text-color);
                }

                .report-menu li:hover {
                    background: var(--bg-secondary);
                    color: var(--primary-color);
                }

                .report-menu li.active {
                    background: var(--primary-color);
                    color: white;
                    box-shadow: var(--shadow-sm);
                }

                .report-content {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 10px; /* Space for scrollbar */
                }

                @media (max-width: 768px) {
                    .report-container {
                        flex-direction: column;
                        height: auto;
                    }
                    .report-sidebar {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default Report;
