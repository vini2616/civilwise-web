import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import './VendorContractor.css';

const VendorContractor = () => {
    const { activeSite, contacts, addContact, deleteContact } = useData();
    const [activeTab, setActiveTab] = useState('vendor'); // 'vendor' or 'contractor'
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        companyName: '',
        gstNumber: '',
        mobileNumber: '',
        address: '',
        email: '',
        contactPerson: ''
    });

    // Load Data from Context
    useEffect(() => {
        if (contacts) {
            const type = activeTab === 'vendor' ? 'Vendor' : 'Contractor';
            // Filter by type (case-insensitive just in case)
            const filtered = contacts.filter(c => c.type && c.type.toLowerCase() === type.toLowerCase());
            setItems(filtered);
        }
    }, [activeTab, contacts]);

    // Save Data
    const saveItem = async () => {
        if (!formData.companyName) {
            alert("Company Name is required");
            return;
        }

        const type = activeTab === 'vendor' ? 'Vendor' : 'Contractor';
        const contactData = { ...formData, type };

        // Remove empty id if it's new
        if (!contactData.id) delete contactData.id;

        if (formData.id) {
            // Update logic - Placeholder until backend supports update
            alert("Update feature coming soon. Please delete and re-add if correction is needed.");
            /* 
            await updateContact(contactData); 
            */
        } else {
            await addContact(contactData);
        }

        setView('list');
        resetForm();
    };

    const deleteItem = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            await deleteContact(id);
        }
    };

    const editItem = (item) => {
        setFormData(item);
        setView('form');
    };

    const resetForm = () => {
        setFormData({
            id: null,
            companyName: '',
            gstNumber: '',
            mobileNumber: '',
            address: '',
            email: '',
            contactPerson: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="vendor-contractor-container fade-in">
            <div className="page-header">
                <h2>Vendor & Contractor Management</h2>
                <p className="text-muted">Manage your {activeTab} details efficiently</p>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <div className="tabs-wrapper">
                    <button
                        onClick={() => { setActiveTab('vendor'); setView('list'); }}
                        className={`tab-btn vendor ${activeTab === 'vendor' ? 'active' : ''}`}
                    >
                        🛍️ Vendors
                    </button>
                    <button
                        onClick={() => { setActiveTab('contractor'); setView('list'); }}
                        className={`tab-btn contractor ${activeTab === 'contractor' ? 'active' : ''}`}
                    >
                        👷 Contractors
                    </button>
                </div>
            </div>

            {view === 'list' ? (
                <div className="list-view">
                    <div className="list-header">
                        <div className="section-title">
                            {activeTab === 'vendor' ? 'Vendor List' : 'Contractor List'}
                            <span className="count-badge">{items.length}</span>
                        </div>
                        <button
                            onClick={() => { resetForm(); setView('form'); }}
                            className="btn-add"
                        >
                            <span>+</span> Add New {activeTab === 'vendor' ? 'Vendor' : 'Contractor'}
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="empty-state-container">
                            <span className="empty-icon-large">📭</span>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No {activeTab}s Found</h3>
                            <p className="text-gray-500 mb-6">Start by adding your first {activeTab} to the system.</p>
                            <button
                                onClick={() => { resetForm(); setView('form'); }}
                                className="btn-add"
                                style={{ margin: '0 auto' }}
                            >
                                + Add {activeTab === 'vendor' ? 'Vendor' : 'Contractor'}
                            </button>
                        </div>
                    ) : (
                        <div className="cards-grid">
                            {items.map(item => (
                                <div key={item.id} className={`vc-card ${activeTab}`}>
                                    <div className="card-header">
                                        <div className="company-info">
                                            <h4 className="company-name">{item.companyName}</h4>
                                            <div className="contact-person">
                                                <span>👤</span> {item.contactPerson || 'No Contact Person'}
                                            </div>
                                        </div>
                                        <div className="card-actions">
                                            <button onClick={() => editItem(item)} className="action-btn edit" title="Edit">✏️</button>
                                            <button onClick={() => deleteItem(item.id)} className="action-btn delete" title="Delete">🗑️</button>
                                        </div>
                                    </div>

                                    <div className="card-details">
                                        <div className="detail-item">
                                            <span className="detail-icon">📞</span>
                                            <div>
                                                <span className="detail-label">Mobile</span>
                                                {item.mobileNumber || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">🧾</span>
                                            <div>
                                                <span className="detail-label">GST Number</span>
                                                {item.gstNumber || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">📍</span>
                                            <div>
                                                <span className="detail-label">Address</span>
                                                {item.address || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="form-container">
                    <div className="form-card">
                        <div className="form-header">
                            <h3>{formData.id ? 'Edit' : 'Add New'} {activeTab === 'vendor' ? 'Vendor' : 'Contractor'}</h3>
                            <button onClick={() => setView('list')} className="btn-close">×</button>
                        </div>

                        <div className="form-body">
                            <div className="input-group">
                                <label>Company Name *</label>
                                <div className="input-wrapper">
                                    <span className="input-icon-left">🏢</span>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="styled-input"
                                        placeholder="Enter company name"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label>Contact Person</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-left">👤</span>
                                        <input
                                            type="text"
                                            name="contactPerson"
                                            value={formData.contactPerson}
                                            onChange={handleInputChange}
                                            className="styled-input"
                                            placeholder="Name"
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Mobile Number</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-left">📞</span>
                                        <input
                                            type="tel"
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={handleInputChange}
                                            className="styled-input"
                                            placeholder="Phone"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label>GST Number</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-left">🧾</span>
                                        <input
                                            type="text"
                                            name="gstNumber"
                                            value={formData.gstNumber}
                                            onChange={handleInputChange}
                                            className="styled-input"
                                            placeholder="GSTIN"
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Email (Optional)</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-left">📧</span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="styled-input"
                                            placeholder="Email address"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="styled-textarea"
                                    placeholder="Full address"
                                />
                            </div>
                        </div>

                        <div className="form-footer">
                            <button onClick={() => setView('list')} className="btn-cancel">
                                Cancel
                            </button>
                            <button onClick={saveItem} className="btn-save">
                                Save {activeTab === 'vendor' ? 'Vendor' : 'Contractor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorContractor;
