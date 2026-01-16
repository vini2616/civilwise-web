import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const Sidebar = ({ activePage, onNavigate, user, isCollapsed, toggleSidebar }) => {
    const { refreshData } = useData();
    const [refreshing, setRefreshing] = useState(false);

    const handleSync = async () => {
        if (refreshData) {
            setRefreshing(true);
            await refreshData();
            setTimeout(() => setRefreshing(false), 500); // Minimum spin time
        }
    };
    const menuItems = [
        //{ id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'team', label: 'Team', icon: '👥' },
        { id: 'estimation', label: 'Estimation', icon: '📝' },
        { id: 'dpr', label: 'DPR', icon: '📋' },
        { id: 'barchart', label: 'Bar Chart', icon: '📈' },
        { id: 'account', label: 'Account', icon: '💳' },
        { id: 'cashbook', label: 'Cashbook', icon: '💰' },
        { id: 'materials', label: 'Materials', icon: '🧱' },

        { id: 'bills', label: 'Bills', icon: '🧾' },
        { id: 'inventory', label: 'Inventory', icon: '🏢' },

        { id: 'checklist', label: 'Checklist', icon: '☑️' },
        { id: 'contacts', label: 'Contacts', icon: '📞' },
        //{ id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'man-power', label: 'Man-power', icon: '👷' },
        { id: 'chat', label: 'Chat', icon: '💬' },
        { id: 'document', label: 'Document', icon: '📄' },
        { id: 'report', label: 'Report', icon: '📑' },
        { id: 'drawing', label: 'Drawing', icon: '✏️' },
    ];

    const isAdmin = user?.role === 'Owner' || user?.role === 'Partner' || user?.permission === 'full_control';

    const filteredItems = menuItems.filter(item => {
        if (isAdmin) return true;
        if (item.id === 'dashboard') return true; // Always show dashboard

        const permission = user?.modulePermissions?.[item.id];
        // If no specific permission set, default to 'view_only' (show it) unless explicit 'no_access'
        return permission !== 'no_access';
    });

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <button onClick={toggleSidebar} className="sidebar-toggle" title={isCollapsed ? "Expand" : "Collapse"}>
                    {isCollapsed ? '▶' : '◀'}
                </button>
            </div>
            <nav className="sidebar-nav">
                {filteredItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </button>
                ))}
            </nav>



            {/* Sync button removed as per user request */}
        </aside >
    );
};

export default Sidebar;
