import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProspectsPage from './pages/ProspectsPage';
import ContractsPage from './pages/ContractsPage';
import UsersPage from './pages/UsersPage';
import AutomationPage from './pages/AutomationPage';
import ImportPage from './pages/ImportPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import CampaignsPage from './pages/CampaignsPage';
import TicketsPage from './pages/TicketsPage'; // Import TicketsPage
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { PremuniaLogoIcon, DashboardIcon, ProspectsIcon, ContractsIcon, CampaignsIcon, UsersIcon, AutomationIcon, ImportIcon, ReportsIcon, SettingsIcon, LogoutIcon, TicketIcon } from './constants'; // Import TicketIcon
import { NavItem, UserRole } from './types';

const ProtectedRoute: React.FC<{ element: React.ReactElement; allowedRoles?: UserRole[] }> = ({ element, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />; 
  }
  return element;
};

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const allNavItems: NavItem[] = [
    { name: 'Tableau de Bord', path: '/dashboard', icon: <DashboardIcon className="w-5 h-5" />, allowedRoles: [UserRole.ADMIN, UserRole.COMMERCIAL] },
    { name: 'Prospects', path: '/prospects', icon: <ProspectsIcon className="w-5 h-5" />, allowedRoles: [UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.SUPPORT] },
    { name: 'Contrats', path: '/contracts', icon: <ContractsIcon className="w-5 h-5" />, allowedRoles: [UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.SUPPORT] },
    { name: 'Tickets SAV', path: '/tickets', icon: <TicketIcon className="w-5 h-5" />, allowedRoles: [UserRole.ADMIN, UserRole.SUPPORT] }, // Added Tickets NAV
    { name: 'Compagnies', path: '/campaigns', icon: <CampaignsIcon className="w-5 h-5" />, allowedRoles: [UserRole.ADMIN] },
    { name: 'Utilisateurs', path: '/users', icon: <UsersIcon className="w-5 h-5" />, allowedRoles: [UserRole.ADMIN] },
    { name: 'Automatisation', path: '/automation', icon: <AutomationIcon className="w-5 h-5" />, allowedRoles: [UserRole.ADMIN, UserRole.COMMERCIAL] },
    { name: 'Importation', path: '/import', icon: <ImportIcon className="w-5 h-5" />, allowedRoles: [UserRole.ADMIN] },
    { name: 'Rapports', path: '/reports', icon: <ReportsIcon className="w-5 h-5" />, allowedRoles: [UserRole.ADMIN, UserRole.COMMERCIAL] },
    { name: 'Paramètres', path: '/settings', icon: <SettingsIcon className="w-5 h-5" />, allowedRoles: [UserRole.ADMIN] },
  ];

  const getFilteredNavItems = () => {
    if (!user) return [];
    return allNavItems.filter(item => item.allowedRoles?.includes(user.role));
  };
  
  const getDefaultPathForRole = (role?: UserRole): string => {
    if (!role) return "/login";
    switch (role) {
        case UserRole.ADMIN:
            return "/dashboard";
        case UserRole.COMMERCIAL:
            return "/dashboard"; 
        case UserRole.SUPPORT:
            return "/tickets"; // Support's primary view is now Tickets
        default:
            return "/login";
    }
  }


  if (!isAuthenticated || !user) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    );
  }
  
  const filteredNavItems = getFilteredNavItems();
  const defaultUserPath = getDefaultPathForRole(user.role);

  return (
    <HashRouter>
      <div className="flex h-screen bg-page-bg">
        <Sidebar 
          logo={<PremuniaLogoIcon className="h-8 w-auto text-white" />} 
          appName="Premunia" 
          appSubtitle="CRM Courtage"
          userName={user.name}
          userRole={user.role}
          navItems={filteredNavItems}
          logoutIcon={<LogoutIcon className="w-5 h-5"/>}
        />
        <div className="flex-1 flex flex-col overflow-hidden ml-64">
          <Header userName={user.name} userRole={user.role} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-page-bg p-6">
            <Routes>
              {/* Common routes accessible by multiple roles but component handles specific logic */}
              <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} allowedRoles={[UserRole.ADMIN, UserRole.COMMERCIAL]} />} />
              <Route path="/prospects" element={<ProtectedRoute element={<ProspectsPage />} allowedRoles={[UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.SUPPORT]} />} />
              <Route path="/contracts" element={<ProtectedRoute element={<ContractsPage />} allowedRoles={[UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.SUPPORT]} />} />
              <Route path="/automation" element={<ProtectedRoute element={<AutomationPage />} allowedRoles={[UserRole.ADMIN, UserRole.COMMERCIAL]} />} />
              <Route path="/reports" element={<ProtectedRoute element={<ReportsPage />} allowedRoles={[UserRole.ADMIN, UserRole.COMMERCIAL]}/>} />
              <Route path="/tickets" element={<ProtectedRoute element={<TicketsPage />} allowedRoles={[UserRole.ADMIN, UserRole.SUPPORT]} />} /> {/* Added Tickets Route */}

              {/* Admin-only routes */}
              <Route path="/campaigns" element={<ProtectedRoute element={<CampaignsPage />} allowedRoles={[UserRole.ADMIN]} />} />
              <Route path="/users" element={<ProtectedRoute element={<UsersPage />} allowedRoles={[UserRole.ADMIN]} />} />
              <Route path="/import" element={<ProtectedRoute element={<ImportPage />} allowedRoles={[UserRole.ADMIN]} />} />
              <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} allowedRoles={[UserRole.ADMIN]} />} />
              
              {/* Default redirect for authenticated users */}
              <Route path="/" element={<Navigate to={defaultUserPath} />} />
              {/* Fallback for any other unknown authenticated routes */}
              <Route path="*" element={<Navigate to={defaultUserPath} />} /> 
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;