import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { checkPermission, canEnterData } from '../utils/permissions';

const SiteImages = ({ currentUser }) => {
    const { users, siteImages, addSiteImage } = useData();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [slot, setSlot] = useState('8am');
    const [filterDate, setFilterDate] = useState('');
    const [filterSlot, setFilterSlot] = useState('');
    const [filterUser, setFilterUser] = useState('');

    const permission = checkPermission(currentUser, 'siteimages');
    const isAdmin = permission === 'full_control';
    const canAdd = canEnterData(permission);

    // Determine current slot based on time
    const getCurrentSlot = () => {
        const hour = new Date().getHours();
        if (hour < 11) return '8am';
        if (hour < 16) return '2pm';
        return '6pm';
    };

    // Initialize slot
    useState(() => {
        setSlot(getCurrentSlot());
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (!selectedFile || !previewUrl) return;

        addSiteImage({
            userId: currentUser.id,
            url: previewUrl, // Storing base64 for demo. In prod, upload to server.
            timestamp: new Date().toISOString(),
            slot: slot
        });

        setSelectedFile(null);
        setPreviewUrl('');
        alert('Image uploaded successfully!');
    };

    // Filter Logic
    const filteredImages = siteImages.filter(img => {
        const imgDate = new Date(img.timestamp).toISOString().split('T')[0];
        const dateMatch = !filterDate || imgDate === filterDate;
        const slotMatch = !filterSlot || img.slot === filterSlot;

        if (isAdmin) {
            const userMatch = !filterUser || img.userId === Number(filterUser);
            return dateMatch && slotMatch && userMatch;
        } else {
            return img.userId === currentUser.id && dateMatch && slotMatch;
        }
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown';
    };

    return (
        <div className="site-images-container">
            <div className="page-header">
                <h2>Site Images</h2>
            </div>

            {canAdd && (
                <div className="upload-section card">
                    <h3>Upload Site Image</h3>
                    <form onSubmit={handleUpload} className="upload-form">
                        <div className="form-group">
                            <label>Time Slot</label>
                            <select value={slot} onChange={(e) => setSlot(e.target.value)} className="form-input">
                                <option value="8am">8:00 AM</option>
                                <option value="2pm">2:00 PM</option>
                                <option value="6pm">6:00 PM</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Image</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="form-input" />
                        </div>
                        {previewUrl && (
                            <div className="image-preview">
                                <img src={previewUrl} alt="Preview" />
                            </div>
                        )}
                        <button type="submit" disabled={!selectedFile} className="btn btn-primary">
                            Upload Image
                        </button>
                    </form>
                </div>
            )}

            <div className="gallery-section">
                <div className="filters card">
                    <h4>Filters</h4>
                    <div className="filter-row">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="form-input"
                        />
                        <select value={filterSlot} onChange={(e) => setFilterSlot(e.target.value)} className="form-input">
                            <option value="">All Slots</option>
                            <option value="8am">8:00 AM</option>
                            <option value="2pm">2:00 PM</option>
                            <option value="6pm">6:00 PM</option>
                        </select>
                        {isAdmin && (
                            <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="form-input">
                                <option value="">All Users</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="image-grid">
                    {filteredImages.length > 0 ? (
                        filteredImages.map(img => (
                            <div key={img.id} className="image-card card">
                                <img src={img.url} alt="Site" />
                                <div className="image-info">
                                    <span className="slot-badge">{img.slot}</span>
                                    <div className="meta">
                                        <span className="date">{new Date(img.timestamp).toLocaleDateString()}</span>
                                        {isAdmin && <span className="user">by {getUserName(img.userId)}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-images">No images found matching criteria.</div>
                    )}
                </div>
            </div>

            <style>{`
        .upload-section {
          margin-bottom: 32px;
          max-width: 600px;
        }

        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .image-preview img {
          max-width: 100%;
          max-height: 200px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .filter-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }

        .image-card {
          overflow: hidden;
          padding: 0;
        }

        .image-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .image-info {
          padding: 12px;
        }

        .slot-badge {
          background: var(--primary-light);
          color: var(--primary-color);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 8px;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-light);
        }

        .no-images {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: var(--text-light);
        }
      `}</style>
        </div>
    );
};

export default SiteImages;
