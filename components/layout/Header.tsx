
import React from 'react';
import { BellIcon, UserCircleIcon, ChevronDownIcon } from '../../constants'; // Assuming constants.tsx exists

interface HeaderProps {
  userName: string;
  userRole: string;
  // Potentially add search functionality, notifications count etc.
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-10"> {/* Removed ml-64 */}
      <div>
        {/* Placeholder for breadcrumbs or page title if needed */}
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-text-secondary">
            Dernière mise à jour <br/> {currentDate}
        </div>
        <button className="text-text-secondary hover:text-text-main p-1" aria-label="Notifications">
          <BellIcon className="h-6 w-6" />
        </button>
        <button 
          type="button" 
          className="flex items-center p-1 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-1"
          aria-label="User menu"
        >
          <UserCircleIcon className="h-8 w-8 text-text-secondary rounded-full" />
          <span className="ml-2 text-sm font-medium text-text-main">{userName}</span>
          <ChevronDownIcon className="ml-1 h-4 w-4 text-text-secondary" />
        </button>
      </div>
    </header>
  );
};

export default Header;