import React, { useState, useEffect } from 'react';

const AddNewModal = ({ isOpen, onClose, onSave, title, initialValue, label = "Name" }) => {
    const [value, setValue] = useState(initialValue || '');

    useEffect(() => {
        if (isOpen) setValue(initialValue || '');
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(value);
        onClose();
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '400px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{label}</label>
                        <input
                            type="text"
                            required
                            className="form-input"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline" style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#0056b3', color: 'white', cursor: 'pointer' }}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewModal;
