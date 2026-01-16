// Force rebuild
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import Team from './components/Team';
import Account from './components/Account';
import Attendance from './components/Attendance';
import SiteImages from './components/SiteImages';
import DPR from './components/DPR';
import DPRHistory from './components/DPRHistory';
import ManPower from './components/ManPower';
import Chat from './components/Chat';
import Documents from './components/Documents';


import Drawing from './components/Drawing';
import Report from './components/Report';
import Contact from './components/Contact';
import Cashbook from './components/Cashbook';
import Materials from './components/Materials';
import { DataProvider, useData } from './context/DataContext';
import ErrorBoundary from './components/ErrorBoundary';

import TeamForm from './components/TeamForm';
import TransactionForm from './components/TransactionForm';
import ChecklistDashboard from './components/Checklist/ChecklistDashboard';
import ChecklistForm from './components/Checklist/ChecklistForm';
import TemplateManager from './components/Checklist/TemplateManager';
import ProjectSchedule from './components/ProjectSchedule';
import Estimation from './components/EstimationNew';

import ShapeManager from './components/ShapeManager';
import CompanyOnboarding from './components/CompanyOnboarding';

import VendorContractor from './components/VendorContractor';

import Bills from './components/Bills';
import Inventory from './components/Inventory';
import BackendTest from './components/BackendTest';

const CivilWiseApp = () => {
  const data = useData();
  const { login, logout, users = [], sites = [], activeSite, setActiveSite, companies = [], currentUser } = data || {};
  const [activePage, setActivePage] = useState('dashboard');
  const [pageData, setPageData] = useState(null);

  // Wrapper for Login to handle the return value
  const onLoginAttempt = async (username, password) => {
    return await login(username, password);
  }

  const handleLogout = async () => {
    await logout();
    setActivePage('dashboard');
  };

  if (!currentUser) {
    return <Login onLogin={onLoginAttempt} />;
  }

  // Force Company Onboarding if no companies exist
  if (companies.length === 0) {
    return <CompanyOnboarding />;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <div>
            <h1>Dashboard</h1>
            <div className="flex justify-between items-center mb-4">
              <p className="text-muted">Welcome back, {currentUser.name} ({currentUser.role})</p>
              <div className="site-selector">
                <label className="mr-2 font-bold">Current Site:</label>
                <select
                  value={activeSite}
                  onChange={(e) => setActiveSite(e.target.value)}
                  className="p-2 border rounded"
                >
                  {sites.map(site => (
                    <option key={site._id || site.id} value={site._id || site.id}>{site.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Debug Card */}
            <div className="card" style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', border: '1px dashed #ccc' }}>
              <h3>🕵️ Permission Debugger</h3>
              <p><strong>Role:</strong> {currentUser.role}</p>
              <p><strong>Admin Access:</strong> {currentUser.permission || 'None'} {currentUser.permission === 'full_control' ? '⚠️ (Overrides Modules)' : ''}</p>
              <p><strong>Is Admin Calculated:</strong> {(currentUser.role === 'Owner' || currentUser.role === 'Partner' || currentUser.permission === 'full_control') ? 'YES (Full Access)' : 'NO (Restricted)'}</p>
              <p><strong>Module Permissions:</strong></p>
              <pre style={{ background: '#eee', padding: '10px', borderRadius: '5px' }}>
                {JSON.stringify(currentUser.modulePermissions, null, 2)}
              </pre>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => setActivePage('backend-test')}
                style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
              >
                🧪 Test Backend Connection
              </button>
            </div>
          </div>
        );
      case 'team':
        return <Team currentUser={currentUser} onNavigate={setActivePage} setPageData={setPageData} />;
      case 'team-form':
        return <TeamForm currentUser={currentUser} editingUser={pageData} onNavigate={setActivePage} />;
      case 'account':
        return <Account currentUser={currentUser} onNavigate={setActivePage} setPageData={setPageData} />;
      case 'transaction-form':
        return <TransactionForm currentUser={currentUser} editingTransaction={pageData} onNavigate={setActivePage} />;
      case 'cashbook':
        return <Cashbook currentUser={currentUser} />;
      case 'materials':
        return <Materials currentUser={currentUser} />;
      case 'vendor-contractor':
        return <VendorContractor />;
      case 'inventory':
        return <Inventory />;
      case 'bills':
        return <Bills currentUser={currentUser} />;
      case 'attendance':
        return <Attendance currentUser={currentUser} />;
      case 'siteimages':
        return <SiteImages currentUser={currentUser} />;
      case 'dpr':
        return (
          <ErrorBoundary>
            <DPR onNavigate={setActivePage} currentUser={currentUser} />
          </ErrorBoundary>
        );
      case 'dpr-history':
        return <DPRHistory onNavigate={setActivePage} currentUser={currentUser} />;
      case 'man-power':
        return <ManPower currentUser={currentUser} />;
      case 'chat':
        return <Chat currentUser={currentUser} />;
      case 'document':
        return <Documents currentUser={currentUser} />;

      case 'drawing':
        return (
          <ErrorBoundary>
            <Drawing currentUser={currentUser} />
          </ErrorBoundary>
        );
      case 'report':
        return (
          <ErrorBoundary>
            <Report currentUser={currentUser} />
          </ErrorBoundary>
        );
      case 'checklist-templates':
        return <TemplateManager onNavigate={setActivePage} />;
      case 'contacts':
        return <Contact />;
      case 'checklist':
        return <ChecklistDashboard onNavigate={setActivePage} setPageData={setPageData} />;
      case 'checklist-form':
        return <ChecklistForm checklistData={pageData} onNavigate={setActivePage} />;
      case 'checklist-templates':
        return <TemplateManager onNavigate={setActivePage} />;
      case 'barchart':
        return <ProjectSchedule onNavigate={setActivePage} />;
      case 'estimation':
        return <Estimation onNavigate={setActivePage} pageData={pageData} setPageData={setPageData} currentUser={currentUser} />;
      case 'shape-manager':
        return <ShapeManager onNavigate={setActivePage} />;
      case 'backend-test':
        return <BackendTest />;

      default:
        return (
          <div>
            <h1>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h1>
            <p className="text-muted">This feature is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <DashboardLayout
        user={currentUser}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      >
        {renderContent()}
      </DashboardLayout>
    </ErrorBoundary>
  );
};

// Main App Wrapper
function App() {
  return (
    <DataProvider>
      <CivilWiseApp />
    </DataProvider>
  );
}

export default App;
