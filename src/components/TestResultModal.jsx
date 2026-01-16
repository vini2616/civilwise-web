import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

const TestResultModal = ({ test, day, onClose }) => {
    const { updateConcreteTestResult } = useData();
    const [readings, setReadings] = useState(['', '', '']);
    const [average, setAverage] = useState(0);
    const [status, setStatus] = useState('');
    const [video, setVideo] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [isNotTested, setIsNotTested] = useState(false);
    const [reason, setReason] = useState('');

    useEffect(() => {
        // Pre-fill if data exists
        if (test.results && test.results[day]) {
            const result = test.results[day];
            setReadings(result.readings || ['', '', '']);
            setVideo(result.video || null);
            setPhoto(result.photo || null);
            setIsNotTested(result.status === 'Not Tested');
            setReason(result.reason || '');
        }
    }, [test, day]);

    useEffect(() => {
        if (isNotTested) {
            setStatus('Not Tested');
            setAverage(0);
            return;
        }

        // Auto-calculate average
        const validReadings = readings.map(r => parseFloat(r)).filter(r => !isNaN(r));
        if (validReadings.length === 3) {
            const avg = (validReadings.reduce((a, b) => a + b, 0) / 3).toFixed(2);
            setAverage(avg);

            // Determine Pass/Fail
            const gradeValue = parseInt(test.grade.replace('M', ''));
            let requiredStrength = 0;

            if (day === 'day7') {
                requiredStrength = gradeValue * 0.7; // 70% for 7 days
            } else if (day === 'day14') {
                requiredStrength = gradeValue * 0.9; // 90% approx for 14 days
            } else if (day === 'day28') {
                requiredStrength = gradeValue; // 100% for 28 days
            }

            setStatus(parseFloat(avg) >= requiredStrength ? 'Pass' : 'Fail');
        } else {
            setAverage(0);
            setStatus('');
        }
    }, [readings, test.grade, day, isNotTested]);

    const handleReadingChange = (index, value) => {
        const newReadings = [...readings];
        newReadings[index] = value;
        setReadings(newReadings);
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const resultData = {
            readings: isNotTested ? ['', '', ''] : readings,
            avg: average,
            status,
            video,
            photo,
            reason: isNotTested ? reason : '',
            date: new Date().toISOString()
        };
        updateConcreteTestResult(test.id, day, resultData);
        onClose();
    };

    const getDayLabel = () => {
        switch (day) {
            case 'day7': return '7 Days';
            case 'day14': return '14 Days';
            case 'day28': return '28 Days';
            default: return '';
        }
    };

    return (
        <div className="modal-overlay fade-in">
            <div className="modal-content card">
                <div className="modal-header">
                    <div>
                        <h2>Enter Test Results</h2>
                        <span className="subtitle">{getDayLabel()} Test for {test.location}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="notTested"
                                checked={isNotTested}
                                onChange={(e) => setIsNotTested(e.target.checked)}
                                className="form-checkbox"
                            />
                            <label htmlFor="notTested">Not Tested / Skipped</label>
                        </div>

                        {isNotTested ? (
                            <div className="reason-group">
                                <label>Reason for not testing</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="form-input"
                                    placeholder="e.g., Cube damaged, Holiday, etc."
                                    required={isNotTested}
                                />
                            </div>
                        ) : (
                            <>
                                <h3 className="section-label">Cube Readings (N/mm²)</h3>
                                <div className="readings-grid">
                                    {[0, 1, 2].map((index) => (
                                        <div key={index} className="reading-input-group">
                                            <label>Cube {index + 1}</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={readings[index]}
                                                onChange={(e) => handleReadingChange(index, e.target.value)}
                                                className="form-input reading-input"
                                                required={!isNotTested}
                                                placeholder="0.0"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="form-section">
                        <h3 className="section-label">Proof of Testing</h3>
                        <div className="media-upload-grid">
                            {/* Photo Upload */}
                            <div className="upload-box">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="file-input"
                                    id="photo-upload"
                                />
                                <label htmlFor="photo-upload" className="upload-label">
                                    {photo ? 'Change Photo' : '📷 Upload Photo'}
                                </label>
                                {photo && (
                                    <div className="media-preview">
                                        <img src={photo} alt="Proof" className="preview-img" />
                                        <button type="button" className="btn-remove" onClick={() => setPhoto(null)}>×</button>
                                    </div>
                                )}
                            </div>

                            {/* Video Upload */}
                            <div className="upload-box">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    className="file-input"
                                    id="video-upload"
                                />
                                <label htmlFor="video-upload" className="upload-label">
                                    {video ? 'Change Video' : '📹 Upload Video'}
                                </label>
                                {video && (
                                    <div className="media-preview">
                                        <video src={video} controls className="preview-video" />
                                        <button type="button" className="btn-remove" onClick={() => setVideo(null)}>×</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="result-summary">
                        <div className="summary-item">
                            <span className="label">Average Strength</span>
                            <span className="value">{average} <small>N/mm²</small></span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                            <span className="label">Result Status</span>
                            <span className={`status-badge-lg ${status === 'Pass' ? 'status-pass' : status === 'Fail' ? 'status-fail' : 'status-pending'}`}>
                                {status || 'Pending'}
                            </span>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={!status}>Save Results</button>
                    </div>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content {
                    width: 100%;
                    max-width: 550px;
                    padding: 32px;
                    background: white;
                    border-radius: var(--radius-lg);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--border-color);
                }

                .modal-header h2 {
                    font-size: 1.5rem;
                    margin-bottom: 4px;
                    color: var(--text-color);
                }

                .subtitle {
                    color: var(--text-light);
                    font-size: 0.9rem;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    line-height: 1;
                    cursor: pointer;
                    color: var(--text-light);
                    padding: 0;
                    margin-top: -8px;
                }

                .form-section {
                    margin-bottom: 24px;
                }

                .section-label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-color);
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .readings-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }

                .reading-input-group label {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--text-light);
                    margin-bottom: 6px;
                    text-align: center;
                }

                .reading-input {
                    text-align: center;
                    font-size: 1.1rem;
                    font-weight: 600;
                    padding: 12px;
                }

                .checkbox-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                    padding: 12px;
                    background: #f3f4f6;
                    border-radius: var(--radius-md);
                }

                .form-checkbox {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .checkbox-group label {
                    font-weight: 600;
                    cursor: pointer;
                }

                .reason-group label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .media-upload-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .upload-box {
                    border: 2px dashed var(--border-color);
                    padding: 16px;
                    border-radius: var(--radius-md);
                    text-align: center;
                    background: #f9fafb;
                    transition: all 0.2s;
                    position: relative;
                }

                .upload-box:hover {
                    border-color: var(--primary-color);
                    background: #eff6ff;
                }

                .upload-label {
                    display: inline-block;
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-weight: 500;
                    color: var(--primary-color);
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    box-shadow: var(--shadow-sm);
                    margin-bottom: 8px;
                }

                .upload-label:hover {
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }

                .media-preview {
                    margin-top: 8px;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    box-shadow: var(--shadow-md);
                    position: relative;
                }

                .preview-img, .preview-video {
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                    background: black;
                    display: block;
                }

                .btn-remove {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 1.2rem;
                    line-height: 1;
                }

                .btn-remove:hover {
                    background: #dc2626;
                }

                .result-summary {
                    display: flex;
                    align-items: center;
                    padding: 20px;
                    background: #f8fafc;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    margin-bottom: 24px;
                }

                .summary-item {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .summary-divider {
                    width: 1px;
                    height: 40px;
                    background: var(--border-color);
                }

                .summary-item .label {
                    font-size: 0.8rem;
                    color: var(--text-light);
                    margin-bottom: 4px;
                    text-transform: uppercase;
                }

                .summary-item .value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-color);
                }

                .summary-item .value small {
                    font-size: 0.9rem;
                    font-weight: 400;
                    color: var(--text-light);
                }

                .status-badge-lg {
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .status-pass { background: #dcfce7; color: #166534; }
                .status-fail { background: #fee2e2; color: #991b1b; }
                .status-pending { background: #e5e7eb; color: #4b5563; }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .btn-lg {
                    padding: 12px 32px;
                    font-size: 1rem;
                }
            `}</style>
        </div>
    );
};

export default TestResultModal;
