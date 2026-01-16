import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import SearchableSelect from './SearchableSelect';
import AddNewModal from './AddNewModal';

const TransactionForm = ({ currentUser, editingTransaction, onNavigate }) => {
    const { transactions, addTransaction, updateTransaction, customCategories, addCustomCategory, savedParties, addSavedParty, savedSuppliers, contacts } = useData();

    // Custom Input States
    const [addModal, setAddModal] = useState({ isOpen: false, type: null, value: '' });

    const openAddModal = (type, value) => {
        setAddModal({ isOpen: true, type, value });
    };

    const closeAddModal = () => {
        setAddModal({ isOpen: false, type: null, value: '' });
    };

    const handleSaveNewItem = (newValue) => {
        if (!newValue || !newValue.trim()) return;
        const val = newValue.trim();

        if (addModal.type === 'category') {
            addCustomCategory(val);
            setFormData(prev => ({ ...prev, category: val }));
        } else if (addModal.type === 'party') {
            addSavedParty(val);
            setFormData(prev => ({ ...prev, partyName: val }));
        }
        closeAddModal();
    };

    // Form State
    const [formData, setFormData] = useState({
        type: 'expense', // income, expense
        category: '',
        partyName: '', // Company or Person Name
        baseAmount: '',
        gstRate: '0',
        gstAmount: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        mode: 'cash', // cash, online, cheque
        billImage: null, // Base64 string
        paymentProof: null, // Base64 string
        billNo: '' // Added Bill Number
    });

    useEffect(() => {
        if (editingTransaction) {
            let type = editingTransaction.type;
            if (type === 'credit') type = 'income';
            if (type === 'debit') type = 'expense';

            setFormData({
                type: type,
                category: editingTransaction.category,
                partyName: editingTransaction.partyName,
                baseAmount: editingTransaction.baseAmount || '',
                gstRate: editingTransaction.gstRate || '0',
                gstAmount: editingTransaction.gstAmount || '',
                amount: editingTransaction.amount,
                date: editingTransaction.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                note: editingTransaction.description || editingTransaction.note || '',
                mode: editingTransaction.mode || 'cash',
                billImage: editingTransaction.billImage,
                paymentProof: editingTransaction.paymentProof,
                billNo: editingTransaction.billNo || ''
            });
        }
    }, [editingTransaction]);

    // Categories
    const defaultCategories = {
        income: [],
        expense: []
    };

    // Combine default and custom categories
    const availableCategories = useMemo(() => {
        return {
            income: [...defaultCategories.income, ...customCategories],
            expense: [...defaultCategories.expense, ...customCategories]
        };
    }, [customCategories]);

    // Get unique Party Names (Saved + Historical + Suppliers + Contacts)
    const availableParties = useMemo(() => {
        const historicalParties = transactions.map(t => t.partyName).filter(Boolean);
        const safeSavedParties = Array.isArray(savedParties) ? savedParties : [];
        const safeSavedSuppliers = Array.isArray(savedSuppliers) ? savedSuppliers : [];
        const contactNames = Array.isArray(contacts) ? contacts.map(c => c.name) : [];

        return [...new Set([
            ...safeSavedParties,
            ...historicalParties,
            ...safeSavedSuppliers,
            ...contactNames
        ])].sort();
    }, [transactions, savedParties, savedSuppliers, contacts]);

    const calculateGstAmount = (base, rate) => {
        const baseVal = Number(base) || 0;
        const rateVal = Number(rate) || 0;
        return Math.round(baseVal * rateVal / 100);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-calculate logic
            if (name === 'baseAmount' || name === 'gstRate') {
                const gstAmt = calculateGstAmount(newData.baseAmount, newData.gstRate);
                newData.gstAmount = gstAmt;
                newData.amount = (Number(newData.baseAmount) || 0) + gstAmt;
            } else if (name === 'gstAmount') {
                newData.amount = (Number(newData.baseAmount) || 0) + (Number(newData.gstAmount) || 0);
            }

            return newData;
        });
    };



    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const transactionData = {
            ...formData,
            amount: Number(formData.amount),
            baseAmount: Number(formData.baseAmount),
            gstRate: Number(formData.gstRate),
            gstAmount: Number(formData.gstAmount)
        };

        if (editingTransaction) {
            updateTransaction(editingTransaction._id || editingTransaction.id, transactionData);
        } else {
            addTransaction({
                ...transactionData,
                id: Date.now()
            });
        }

        onNavigate('account');
    };

    return (
        <div className="form-container fade-in">
            <div className="page-header">
                <button onClick={() => onNavigate('account')} className="back-btn">← Back</button>
                <h2 className="page-title">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Type</label>
                            <div className="type-selector">
                                <label className={`type-option ${formData.type === 'income' ? 'selected income' : ''}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="income"
                                        checked={formData.type === 'income'}
                                        onChange={handleInputChange}
                                    />
                                    Credit
                                </label>
                                <label className={`type-option ${formData.type === 'expense' ? 'selected expense' : ''}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="expense"
                                        checked={formData.type === 'expense'}
                                        onChange={handleInputChange}
                                    />
                                    Debit
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <SearchableSelect
                                options={availableCategories[formData.type].map(c => ({ label: c, value: c }))}
                                value={formData.category}
                                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                placeholder="Select Category"
                                onAddNew={(val) => openAddModal('category', val)}
                                addNewLabel="Add New Category"
                            />
                        </div>

                        <div className="form-group">
                            <label>Company / Person Name</label>
                            <SearchableSelect
                                options={availableParties.map(p => ({ label: p, value: p }))}
                                value={formData.partyName}
                                onChange={(val) => setFormData(prev => ({ ...prev, partyName: val }))}
                                placeholder="Select Company / Person"
                                onAddNew={(val) => openAddModal('party', val)}
                                addNewLabel="Add New Party"
                            />
                        </div>

                        <div className="form-group">
                            <label>Bill Number</label>
                            <input
                                type="text"
                                name="billNo"
                                value={formData.billNo}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Enter Bill / Invoice No."
                            />
                        </div>

                        <div className="form-group">
                            <label>Base Amount (₹)</label>
                            <input
                                type="number"
                                name="baseAmount"
                                value={formData.baseAmount}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Enter base amount"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>GST %</label>
                            <select
                                name="gstRate"
                                value={formData.gstRate}
                                onChange={handleInputChange}
                                className="form-input"
                            >
                                <option value="0">0% (No GST)</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>GST Amount (₹)</label>
                            <input
                                type="number"
                                name="gstAmount"
                                value={formData.gstAmount}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Auto-calculated or Enter manually"
                            />
                        </div>

                        <div className="form-group">
                            <label>Total Amount (₹)</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                readOnly
                                className="form-input bg-gray-100"
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Payment Mode</label>
                            <select
                                name="mode"
                                value={formData.mode}
                                onChange={handleInputChange}
                                className="form-input"
                            >
                                <option value="cash">Cash</option>
                                <option value="online">Online / UPI</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Description / Note</label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                className="form-input"
                                rows="2"
                                placeholder="e.g., Material purchase details..."
                            ></textarea>
                        </div>

                        <div className="form-group full-width">
                            <label>Upload Bill / Invoice</label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(e, 'billImage')}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Upload Payment Proof (Screenshot/Photo)</label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(e, 'paymentProof')}
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={() => onNavigate('account')} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .form-container {
                    padding: 24px;
                    max-width: 800px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                }
                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .back-btn {
                    background: none;
                    border: none;
                    font-size: 1rem;
                    color: #64748b;
                    cursor: pointer;
                    font-weight: 500;
                }
                .page-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }
                .form-card {
                    background: white;
                    padding: 32px;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .full-width {
                    grid-column: span 2;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #475569;
                }
                .form-input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    outline: none;
                    transition: border-color 0.2s;
                    font-size: 1rem;
                }
                .form-input:focus {
                    border-color: #3b82f6;
                }
                .bg-gray-100 {
                    background-color: #f3f4f6;
                }
                .type-selector {
                    display: flex;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 8px;
                }
                .type-option {
                    flex: 1;
                    text-align: center;
                    padding: 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #64748b;
                    transition: all 0.2s;
                }
                .type-option input { display: none; }
                .type-option.selected {
                    background: white;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                .type-option.selected.income { color: #166534; }
                .type-option.selected.expense { color: #991b1b; }
                
                .form-actions {
                    margin-top: 32px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                }
                .btn {
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }
                .btn-primary:hover {
                    background: #2563eb;
                }
                .btn-outline {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                }
                .btn-outline:hover {
                    background: #f8fafc;
                    color: #0f172a;
                }
                .text-primary { color: #3b82f6; }
                .font-bold { font-weight: 700; }
                .flex { display: flex; }
                .gap-2 { gap: 8px; }
                .btn-sm { padding: 8px 16px; font-size: 0.875rem; }
            `}</style>
            <AddNewModal
                isOpen={addModal.isOpen}
                onClose={closeAddModal}
                onSave={handleSaveNewItem}
                title={`Add New ${addModal.type === 'category' ? 'Category' : 'Party'}`}
                initialValue={addModal.value}
                label={addModal.type === 'category' ? 'Category Name' : 'Company / Person Name'}
            />
        </div>
    );
};

export default TransactionForm;
