
import React, { useEffect, useRef } from 'react';
import { Prospect } from '../../types';
import Badge from '../ui/Badge';
import { splitFullName } from '../../utils/stringUtils';
import Button from '../ui/Button';
import { formatDateForDisplay } from '../../utils/dateUtils';

interface ProspectDetailModalProps {
  prospect: Prospect;
  onClose: () => void;
}

const ProspectDetailModal: React.FC<ProspectDetailModalProps> = ({ prospect, onClose }) => {
  const comparatorRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const { firstName, lastName } = splitFullName(prospect.name);
  const formattedDateOfBirthForDisplay = prospect.dateOfBirth ? formatDateForDisplay(prospect.dateOfBirth) : 'N/A';
  const formattedDateOfBirthForOggo = prospect.dateOfBirth ? formatDateForDisplay(prospect.dateOfBirth) : ''; // Ensure DD/MM/YYYY for Oggo

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cks.oggo-data.net/icomparator/health.js';
    script.type = 'text/javascript';
    script.async = true;
    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      if (comparatorRef.current) {
        comparatorRef.current.innerHTML = ''; // Ensure div is cleared for potential re-initialization
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full flex flex-col" style={{maxHeight: '90vh'}}>
        <div className="p-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-text-headings font-heading">Détail Prospect: {prospect.name}</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-main text-2xl leading-none"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Basic Prospect Info - Prioritizing DOB and Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4">
            <div><p className="text-sm text-text-secondary">Email:</p> <p className="text-text-main">{prospect.email}</p></div>
            <div><p className="text-sm text-text-secondary">Téléphone:</p> <p className="text-text-main">{prospect.phone}</p></div>
            <div><p className="text-sm text-text-secondary">Date de naissance:</p> <p className="text-text-main font-medium">{formattedDateOfBirthForDisplay}</p></div>
            <div><p className="text-sm text-text-secondary">Code Postal:</p> <p className="text-text-main font-medium">{prospect.postalCode || '-'}</p></div>
            <div><p className="text-sm text-text-secondary">Ville:</p> <p className="text-text-main">{prospect.ville || '-'}</p></div>
            <div><p className="text-sm text-text-secondary">Statut:</p> <Badge text={prospect.status} type={prospect.status} /></div>
            <div><p className="text-sm text-text-secondary">Commercial:</p> <p className="text-text-main">{prospect.commercial}</p></div>
            <div><p className="text-sm text-text-secondary">Source:</p> <p className="text-text-main">{prospect.source}</p></div>
          </div>

          <h3 className="text-lg font-semibold text-text-headings font-heading border-t border-card-border pt-4 mt-4">Comparateur Santé OggoData</h3>
          <div 
            id="oggodata-icomparator-health"
            ref={comparatorRef}
            style={{ width: '100%', minHeight:'500px', height: 'auto', border: '1px solid #ccc', overflowY: 'auto' }} // Adjusted height to auto with minHeight
            data-nom={lastName}
            data-prenom={firstName}
            data-date_naissance={formattedDateOfBirthForOggo} // Use formatted DOB
            data-code_postal={prospect.postalCode || ''}    // Use postalCode
            data-email={prospect.email || ''}
            data-telephone={prospect.phone || ''}
          >
            <p className="text-center text-text-secondary p-8">Chargement du comparateur OggoData...</p>
          </div>
        </div>
         <div className="p-4 border-t border-card-border text-right">
            <Button variant="outline" onClick={onClose}>
                Fermer
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ProspectDetailModal;
