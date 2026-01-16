import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { checkPermission, canEnterData } from '../utils/permissions';

const Attendance = ({ currentUser }) => {
    const { users, attendance, addAttendance } = useData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterUser, setFilterUser] = useState('');

    const permission = checkPermission(currentUser, 'attendance');
    const canPunch = canEnterData(permission);
    const isAdmin = permission === 'full_control'; // Admin view (all users)

    // Check if already punched in today
    const today = new Date().toISOString().split('T')[0];
    const myTodayAttendance = attendance.filter(a =>
        a.userId === currentUser.id &&
        new Date(a.timestamp).toISOString().split('T')[0] === today
    );

    const hasPunchedIn = myTodayAttendance.some(a => a.type === 'in');
    const hasPunchedOut = myTodayAttendance.some(a => a.type === 'out');

    const handlePunch = (type) => {
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                addAttendance({
                    userId: currentUser.id,
                    timestamp: new Date().toISOString(),
                    type,
                    location: { lat: latitude, lng: longitude }
                });
                setLoading(false);
            },
            (err) => {
                setError('Unable to retrieve your location. Please allow location access.');
                setLoading(false);
            }
        );
    };

    // Filter Logic
    const filteredAttendance = attendance.filter(record => {
        const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
        const dateMatch = !filterDate || recordDate === filterDate;

        if (isAdmin) {
            const userMatch = !filterUser || record.userId === Number(filterUser);
            return dateMatch && userMatch;
        } else {
            return record.userId === currentUser.id; // Users only see their own history
        }
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    return (
        <div className="attendance-container">
            <div className="page-header">
                <h2>Attendance</h2>
                {canPunch && (
                    <div className="punch-controls">
                        {!hasPunchedIn ? (
                            <button
                                onClick={() => handlePunch('in')}
                                disabled={loading}
                                className="btn btn-primary btn-large"
                            >
                                {loading ? 'Locating...' : '📍 Punch In'}
                            </button>
                        ) : !hasPunchedOut ? (
                            <button
                                onClick={() => handlePunch('out')}
                                disabled={loading}
                                className="btn btn-outline btn-large"
                            >
                                {loading ? 'Locating...' : '👋 Punch Out'}
                            </button>
                        ) : (
                            <div className="status-badge success">
                                ✅ Attendance Complete for Today
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && <div className="error-banner">{error}</div>}

            {isAdmin && (
                <div className="card filter-card">
                    <div className="filter-group">
                        <label>Date:</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>User:</label>
                        <select
                            value={filterUser}
                            onChange={(e) => setFilterUser(e.target.value)}
                            className="form-input"
                        >
                            <option value="">All Users</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="card table-card">
                <h3>Attendance History</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            {isAdmin && <th>User</th>}
                            <th>Type</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAttendance.length > 0 ? (
                            filteredAttendance.map(record => (
                                <tr key={record.id}>
                                    <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                                    <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                                    {isAdmin && <td>{getUserName(record.userId)}</td>}
                                    <td>
                                        <span className={`badge ${record.type}`}>
                                            {record.type === 'in' ? 'Punch In' : 'Punch Out'}
                                        </span>
                                    </td>
                                    <td>
                                        <a
                                            href={`https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="location-link"
                                        >
                                            View Map ↗
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? 5 : 4} className="text-center">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .punch-controls {
          display: flex;
          gap: 16px;
        }

        .btn-large {
          padding: 12px 24px;
          font-size: 1.1rem;
        }

        .error-banner {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: var(--radius-md);
          margin-bottom: 16px;
        }

        .filter-card {
          margin-bottom: 24px;
          display: flex;
          gap: 24px;
          padding: 16px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th, .data-table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .badge.in { background: #d1fae5; color: #065f46; }
        .badge.out { background: #fee2e2; color: #991b1b; }

        .location-link {
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.9rem;
        }

        .location-link:hover {
          text-decoration: underline;
        }

        .status-badge {
          padding: 12px 24px;
          background: #d1fae5;
          color: #065f46;
          border-radius: var(--radius-md);
          font-weight: 600;
        }
      `}</style>
        </div>
    );
};

export default Attendance;
