import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

const TeamForm = ({ currentUser, editingUser, onNavigate }) => {
    const { addUser, updateUser } = useData();

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        role: 'Engineer',
        salary: '',
        username: '',
        password: '',
        permission: 'view_edit',
        modulePermissions: {}
    });

    useEffect(() => {
        if (editingUser) {
            setFormData({
                ...editingUser,
                mobile: editingUser.mobile || '',
                salary: editingUser.salary || '',
                password: '', // Clear password for security, user must enter new one if they want to change it
                permission: editingUser.permission || 'view_edit',
                modulePermissions: editingUser.modulePermissions || {}
            });
        }
    }, [editingUser]);

    const modules = [
        { id: 'team', label: 'Team' },
        { id: 'estimation', label: 'Estimation' },
        { id: 'dpr', label: 'DPR' },
        { id: 'barchart', label: 'Project Schedule (Bar Chart)' },
        { id: 'account', label: 'Account' },
        { id: 'cashbook', label: 'Cashbook' },
        { id: 'materials', label: 'Materials' },
        { id: 'inventory', label: 'Inventory' },
        { id: 'bills', label: 'Bills' },
        { id: 'checklist', label: 'Checklist' },
        { id: 'contacts', label: 'Contacts' },
        { id: 'man-power', label: 'Man-power' },
        { id: 'chat', label: 'Chat' },
        { id: 'document', label: 'Document' },
        { id: 'report', label: 'Report' },
        { id: 'drawing', label: 'Drawing' },
    ];

    const handlePermissionChange = (moduleId, value) => {
        setFormData(prev => ({
            ...prev,
            modulePermissions: {
                ...prev.modulePermissions,
                [moduleId]: value
            }
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let success = false;

        // Prepare data for submission
        const dataToSubmit = { ...formData };
        // If editing and password is empty, remove it so it doesn't overwrite with empty string
        if (editingUser && !dataToSubmit.password) {
            delete dataToSubmit.password;
        }

        if (editingUser) {
            const result = await updateUser(editingUser._id || editingUser.id, dataToSubmit);
            if (result && result.success) {
                success = true;
            } else {
                alert("Failed to update user: " + (result?.message || result?.error || "Unknown error"));
            }
        } else {
            const result = await addUser(dataToSubmit);
            if (result.success) {
                success = true;
            } else {
                if (result.message === 'User already exists') {
                    alert("User already exists! Please use the 'Import Member' button on the Team page to add an existing user to this site.");
                } else {
                    alert(result.message);
                }
            }
        }

        if (success) {
            onNavigate('team');
        }
    };

    return (
        <div className="team-container">
            <div className="page-header">
                <div className="header-title">
                    <button onClick={() => onNavigate('team')} className="btn btn-outline" style={{ marginRight: '1rem' }}>← Back</button>
                    <h2>{editingUser ? 'Edit Member' : 'Add New Member'}</h2>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <span className="input-icon">📛</span>
                                <input required name="name" value={formData.name} onChange={handleInputChange} className="form-input with-icon" placeholder="John Doe" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <div className="input-wrapper">
                                <span className="input-icon">📱</span>
                                <input required name="mobile" value={formData.mobile} onChange={handleInputChange} className="form-input with-icon" placeholder="9876543210" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <div className="input-wrapper">
                                <span className="input-icon">💼</span>
                                <select name="role" value={formData.role} onChange={handleInputChange} className="form-input with-icon">
                                    <option>Owner</option>
                                    <option>Partner</option>
                                    <option>Manager</option>
                                    <option>Engineer</option>
                                    <option>Staff</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Base Salary (₹)</label>
                            <div className="input-wrapper">
                                <span className="input-icon">💰</span>
                                <input required type="number" name="salary" value={formData.salary} onChange={handleInputChange} className="form-input with-icon" placeholder="50000" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Username</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔑</span>
                                <input required name="username" value={formData.username} onChange={handleInputChange} className="form-input with-icon" placeholder="johndoe" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Password {editingUser && <span style={{ fontWeight: 'normal', fontSize: '0.8em', color: '#666' }}>(Leave blank to keep current)</span>}</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    required={!editingUser}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="form-input with-icon"
                                    placeholder={editingUser ? "Enter new password to change" : "Secret123"}
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Admin Access Level</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🛡️</span>
                                <select name="permission" value={formData.permission} onChange={handleInputChange} className="form-input with-icon">
                                    <option value="view_edit">Standard User (Use Module Permissions)</option>
                                    <option value="data_entry">Restricted (Data Entry Only)</option>
                                    <option value="full_control">Super Admin (Overrides All)</option>
                                </select>
                            </div>
                            <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                "Super Admin" grants access to EVERYTHING. Use "Standard User" to enforce module permissions.
                            </small>
                        </div>

                        {formData.permission === 'view_edit' && (
                            <div className="form-group full-width">
                                <label>Module Permissions</label>
                                <div className="permissions-grid">
                                    {modules.map(mod => (
                                        <div key={mod.id} className="permission-item">
                                            <span className="module-name">{mod.label}</span>
                                            <select
                                                value={formData.modulePermissions?.[mod.id] || 'view_only'}
                                                onChange={(e) => handlePermissionChange(mod.id, e.target.value)}
                                                className="permission-select"
                                            >
                                                <option value="no_access">No Access (Hidden)</option>
                                                <option value="view_only">View Only</option>
                                                <option value="data_entry">Data Entry</option>
                                                <option value="full_control">Full Control</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions" style={{ marginTop: '2rem' }}>
                        <button type="button" onClick={() => onNavigate('team')} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            <span>{editingUser ? 'Update Member' : 'Add Member'}</span>
                            <span className="btn-arrow">✓</span>
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .header-title {
                    display: flex;
                    align-items: center;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .form-group.full-width {
                    grid-column: span 2;
                }
                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 10px;
                    font-size: 1.2rem;
                    z-index: 1;
                }
                .form-input {
                    width: 100%;
                    padding: 10px 10px 10px 40px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 1rem;
                }
                .form-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px var(--primary-light);
                }
                .permissions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 12px;
                    background: #f8f9fa;
                    padding: 16px;
                    border-radius: 8px;
                }
                .permission-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .module-name {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #555;
                }
                .permission-select {
                    padding: 6px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.9rem;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
                .btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: none;
                }
                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }
                .btn-outline {
                    background: transparent;
                    border: 1px solid #ddd;
                    color: #555;
                }
            `}</style>
        </div>
    );
};

export default TeamForm;
