import React, { useState, useEffect } from 'react';
import { generateDPRPDF, generateDetailedHistoryPDF } from '../utils/pdfGenerator';
import { generateHistoryCSV } from '../utils/exportUtils';

import { useData } from '../context/DataContext';

import { firestoreService } from '../services/firestoreService';

const DPRHistory = ({ onNavigate, currentUser }) => {
    const { activeSite, dprs, deleteDPR } = useData();
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (dprs) {
            // Map backend DPRs to history format
            const formattedHistory = dprs.map(d => {
                // Helper to check if array has meaningful data
                const hasData = (arr, fields) => {
                    if (!arr || arr.length === 0) return false;
                    return arr.some(item => fields.some(field => item[field] && item[field].toString().trim() !== ''));
                };

                const hasMorningData = hasData(d.manpower, ['trade', 'contractor', 'note']) ||
                    hasData(d.workStarted, ['description', 'location', 'note']);

                const hasEveningData = hasData(d.work, ['desc', 'grid', 'qty']) ||
                    hasData(d.materials, ['name', 'supplier', 'qty']) ||
                    hasData(d.reconciliation, ['item', 'theory', 'actual']) ||
                    hasData(d.equipment, ['name', 'qty']);

                let type = 'DPR';
                if (hasMorningData && !hasEveningData) {
                    type = 'Morning Report';
                } else if (hasEveningData && !hasMorningData) {
                    type = 'Evening Report';
                } else if (hasMorningData && hasEveningData) {
                    type = 'DPR';
                } else {
                    // If both are empty, it might be a draft or just created. Default to DPR or check time?
                    // Let's stick to DPR for now.
                    type = 'DPR';
                }

                return {
                    id: d._id,
                    dprNo: d.projectInfo.dprNo,
                    date: d.projectInfo.date,
                    project: d.projectInfo.projectName,
                    type: type,
                    data: d, // The full DPR object
                    photos: d.photos || []
                };
            });
            setHistory(formattedHistory);
        }
    }, [dprs]);

    // Debug Permissions
    console.log('DPRHistory CurrentUser:', currentUser);
    console.log('Is Admin?', currentUser?.role === 'Owner' || currentUser?.role === 'Admin' || currentUser?.role === 'Partner' || currentUser?.permission === 'full_control');

    const handleLoad = (item) => {
        // Force update localStorage and navigate
        const dataToSave = { ...item.data, id: item.id, type: item.type };
        localStorage.setItem(`vini_dpr_data_${activeSite}`, JSON.stringify(dataToSave));
        // Small delay to ensure storage is written before component mount
        setTimeout(() => {
            onNavigate('dpr');
        }, 50);
    };

    const handleViewPDF = (item) => {
        generateDPRPDF(item.data, item.photos || [], 'view');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
            try {
                const res = await deleteDPR(id);
                if (res.success) {
                    // State update handled in context
                } else {
                    alert("Error deleting report: " + res.message);
                }
            } catch (e) {
                alert("Error deleting report: " + e.message);
            }
        }
    };

    const filteredHistory = history.filter(item =>
        (item.project || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.date || '').includes(searchTerm) ||
        (item.dprNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAdmin = currentUser?.role === 'Owner' || currentUser?.role === 'Admin' || currentUser?.role === 'Partner' || currentUser?.permission === 'full_control';

    return (
        <div className="dpr-history-container fade-in">
            {/* Header */}
            <div className="history-header">
                <div className="header-content">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNavigate('dpr')}
                            className="back-btn"
                            title="Back to DPR"
                        >
                            <span className="text-xl">←</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => generateHistoryCSV(filteredHistory)}
                                className="btn-export btn-csv"
                                title="Export to Excel (CSV)"
                            >
                                📊 Excel
                            </button>
                            <div className="search-wrapper">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="history-content">
                {history.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3 className="empty-title">No Reports Found</h3>
                        <p className="empty-text">Generate a PDF in the DPR section to see it here.</p>
                        <button
                            onClick={() => onNavigate('dpr')}
                            className="btn btn-primary mt-4"
                        >
                            Go to DPR
                        </button>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-text">No reports match your search.</p>
                    </div>
                ) : (
                    <div className="history-grid">
                        {filteredHistory.map(item => (
                            <div key={item.id} className="history-card">
                                <div className="card-left">
                                    <div className="card-icon">📄</div>
                                    <div>
                                        <h3 className="card-title">{item.dprNo}</h3>
                                        <div className="card-meta">
                                            <span>📅 {item.date}</span>
                                            <span className="separator">|</span>
                                            <span>🏗️ {item.project || 'Unknown Project'}</span>
                                            {item.type && (
                                                <>
                                                    <span className="separator">|</span>
                                                    <span className={`badge ${item.type === 'Morning Report' ? 'badge-morning' : item.type === 'Evening Report' ? 'badge-evening' : 'badge-dpr'}`}>
                                                        {item.type === 'Morning Report' ? '🌅 Morning' : item.type === 'Evening Report' ? '🌇 Evening' : '📄 DPR'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="dpr-card-actions">
                                    <button
                                        onClick={() => handleViewPDF(item)}
                                        className="dpr-btn-action btn-view"
                                        title="View Immutable PDF"
                                    >
                                        👁️ View PDF
                                    </button>
                                    <button
                                        onClick={() => handleLoad(item)}
                                        className="dpr-btn-action btn-load"
                                        title="Edit/Load Data"
                                    >
                                        ✏️ Edit / Load
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="dpr-btn-action btn-delete"
                                            title="Delete Report"
                                        >
                                            🗑️ Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .dpr-history-container {
                    background-color: #f8fafc;
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                }
                .history-header {
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .header-content {
                    max-width: 1024px;
                    margin: 0 auto;
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .back-btn {
                    padding: 8px 12px;
                    border-radius: 50%;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .back-btn:hover {
                    background: #f1f5f9;
                }
                .page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }
                .page-subtitle {
                    font-size: 0.875rem;
                    color: #64748b;
                    margin: 0;
                }
                .search-wrapper {
                    position: relative;
                    width: 300px;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }
                .search-input {
                    width: 100%;
                    padding: 10px 16px 10px 40px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: #f8fafc;
                    outline: none;
                    transition: all 0.2s;
                }
                .search-input:focus {
                    background: white;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .history-content {
                    max-width: 1024px;
                    margin: 0 auto;
                    padding: 32px 16px;
                }
                .empty-state {
                    text-center: center;
                    padding: 60px 0;
                }
                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 16px;
                    color: #cbd5e1;
                }
                .empty-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #475569;
                }
                .empty-text {
                    color: #94a3b8;
                    margin-top: 8px;
                }
                .history-grid {
                    display: grid;
                    gap: 16px;
                }
                .history-card {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 16px;
                    align-items: center;
                    transition: all 0.2s;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .history-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    border-color: #bfdbfe;
                }
                .card-left {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    min-width: 0;
                }
                .card-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #eff6ff;
                    color: #3b82f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }
                .card-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 4px 0;
                }
                .card-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.875rem;
                    color: #64748b;
                    flex-wrap: wrap;
                }
                .separator {
                    color: #cbd5e1;
                }
                .dpr-card-actions {
                    display: flex !important;
                    gap: 12px;
                    align-items: center;
                }
                .dpr-btn-action {
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                    white-space: nowrap;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                .btn-view {
                    background: #f0f9ff;
                    color: #0369a1;
                }
                .btn-view:hover {
                    background: #e0f2fe;
                }
                .btn-load {
                    background: #f1f5f9;
                    color: #475569;
                }
                .btn-load:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }
                .btn-delete {
                    background: #fee2e2;
                    color: #ef4444;
                }
                .btn-delete:hover {
                    background: #fecaca;
                    color: #dc2626;
                }
                .btn-export {
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .btn-csv {
                    background: #ecfdf5;
                    color: #059669;
                    border: 1px solid #d1fae5;
                }
                .btn-csv:hover {
                    background: #d1fae5;
                }
                .btn-pdf {
                    background: #fff1f2;
                    color: #e11d48;
                    border: 1px solid #ffe4e6;
                }
                .btn-pdf:hover {
                    background: #ffe4e6;
                }
                .fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .badge {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                }
                .badge-morning {
                    background: #fef3c7;
                    color: #d97706;
                    border: 1px solid #fcd34d;
                }
                .badge-dpr {
                    background: #e0e7ff;
                    color: #4338ca;
                    border: 1px solid #c7d2fe;
                }
                .badge-evening {
                    background: #f3e8ff;
                    color: #7e22ce;
                    border: 1px solid #d8b4fe;
                }
            `}</style>
        </div>
    );
};

export default DPRHistory;
