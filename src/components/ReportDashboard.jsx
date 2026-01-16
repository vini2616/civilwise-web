import React from 'react';
import { useData } from '../context/DataContext';

const ReportDashboard = ({ onNavigate }) => {
    const { concreteTests, steelTests, brickTests } = useData();

    // Calculate KPIs
    const allTests = [...concreteTests, ...steelTests, ...brickTests];
    const totalTests = allTests.length;
    const failedTests = allTests.filter(t =>
        (t.results?.overall === 'Fail') ||
        (t.results?.day7?.result === 'Fail') ||
        (t.results?.day28?.result === 'Fail')
    ).length;

    // Reminder Logic
    const today = new Date().toISOString().split('T')[0];
    const reminders = concreteTests.filter(t => {
        if (t.status === 'Tested' || t.status === 'Approved') return false;
        return t.dates.day7 === today || t.dates.day14 === today || t.dates.day28 === today;
    }).map(t => {
        let dueType = '';
        if (t.dates.day7 === today) dueType = '7-Day';
        if (t.dates.day14 === today) dueType = '14-Day';
        if (t.dates.day28 === today) dueType = '28-Day';
        return { ...t, dueType };
    });

    const overdue = concreteTests.filter(t => {
        if (t.status === 'Tested' || t.status === 'Approved') return false;
        return (t.dates.day7 < today && !t.results?.day7) ||
            (t.dates.day14 < today && !t.results?.day14) ||
            (t.dates.day28 < today && !t.results?.day28);
    });

    return (
        <div className="report-dashboard">
            <div className="page-header">
                <h1>Test Reports Dashboard</h1>
                <p className="text-muted">Overview of material quality tests and reminders.</p>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                <div className="kpi-card blue">
                    <h3>Total Tests</h3>
                    <div className="value">{totalTests}</div>
                    <div className="label">Scheduled This Month</div>
                </div>
                <div className="kpi-card green">
                    <h3>Completed</h3>
                    <div className="value">{allTests.filter(t => t.status === 'Tested' || t.status === 'Approved').length}</div>
                    <div className="label">Tests Done</div>
                </div>
                <div className="kpi-card red">
                    <h3>Failed</h3>
                    <div className="value">{failedTests}</div>
                    <div className="label">Attention Required</div>
                </div>
                <div className="kpi-card orange">
                    <h3>Overdue</h3>
                    <div className="value">{overdue.length}</div>
                    <div className="label">Missed Tests</div>
                </div>
            </div>

            {/* Reminders Panel */}
            <div className="reminders-panel card">
                <div className="card-header">
                    <h3>🔔 Today's Reminders</h3>
                </div>
                <div className="reminders-list">
                    {reminders.length > 0 ? (
                        reminders.map(r => (
                            <div key={r.id} className="reminder-item">
                                <div className="reminder-icon">📅</div>
                                <div className="reminder-content">
                                    <h4>{r.dueType} Cube Test Due</h4>
                                    <p>{r.location} • {r.grade}</p>
                                </div>
                                <button className="btn btn-sm btn-primary" onClick={() => onNavigate('concrete')}>
                                    Enter Results
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-reminders">
                            <p>No tests due today. You're all caught up! 🎉</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                    <button className="btn-action" onClick={() => onNavigate('add-concrete')}>
                        <span>🧊</span> Add Concrete Test
                    </button>
                    <button className="btn-action" onClick={() => onNavigate('add-steel')}>
                        <span>🏗️</span> Add Steel Test
                    </button>
                    <button className="btn-action" onClick={() => onNavigate('add-brick')}>
                        <span>🧱</span> Add Brick Test
                    </button>
                </div>
            </div>

            <style>{`
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .kpi-card {
                    background: white;
                    padding: 20px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    border-left: 4px solid transparent;
                }

                .kpi-card.blue { border-left-color: #3b82f6; }
                .kpi-card.green { border-left-color: #22c55e; }
                .kpi-card.red { border-left-color: #ef4444; }
                .kpi-card.orange { border-left-color: #f97316; }

                .kpi-card h3 {
                    font-size: 0.9rem;
                    color: var(--text-light);
                    margin-bottom: 8px;
                }

                .kpi-card .value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-color);
                    margin-bottom: 4px;
                }

                .kpi-card .label {
                    font-size: 0.8rem;
                    color: var(--text-light);
                }

                .reminders-panel {
                    margin-bottom: 32px;
                }

                .reminders-list {
                    padding: 20px;
                }

                .reminder-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    background: #fff7ed;
                    border: 1px solid #ffedd5;
                    border-radius: var(--radius-md);
                    margin-bottom: 12px;
                }

                .reminder-icon {
                    font-size: 1.5rem;
                }

                .reminder-content {
                    flex: 1;
                }

                .reminder-content h4 {
                    font-size: 1rem;
                    color: #9a3412;
                    margin-bottom: 4px;
                }

                .reminder-content p {
                    font-size: 0.9rem;
                    color: #c2410c;
                }

                .empty-reminders {
                    text-align: center;
                    padding: 20px;
                    color: var(--text-light);
                    font-style: italic;
                }

                .quick-actions h3 {
                    margin-bottom: 16px;
                }

                .action-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .btn-action {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 20px;
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: var(--shadow-sm);
                }

                .btn-action span {
                    font-size: 1.5rem;
                }

                .btn-action:hover {
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                    color: var(--primary-color);
                }
            `}</style>
        </div>
    );
};

export default ReportDashboard;
