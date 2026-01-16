import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardLayout = ({ user, activePage, onNavigate, onLogout, children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="dashboard-layout">
            <TopBar user={user} onLogout={onLogout} onNavigate={onNavigate} />
            <div className="main-wrapper">
                <Sidebar
                    activePage={activePage}
                    onNavigate={onNavigate}
                    user={user}
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                />
                <main className={`content-area ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="content-container">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
