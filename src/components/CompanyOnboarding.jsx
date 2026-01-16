import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import './CompanyOnboarding.css';

const CompanyOnboarding = () => {
    const { addCompany } = useData();
    const [formData, setFormData] = useState({
        name: '',
        gst: '',
        mobile: '',
        address: '',
        email: '',
        website: '',
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branch: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.name && formData.mobile) {
            setLoading(true);
            try {
                await addCompany(formData);
                // The App component will automatically switch to Dashboard when companies state updates
            } catch (error) {
                console.error("Error creating company:", error);
                alert("Failed to create company. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            alert('Company Name and Mobile Number are required.');
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <div className="onboarding-header">
                    <h2>Welcome to CivilWise</h2>
                    <p>Set up your company profile to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="onboarding-form">
                    <div className="form-group">
                        <label>Company Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g. Acme Construction"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>GST Number</label>
                        <input
                            type="text"
                            name="gst"
                            value={formData.gst}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Optional"
                        />
                    </div>

                    <div className="form-group">
                        <label>Mobile Number *</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g. 9876543210"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            className="form-input"
                            placeholder="Company Head Office Address"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Optional"
                            />
                        </div>
                        <div className="form-group">
                            <label>Website</label>
                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Optional (e.g. www.example.com)"
                            />
                        </div>
                    </div>

                    <div className="onboarding-divider"></div>
                    <h3 className="section-title">Bank Details (Optional)</h3>

                    <div className="form-group">
                        <label>Account Holder Name</label>
                        <input
                            type="text"
                            name="accountHolderName"
                            value={formData.accountHolderName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Name as per Bank Account"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Bank Name</label>
                            <input
                                type="text"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g. HDFC Bank"
                            />
                        </div>
                        <div className="form-group">
                            <label>Account Number</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Account Number"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>IFSC Code</label>
                            <input
                                type="text"
                                name="ifscCode"
                                value={formData.ifscCode}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g. HDFC0001234"
                            />
                        </div>
                        <div className="form-group">
                            <label>Branch</label>
                            <input
                                type="text"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Branch Name"
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating Profile...' : 'Create Company Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompanyOnboarding;
