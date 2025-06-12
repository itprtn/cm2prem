import React from 'react';
import { ProspectStatus, ContractStatus, UserRole } from '../../types';

interface BadgeProps {
  text: string;
  type: ProspectStatus | ContractStatus | UserRole | 'default' | 'active' | 'inactive' | 'info';
}

const Badge: React.FC<BadgeProps> = ({ text, type }) => {
  let colorClasses = '';

  switch (type) {
    // Prospect Statuses
    case ProspectStatus.NOUVEAU:
      colorClasses = 'bg-blue-100 text-status-blue';
      break;
    case ProspectStatus.CONTACT_ETABLI:
      colorClasses = 'bg-sky-100 text-sky-600';
      break;
    case ProspectStatus.A_RELANCER: // New
      colorClasses = 'bg-amber-100 text-amber-600';
      break;
    case ProspectStatus.DEVIS_ENVOYE:
      colorClasses = 'bg-yellow-100 text-status-yellow';
      break;
    case ProspectStatus.GAGNE_CLIENT:
      colorClasses = 'bg-green-100 text-status-green';
      break;
    case ProspectStatus.PERDU:
      colorClasses = 'bg-red-100 text-red-500';
      break;
    case ProspectStatus.NE_REPOND_PAS: // New
      colorClasses = 'bg-orange-100 text-orange-500';
      break;
    case ProspectStatus.INEXPLOITABLE: // New
      colorClasses = 'bg-slate-200 text-slate-600';
      break;

    // Contract Statuses
    case ContractStatus.ACTIF:
    case 'active': // For User Status
      colorClasses = 'bg-green-100 text-status-green';
      break;
    case ContractStatus.EN_ATTENTE:
      colorClasses = 'bg-yellow-100 text-status-yellow';
      break;
    case ContractStatus.EXPIRE:
      colorClasses = 'bg-slate-200 text-slate-500';
      break;
    case ContractStatus.ANNULE:
      colorClasses = 'bg-red-100 text-red-500';
      break;
    case ContractStatus.PRECOMPTE: // New
      colorClasses = 'bg-indigo-100 text-indigo-600';
      break;
    case ContractStatus.UNPAID: // New
      colorClasses = 'bg-pink-100 text-pink-600';
      break;

    // User Roles
    case UserRole.ADMIN:
      colorClasses = 'bg-purple-100 text-status-purple';
      break;
    case UserRole.COMMERCIAL:
      colorClasses = 'bg-blue-100 text-status-blue';
      break;
    
    // Generic Statuses
    case 'inactive':
       colorClasses = 'bg-slate-100 text-slate-500';
       break;
    case 'info':
        colorClasses = 'bg-cyan-100 text-cyan-600';
        break;
    default:
      colorClasses = 'bg-slate-100 text-text-secondary';
  }

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block ${colorClasses}`}>
      {text}
    </span>
  );
};

export default Badge;
