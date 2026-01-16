import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaPhone, FaIdBadge, FaCloudDownloadAlt } from 'react-icons/fa';
import { checkPermission, canEnterData, canEditDelete } from '../utils/permissions';
import { api } from '../services/api';
import '../index.css';

const Contact = () => {
    const { contacts, addContact, updateContact, deleteContact, currentUser, sites, activeSite } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Import Logic State
    const [importSiteId, setImportSiteId] = useState('');
    const [importableContacts, setImportableContacts] = useState([]);
    const [selectedImportIds, setSelectedImportIds] = useState(new Set());
    const [isImporting, setIsImporting] = useState(false);

    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        role: ''
    });

    // Permission checks
    const contactPermission = useMemo(() => checkPermission(currentUser, 'contacts'), [currentUser]);
    const canAdd = canEnterData(contactPermission);

    const filteredContacts = useMemo(() => {
        return contacts.filter(contact =>
            ((contact.name || contact.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((contact.number || contact.mobileNumber || '').toString().includes(searchTerm)) ||
            ((contact.role || contact.type || '').toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [contacts, searchTerm]);

    // Handle fetching contacts from another site
    const handleFetchImportable = async (siteId) => {
        setImportSiteId(siteId);
        setImportableContacts([]);
        setSelectedImportIds(new Set());

        if (!siteId) return;

        try {
            const fetched = await api.getContacts(currentUser.token, siteId);
            if (Array.isArray(fetched)) {
                // Filter out contacts that might already exist by phone number to avoid checking duplicates (optional but good UX)
                // For now, just show all.
                setImportableContacts(fetched);
            }
        } catch (error) {
            console.error("Failed to fetch contacts for import", error);
            alert("Failed to load contacts from selected site.");
        }
    };

    const handleImportSubmit = async () => {
        if (selectedImportIds.size === 0) return;

        setIsImporting(true);
        try {
            const selectedContacts = importableContacts.filter(c => selectedImportIds.has(c._id || c.id));

            for (const contact of selectedContacts) {
                // Prepare clean object
                const newContact = {
                    name: contact.name || contact.companyName,
                    number: contact.number || contact.mobileNumber,
                    role: contact.role || contact.type || '',
                    email: contact.email,
                    address: contact.address
                };
                await addContact(newContact);
            }

            setShowImportModal(false);
            setImportSiteId('');
            setImportableContacts([]);
            setSelectedImportIds(new Set());
            alert(`Successfully imported ${selectedContacts.length} contacts.`);
        } catch (error) {
            console.error("Import failed", error);
            alert("Some contacts failed to import.");
        } finally {
            setIsImporting(false);
        }
    };

    const toggleImportSelection = (id) => {
        const newSet = new Set(selectedImportIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedImportIds(newSet);
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData({
            name: contact.name,
            number: contact.number,
            role: contact.role || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            await deleteContact(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingContact) {
            await updateContact(editingContact._id || editingContact.id, formData);
        } else {
            await addContact(formData);
        }

        setShowModal(false);
        setEditingContact(null);
        setFormData({ name: '', number: '', role: '' });
    };

    // Styles objects to replace Bootstrap
    const styles = {
        container: { padding: '24px' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
        searchCard: { background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' },
        searchInputGroup: { display: 'flex', alignItems: 'center' },
        searchInput: { flex: 1, border: 'none', background: '#f8f9fa', padding: '10px', marginLeft: '10px', outline: 'none' },
        searchIcon: { color: '#6c757d' },

        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
        },
        card: {
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #e5e7eb',
            position: 'relative'
        },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
        userInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
        avatar: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px',
            flexShrink: 0
        },
        userName: { margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#111827' },
        userRole: { margin: 0, fontSize: '0.85rem', color: '#6b7280' },
        actions: { display: 'flex', gap: '8px' },
        actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9ca3af' },

        infoRow: { display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', marginTop: '8px', fontSize: '0.95rem' },

        // Modal Overlay
        modalOverlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        },
        modalContent: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        },
        modalTitle: { margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '700' },
        formGroup: { marginBottom: '16px' },
        label: { display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' },
        inputGroup: { display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden' },
        inputIcon: { padding: '10px 14px', background: '#f9fafb', borderRight: '1px solid #d1d5db', color: '#6b7280' },
        formInput: { flex: 1, border: 'none', padding: '10px', outline: 'none', fontSize: '1rem' },
        buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },

        // Import List
        importList: { maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', marginTop: '10px' },
        importItem: { padding: '10px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#374151' }}>Contacts</h2>
                {canAdd && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn btn-outline"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #d1d5db' }}
                            onClick={() => setShowImportModal(true)}
                        >
                            <FaCloudDownloadAlt /> Import Contact
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => {
                                setEditingContact(null);
                                setFormData({ name: '', number: '', role: '' });
                                setShowModal(true);
                            }}
                        >
                            <FaUserPlus /> Add Contact
                        </button>
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <div style={styles.searchCard}>
                <div style={styles.searchInputGroup}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        style={styles.searchInput}
                        placeholder="Search by name, phone or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Contacts Grid */}
            <div style={styles.grid}>
                {filteredContacts.length > 0 ? (
                    filteredContacts.map(contact => {
                        const canModify = canEditDelete(contactPermission, contact.createdAt);
                        return (
                            <div key={contact._id || contact.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.userInfo}>
                                        <div
                                            style={{
                                                ...styles.avatar,
                                                backgroundColor: `hsl(${((contact.name || contact.companyName || 'U').length * 40) % 360}, 70%, 50%)`
                                            }}
                                        >
                                            {(contact.name || contact.companyName || 'Un').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={styles.userName}>{contact.name || contact.companyName || 'Unknown'}</h3>
                                            <p style={styles.userRole}>{contact.role || contact.type || 'No Role'}</p>
                                        </div>
                                    </div>
                                    {canModify && (
                                        <div style={styles.actions}>
                                            <button
                                                style={styles.actionBtn}
                                                onClick={() => handleEdit(contact)}
                                                title="Edit"
                                                className="hover:text-amber-500"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                style={{ ...styles.actionBtn, color: '#ef4444' }}
                                                onClick={() => handleDelete(contact._id || contact.id)}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '16px 0' }} />

                                <div style={styles.infoRow}>
                                    <FaPhone style={{ fontSize: '0.9em', color: '#9ca3af' }} />
                                    <span style={{ fontWeight: '500' }}>{contact.number || contact.mobileNumber}</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                        <FaUserPlus size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>No contacts found.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>{editingContact ? 'Edit Contact' : 'New Contact'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <div style={styles.inputGroup}>
                                    <div style={styles.inputIcon}><FaUserPlus /></div>
                                    <input
                                        type="text"
                                        style={styles.formInput}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Enter name"
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <div style={styles.inputGroup}>
                                    <div style={styles.inputIcon}><FaPhone /></div>
                                    <input
                                        type="text"
                                        style={styles.formInput}
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                        required
                                        placeholder="Enter number"
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Role / Designation</label>
                                <div style={styles.inputGroup}>
                                    <div style={styles.inputIcon}><FaIdBadge /></div>
                                    <input
                                        type="text"
                                        style={styles.formInput}
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        placeholder="e.g. Supplier"
                                    />
                                </div>
                            </div>

                            <div style={styles.buttonGroup}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingContact ? 'Update' : 'Save Contact'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div style={styles.modalOverlay}>
                    <div style={{ ...styles.modalContent, maxWidth: '600px' }}>
                        <h3 style={styles.modalTitle}>Import Contacts</h3>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Select Source Site</label>
                            <select
                                className="form-select"
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                value={importSiteId}
                                onChange={(e) => handleFetchImportable(e.target.value)}
                            >
                                <option value="">-- Choose a Site --</option>
                                {sites.filter(s => (s._id || s.id) !== activeSite).map(site => (
                                    <option key={site._id || site.id} value={site._id || site.id}>
                                        {site.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {importSiteId && (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={styles.label}>Select Contacts ({selectedImportIds.size})</label>
                                    <button
                                        type="button"
                                        className="btn btn-link btn-sm"
                                        onClick={() => {
                                            if (selectedImportIds.size === importableContacts.length) {
                                                setSelectedImportIds(new Set());
                                            } else {
                                                setSelectedImportIds(new Set(importableContacts.map(c => c._id || c.id)));
                                            }
                                        }}
                                    >
                                        {selectedImportIds.size === importableContacts.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div style={styles.importList}>
                                    {importableContacts.length > 0 ? (
                                        importableContacts.map(contact => (
                                            <div key={contact._id || contact.id} style={styles.importItem}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedImportIds.has(contact._id || contact.id)}
                                                    onChange={() => toggleImportSelection(contact._id || contact.id)}
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{contact.name || contact.companyName}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                        {contact.role || contact.type} • {contact.number || contact.mobileNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                            No contacts found on this site.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={styles.buttonGroup}>
                            <button type="button" className="btn btn-outline" onClick={() => setShowImportModal(false)}>Cancel</button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={selectedImportIds.size === 0 || isImporting}
                                onClick={handleImportSubmit}
                            >
                                {isImporting ? 'Importing...' : `Import ${selectedImportIds.size} Contacts`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;
