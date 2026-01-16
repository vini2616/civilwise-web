import React, { useState, useMemo } from 'react';
import SearchableSelect from './SearchableSelect';
import { useData } from '../context/DataContext';
import { generateAccountCSV } from '../utils/exportUtils';
import { checkPermission, canEnterData, canEditDelete } from '../utils/permissions';

// Tally-style Ledger View Component
const LedgerView = ({ transactions, partyName, onClose, companyName }) => {
    // Date Filter State
    const [startDate, setStartDate] = useState('2024-04-01');
    const [endDate, setEndDate] = useState('2025-03-31');

    // Opening Balance State
    const [openingBalanceDr, setOpeningBalanceDr] = useState('');
    const [openingBalanceCr, setOpeningBalanceCr] = useState('');

    // Calculate Running Totals
    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const sortedTransactions = useMemo(() => {
        return [...transactions].filter(t => {
            if (!t.date) return true;
            return t.date >= startDate && t.date <= endDate;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [transactions, startDate, endDate]);

    const rows = sortedTransactions.map(t => {
        const isExpense = t.type === 'expense' || t.type === 'debit'; // We paid them -> Debit Party
        const isIncome = t.type === 'income' || t.type === 'credit';   // They paid us -> Credit Party

        const debit = isExpense ? Number(t.amount) : 0;
        const credit = isIncome ? Number(t.amount) : 0;

        totalDebit += debit;
        totalCredit += credit;
        runningBalance += (debit - credit);

        return {
            ...t,
            debit,
            credit,
            vchType: isExpense ? 'Payment' : 'Receipt',
            particulars: t.mode || t.category || 'Cash',
            vchNo: t.id,
            billNo: t.billNo || '-'
        };
    });

    // Calculate Closing Balance including Opening Balance
    const opDr = Number(openingBalanceDr) || 0;
    const opCr = Number(openingBalanceCr) || 0;
    const netOpening = opDr - opCr;

    const closingBalance = netOpening + totalDebit - totalCredit;

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `Ledger - ${partyName}`;
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="tally-ledger-container">
            {/* Top Blue Bar */}
            <div className="tally-header-bar no-print">
                <div className="tally-header-title">Ledger Vouchers</div>
                <div className="tally-company-name">{companyName || 'CivilWise Construction'}</div>
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="tally-action-btn">🖨️ Print</button>
                    <button onClick={onClose} className="tally-close-btn">×</button>
                </div>
            </div>

            {/* Ledger Info */}
            <div className="tally-subheader">
                <div className="tally-ledger-name">Ledger: <span className="font-bold">{partyName}</span></div>
                <div className="tally-date-range no-print">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="tally-date-input"
                    />
                    to
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="tally-date-input"
                    />
                </div>
                <div className="print-only">
                    {startDate} to {endDate}
                </div>
            </div>

            {/* Table */}
            <div className="tally-table-wrapper">
                <table className="tally-ledger-table">
                    <thead>
                        <tr>
                            <th style={{ width: '10%' }}>Date</th>
                            <th style={{ width: '25%' }}>Particulars</th>
                            <th style={{ width: '10%' }}>Vch Type</th>
                            <th style={{ width: '8%' }}>Vch No.</th>
                            <th style={{ width: '10%' }}>Bill No.</th>
                            <th style={{ width: '12%', textAlign: 'right' }}>Debit</th>
                            <th style={{ width: '12%', textAlign: 'right' }}>Credit</th>
                            <th style={{ width: '13%' }}>Verification Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id} className="tally-row">
                                <td>{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td className="font-bold">{row.particulars}</td>
                                <td>{row.vchType}</td>
                                <td>{row.vchNo}</td>
                                <td>{row.billNo}</td>
                                <td style={{ textAlign: 'right' }}>{row.debit ? row.debit.toFixed(2) : ''}</td>
                                <td style={{ textAlign: 'right' }}>{row.credit ? row.credit.toFixed(2) : ''}</td>
                                <td></td>
                            </tr>
                        ))}
                        {/* Blank rows to fill space if needed */}
                        {Array.from({ length: Math.max(0, 10 - rows.length) }).map((_, i) => (
                            <tr key={`empty-${i}`} style={{ height: '24px' }}>
                                <td colSpan="8"></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="tally-footer-row">
                            <td colSpan="5" style={{ textAlign: 'right', fontStyle: 'italic' }}>Opening Balance :</td>
                            <td style={{ textAlign: 'right' }}>
                                <input
                                    type="number"
                                    value={openingBalanceDr}
                                    onChange={(e) => {
                                        setOpeningBalanceDr(e.target.value);
                                        if (e.target.value) setOpeningBalanceCr('');
                                    }}
                                    className="tally-input-sm no-print"
                                    placeholder="Dr"
                                />
                                <span className="print-only">{openingBalanceDr ? Number(openingBalanceDr).toFixed(2) : ''}</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <input
                                    type="number"
                                    value={openingBalanceCr}
                                    onChange={(e) => {
                                        setOpeningBalanceCr(e.target.value);
                                        if (e.target.value) setOpeningBalanceDr('');
                                    }}
                                    className="tally-input-sm no-print"
                                    placeholder="Cr"
                                />
                                <span className="print-only">{openingBalanceCr ? Number(openingBalanceCr).toFixed(2) : ''}</span>
                            </td>
                            <td></td>
                        </tr>
                        <tr className="tally-footer-row">
                            <td colSpan="5" style={{ textAlign: 'right', fontStyle: 'italic' }}>Current Total :</td>
                            <td style={{ textAlign: 'right', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>{totalDebit.toFixed(2)}</td>
                            <td style={{ textAlign: 'right', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>{totalCredit.toFixed(2)}</td>
                            <td></td>
                        </tr>
                        <tr className="tally-footer-row">
                            <td colSpan="5" style={{ textAlign: 'right', fontStyle: 'italic' }}>Closing Balance :</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                {closingBalance > 0 ? closingBalance.toFixed(2) : ''}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                {closingBalance < 0 ? Math.abs(closingBalance).toFixed(2) : ''}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <style>{`
                .tally-ledger-container {
                    background: white;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    border: 1px solid #ccc;
                }
                .tally-header-bar {
                    background: #87ceeb; /* Sky Blue like image */
                    padding: 4px 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #555;
                }
                .tally-header-title {
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                .tally-company-name {
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                .tally-close-btn {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    line-height: 1;
                }
                .tally-action-btn {
                    background: #fff;
                    border: 1px solid #555;
                    padding: 2px 8px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    border-radius: 4px;
                }
                .tally-subheader {
                    padding: 8px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #fff;
                    font-size: 0.95rem;
                }
                .tally-date-range {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .tally-date-input {
                    padding: 2px 4px;
                    border: 1px solid #ccc;
                    font-family: inherit;
                }
                .tally-table-wrapper {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0 16px 16px 16px;
                }
                .tally-ledger-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }
                .tally-ledger-table th {
                    border: 1px solid #ccc;
                    padding: 4px 8px;
                    background: #f0f0f0; /* Light gray header */
                    font-weight: bold;
                    text-align: center;
                }
                .tally-ledger-table td {
                    border-left: 1px solid #ccc;
                    border-right: 1px solid #ccc;
                    padding: 2px 8px;
                    vertical-align: top;
                }
                .tally-row:hover {
                    background-color: #fef08a; /* Yellow highlight on hover */
                }
                .tally-footer-row td {
                    border-top: 1px solid #ccc;
                    border-bottom: 1px solid #ccc;
                    background: #fff;
                    padding: 4px 8px;
                    font-weight: bold;
                }
                .tally-input-sm {
                    width: 80px;
                    padding: 2px;
                    border: 1px solid #ccc;
                    text-align: right;
                    font-size: 0.9rem;
                }
                .print-only { display: none; }
                
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .tally-ledger-container, .tally-ledger-container * {
                        visibility: visible;
                    }
                    .tally-ledger-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: auto;
                        border: none;
                        margin: 0;
                        padding: 0;
                    }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .tally-table-wrapper { overflow: visible; }
                }
            `}</style>
        </div>
    );
};

const Account = ({ currentUser, onNavigate, setPageData }) => {
    const { transactions, deleteTransaction, companies, activeCompanyId } = useData();
    const [filterType, setFilterType] = useState('all'); // all, income, expense
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParty, setSelectedParty] = useState('');

    const permission = checkPermission(currentUser, 'account');
    const isAdmin = permission === 'full_control';
    const canAdd = canEnterData(permission);
    const canManage = canEditDelete(permission);

    // Get Active Company Name
    const activeCompany = companies.find(c => c.id === activeCompanyId);
    const companyName = activeCompany ? activeCompany.name : 'CivilWise Construction';

    // Party Options
    const partyOptions = useMemo(() => {
        if (!Array.isArray(transactions)) {
            return [];
        }
        const parties = new Set(transactions.map(t => {
            if (!t) return '';
            const name = t.partyName;
            if (typeof name === 'string' && name.trim() !== '') {
                return name;
            }
            return '';
        }).filter(Boolean));

        return Array.from(parties).sort().map(p => ({
            label: String(p),
            value: String(p)
        }));
    }, [transactions]);

    // Filter Transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesType = filterType === 'all' ||
                (filterType === 'income' && (t.type === 'income' || t.type === 'credit')) ||
                (filterType === 'expense' && (t.type === 'expense' || t.type === 'debit'));
            const matchesParty = !selectedParty || t.partyName === selectedParty;
            const matchesSearch = (typeof t.note === 'string' ? t.note : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (typeof t.category === 'string' ? t.category : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (typeof t.partyName === 'string' ? t.partyName : '').toLowerCase().includes(searchTerm.toLowerCase());

            // Exclude Cashbook entries
            if (t.isCashbook) return false;

            return matchesType && matchesSearch && matchesParty;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, filterType, searchTerm, selectedParty]);

    // Calculate Stats
    const stats = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.isCashbook) return acc; // Exclude Cashbook entries

            const amount = Number(t.amount) || 0;
            if (t.type === 'income' || t.type === 'credit') {
                acc.income += amount;
                acc.balance += amount;
            } else {
                acc.expense += amount;
                acc.balance -= amount;
            }
            return acc;
        }, { income: 0, expense: 0, balance: 0 });
    }, [transactions]);

    const handleEdit = (transaction) => {
        setPageData(transaction);
        onNavigate('transaction-form');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(id);
        }
    };

    const openAddPage = () => {
        setPageData(null);
        onNavigate('transaction-form');
    };

    const viewBill = (imageStr) => {
        const win = window.open("");
        if (imageStr.startsWith('data:application/pdf')) {
            win.document.write(`<iframe src="${imageStr}" style="width:100%; height:100vh; border:none;"></iframe>`);
        } else {
            win.document.write(`<img src="${imageStr}" style="max-width:100%; height:auto;" />`);
        }
    };

    // If a party is selected, show the Tally-style Ledger View
    if (selectedParty) {
        return (
            <LedgerView
                transactions={filteredTransactions}
                partyName={selectedParty}
                onClose={() => setSelectedParty('')}
                companyName={companyName}
            />
        );
    }

    return (
        <div className="account-container fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Accounts & Expenses</h2>
                    <p className="page-subtitle">Manage your project finances</p>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => generateAccountCSV(filteredTransactions)}
                        className="btn btn-outline"
                    >
                        📊 Export Excel
                    </button>
                    {canAdd && (
                        <button
                            onClick={openAddPage}
                            className="btn btn-primary"
                        >
                            + Add Transaction
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card income">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <span className="stat-label">Total Credit</span>
                        <span className="stat-value">₹{stats.income.toLocaleString()}</span>
                    </div>
                </div>
                <div className="stat-card expense">
                    <div className="stat-icon">💸</div>
                    <div className="stat-info">
                        <span className="stat-label">Total Debit</span>
                        <span className="stat-value">₹{stats.expense.toLocaleString()}</span>
                    </div>
                </div>
                <div className="stat-card balance">
                    <div className="stat-icon">⚖️</div>
                    <div className="stat-info">
                        <span className="stat-label">Net Balance</span>
                        <span className={`stat-value ${stats.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                            ₹{stats.balance.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <button
                        className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterType('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filterType === 'income' ? 'active' : ''}`}
                        onClick={() => setFilterType('income')}
                    >
                        Credit
                    </button>
                    <button
                        className={`filter-btn ${filterType === 'expense' ? 'active' : ''}`}
                        onClick={() => setFilterType('expense')}
                    >
                        Debit
                    </button>
                </div>

                <div className="flex items-center gap-2" style={{ zIndex: 10 }}>
                    <div style={{ width: '250px' }}>
                        <div style={{ width: '250px' }}>
                            <SearchableSelect
                                options={partyOptions}
                                value={selectedParty}
                                onChange={(val) => setSelectedParty(val)}
                                placeholder="Select Party for Ledger..."
                            />
                        </div>
                    </div>
                </div>

                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Party / Description</th>
                            <th>Category</th>
                            <th>Base Amount</th>
                            <th>GST %</th>
                            <th>GST Amount</th>
                            <th>Total Amount</th>
                            <th>Mode</th>
                            <th>Bill</th>
                            {canManage && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map(t => (
                                <tr key={t.id}>
                                    <td>{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td>
                                        <div className="font-medium">{typeof t.partyName === 'string' ? t.partyName : 'Unknown'}</div>
                                        <div className="text-xs text-muted">{typeof t.note === 'string' ? t.note : '-'}</div>
                                    </td>
                                    <td>
                                        <span className="badge">{t.category || 'General'}</span>
                                    </td>
                                    <td>₹{Number(t.baseAmount || 0).toLocaleString()}</td>
                                    <td>{t.gstRate || 0}%</td>
                                    <td>₹{Number(t.gstAmount || Math.round((Number(t.baseAmount || 0) * (Number(t.gstRate || 0)) / 100))).toLocaleString()}</td>
                                    <td className={`font-bold ${['income', 'credit'].includes(t.type) ? 'text-success' : 'text-danger'}`}>
                                        {['income', 'credit'].includes(t.type) ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                                    </td>
                                    <td className="capitalize">{t.mode}</td>
                                    <td>
                                        <div className="flex flex-col gap-1">
                                            {t.billImage ? (
                                                <button onClick={() => viewBill(t.billImage)} className="btn-link text-xs">
                                                    📎 Bill
                                                </button>
                                            ) : (
                                                <span className="text-muted text-xs">No Bill</span>
                                            )}
                                            {t.paymentProof ? (
                                                <button onClick={() => viewBill(t.paymentProof)} className="btn-link text-xs">
                                                    📷 Proof
                                                </button>
                                            ) : null}
                                        </div>
                                    </td>
                                    {canManage && (
                                        <td>
                                            <div className="action-buttons">
                                                <button onClick={() => handleEdit(t)} className="btn-icon edit" title="Edit">
                                                    ✏️
                                                </button>
                                                <button onClick={() => handleDelete(t._id || t.id)} className="btn-icon delete" title="Delete">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center py-8 text-muted">
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .account-container {
                    padding: 24px;
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }
                .page-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }
                .page-subtitle {
                    color: #64748b;
                    margin: 4px 0 0 0;
                }
                .header-actions {
                    display: flex;
                    gap: 12px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }
                .stat-card {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    transition: transform 0.2s;
                }
                .stat-card:hover {
                    transform: translateY(-4px);
                }
                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                }
                .stat-card.income .stat-icon { background: #dcfce7; color: #166534; }
                .stat-card.expense .stat-icon { background: #fee2e2; color: #991b1b; }
                .stat-card.balance .stat-icon { background: #e0f2fe; color: #075985; }
                
                .stat-info {
                    display: flex;
                    flex-direction: column;
                }
                .stat-label {
                    font-size: 0.875rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                
                .filters-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .filter-group {
                    display: flex;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 8px;
                }
                .filter-btn {
                    padding: 8px 16px;
                    border: none;
                    background: transparent;
                    border-radius: 6px;
                    font-weight: 500;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-btn.active {
                    background: white;
                    color: #0f172a;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
                    outline: none;
                }
                
                .table-container {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    overflow-x: auto;
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 800px;
                }
                .data-table th {
                    background: #f8fafc;
                    padding: 16px;
                    text-align: left;
                    font-weight: 600;
                    color: #475569;
                    font-size: 0.875rem;
                    white-space: nowrap;
                }
                .data-table td {
                    padding: 16px;
                    border-bottom: 1px solid #e2e8f0;
                    color: #1e293b;
                }
                .badge {
                    background: #f1f5f9;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #475569;
                }
                .text-success { color: #166534; }
                .text-danger { color: #dc2626; }
                .text-muted { color: #94a3b8; }
                .font-medium { font-weight: 500; }
                .font-bold { font-weight: 700; }
                .text-xs { font-size: 0.75rem; }
                .capitalize { text-transform: capitalize; }
                
                .action-buttons {
                    display: flex;
                    gap: 8px;
                }
                .btn-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.1rem;
                    padding: 4px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                .btn-icon:hover {
                    background: #f1f5f9;
                }
                .btn-icon.delete:hover {
                    background: #fee2e2;
                }
                .btn-link {
                    background: none;
                    border: none;
                    color: #3b82f6;
                    cursor: pointer;
                    padding: 0;
                    text-align: left;
                }
                .btn-link:hover {
                    text-decoration: underline;
                }
                .flex { display: flex; }
                .flex-col { flex-direction: column; }
                .gap-1 { gap: 4px; }

            `}</style>
        </div>
    );
};

export default Account;
