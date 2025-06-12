import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NavItem } from '../../types';
import { UserCircleIcon } from '../../constants';

interface SidebarProps {
  logo: React.ReactNode;
  appName: string;
  appSubtitle: string;
  userName: string;
  userRole: string;
  navItems: NavItem[];
  logoutIcon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  logo, appName, appSubtitle, userName, userRole, navItems, logoutIcon 
}) => {
  const { logout, user } = useAuth();

  return (
    <div className="w-64 bg-sidebar-bg text-white flex flex-col h-full fixed">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2 mb-1">
          {logo}
          <span className="text-xl font-semibold font-heading">{appName}</span>
        </div>
        <span className="text-xs text-slate-400">{appSubtitle}</span>
      </div>

      <div className="p-4 border-b border-slate-700 flex items-center space-x-3">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={userName} className="w-10 h-10 rounded-full" />
        ) : (
          <UserCircleIcon className="w-10 h-10 text-slate-400" />
        )}
        <div>
          <p className="font-medium text-sm">{userName}</p>
          <p className="text-xs text-slate-400">{userRole}</p>
        </div>
      </div>

      <nav className="flex-1 mt-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-md group hover:bg-slate-700 hover:text-white transition-colors duration-150 ${
                isActive ? 'bg-primary text-white' : 'text-slate-300' 
              }`
            }
          >
            {item.icon && React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: 'mr-3 h-5 w-5 flex-shrink-0' })}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 hover:text-white group transition-colors duration-150"
        >
          {logoutIcon && React.cloneElement(logoutIcon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: 'mr-3 h-5 w-5 flex-shrink-0' })}
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;