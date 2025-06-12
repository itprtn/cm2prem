
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select'; // For mock config
import { ProspectsIcon, ContractsIcon, HubSpotIcon } from '../constants';

type ImportType = 'prospects' | 'contracts' | 'hubspot' | null;

interface ImportOptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const ImportOptionCard: React.FC<ImportOptionCardProps> = ({ icon, title, description, isSelected, onSelect }) => (
  <div 
    onClick={onSelect}
    className={`p-6 border-2 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 h-full flex flex-col items-center text-center ${isSelected ? 'border-primary-blue bg-blue-50' : 'border-card-border bg-white hover:border-slate-400'}`}
  >
    <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary-blue text-white' : 'bg-slate-100 text-primary-blue'}`}>
      {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: 'w-6 h-6' })}
    </div>
    <h3 className="text-lg font-semibold text-text-main mb-1">{title}</h3>
    <p className="text-sm text-text-secondary">{description}</p>
  </div>
);

// Mock data for HubSpot preview step
const mockHubSpotContactsPreview = [
    { id: 'hs1', name: 'Alice HubSpot', email: 'alice@hubspot-demo.com', status: 'Lead' },
    { id: 'hs2', name: 'Bob Syncwell', email: 'bob@hubspot-demo.com', status: 'Marketing Qualified Lead' },
    { id: 'hs3', name: 'Charlie Connector', email: 'charlie@hubspot-demo.com', status: 'Sales Qualified Lead' },
];


const ImportPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ImportType>(null);
  const [fileName, setFileName] = useState<string | null>(null); // For file upload
  const [isSyncing, setIsSyncing] = useState(false); // For HubSpot sync simulation
  const [syncProgress, setSyncProgress] = useState(0); // For HubSpot sync simulation


  const baseSteps = [
    "Sélection du type", // Common
    "Téléchargement du fichier",
    "Mapping des colonnes",
    "Validation",
    "Importation"
  ];

  const hubspotSteps = [
    "Sélection du type", // Common
    "Connexion à HubSpot",
    "Configuration du Sync",
    "Prévisualisation & Filtrage",
    "Synchronisation"
  ];

  const steps = selectedType === 'hubspot' ? hubspotSteps : baseSteps;

  const handleSelectType = (type: ImportType) => {
    setSelectedType(type);
    setCurrentStep(1); // Reset step if type changes
    setFileName(null);
    setIsSyncing(false);
    setSyncProgress(0);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    } else {
      setFileName(null);
    }
  };
  
  const handleSimulateSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        setSyncProgress(progress);
      } else {
        clearInterval(interval);
        // setCurrentStep(currentStep + 1); // Or show completion message
        alert("Synchronisation HubSpot simulée terminée. 3 contacts ont été importés/mis à jour.");
        setIsSyncing(false);
      }
    }, 500);
  };


  const handleContinue = () => {
    if (selectedType && currentStep < steps.length) {
      if (selectedType === 'hubspot' && currentStep === hubspotSteps.length -1) { // If on "Synchronisation" step for HubSpot
        handleSimulateSync();
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else if (selectedType !== 'hubspot' && currentStep === steps.length) { // Final step for file import
        alert(`Importation du fichier ${fileName} pour ${selectedType} terminée (simulation).`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setIsSyncing(false); // Stop sync if going back
      setSyncProgress(0);
    }
  };
  
  const getButtonText = () => {
    if (selectedType === 'hubspot') {
        if (currentStep === hubspotSteps.length -1) return "Lancer la Synchronisation";
        if (currentStep === hubspotSteps.length) return "Terminé";
    } else {
        if (currentStep === baseSteps.length) return "Terminer l'importation";
    }
    return "Continuer";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-main">Importation de Données</h1>
        <p className="text-sm text-text-secondary">Importez vos données en masse depuis des fichiers ou synchronisez avec HubSpot</p>
      </div>

      <Card>
        {/* Stepper */}
        <div className="p-4 border-b border-card-border">
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
              {steps.map((stepName, stepIdx) => (
                <li key={stepName} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  {stepIdx < currentStep -1 ? ( // Completed steps
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="h-0.5 w-full bg-primary-blue" />
                      </div>
                      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary-blue text-white">
                       {stepIdx + 1}
                      </span>
                    </>
                  ) : stepIdx === currentStep -1 ? ( // Current step
                     <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="h-0.5 w-full bg-slate-200" />
                      </div>
                      <span
                        className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-blue bg-white text-primary-blue"
                        aria-current="step"
                      >
                        {stepIdx + 1}
                      </span>
                    </>
                  ) : ( // Upcoming steps
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="h-0.5 w-full bg-slate-200" />
                      </div>
                      <span
                        className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-500"
                      >
                        {stepIdx + 1}
                      </span>
                    </>
                  )}
                   <span className="absolute top-10 left-1/2 -translate-x-1/2 text-xs text-text-secondary whitespace-nowrap text-center">{stepName}</span>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        
        <div className="p-6 mt-8 min-h-[300px]"> {/* Added min-height */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-medium text-text-main mb-6 text-center">Sélectionnez le type de données à importer</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <ImportOptionCard 
                  icon={<ProspectsIcon />}
                  title="Prospects (Fichier)"
                  description="Importer une liste de prospects avec leurs informations de contact."
                  isSelected={selectedType === 'prospects'}
                  onSelect={() => handleSelectType('prospects')}
                />
                <ImportOptionCard 
                  icon={<ContractsIcon />}
                  title="Contrats (Fichier)"
                  description="Importer des contrats existants avec leurs détails."
                  isSelected={selectedType === 'contracts'}
                  onSelect={() => handleSelectType('contracts')}
                />
                <ImportOptionCard 
                  icon={<HubSpotIcon className="text-orange-500"/>}
                  title="Synchronisation HubSpot"
                  description="Importer et synchroniser vos contacts depuis HubSpot."
                  isSelected={selectedType === 'hubspot'}
                  onSelect={() => handleSelectType('hubspot')}
                />
              </div>
            </div>
          )}

          {selectedType !== 'hubspot' && currentStep === 2 && (
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-xl font-medium text-text-main mb-4">Téléchargement du fichier ({selectedType})</h2>
              <p className="text-text-secondary mb-6">Sélectionnez un fichier CSV ou Excel à importer.</p>
              <label htmlFor="file-upload" className="w-full flex flex-col items-center px-4 py-6 bg-white text-primary-blue rounded-lg shadow border border-dashed border-primary-blue cursor-pointer hover:bg-blue-50">
                <svg className="w-8 h-8 mb-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                </svg>
                <span className="text-base leading-normal">{fileName || "Sélectionner un fichier"}</span>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
              </label>
              {fileName && <p className="mt-2 text-sm text-text-faded">Fichier sélectionné: {fileName}</p>}
            </div>
          )}

          {selectedType === 'hubspot' && currentStep === 2 && ( // Connexion à HubSpot
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-xl font-medium text-text-main mb-4">Connexion à HubSpot</h2>
              <p className="text-text-secondary mb-4">
                Assurez-vous que votre compte HubSpot est correctement configuré pour l'intégration.
                Vous pouvez vérifier les détails de la connexion dans <a href="#/settings" className="text-primary-blue hover:underline">Paramètres &gt; Intégrations API</a>.
              </p>
              <Button variant="secondary" disabled>Vérifier la connexion (Simulé)</Button>
              <p className="text-xs text-text-faded mt-2">(Cette action est simulée et ne vérifiera pas une connexion réelle.)</p>
            </div>
          )}
           {selectedType === 'hubspot' && currentStep === 3 && ( // Configuration du Sync
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl font-medium text-text-main mb-6 text-center">Configuration de la Synchronisation</h2>
              <div className="space-y-4">
                <Select label="Type de contacts à synchroniser:" options={[{value: 'all', label:'Tous les contacts'}, {value:'leads', label:'Leads uniquement'}, {value:'customers', label:'Clients uniquement'}]} />
                <Select label="Fréquence de synchronisation:" options={[{value: 'manual', label:'Manuelle'}, {value:'daily', label:'Quotidienne (simulée)'}, {value:'weekly', label:'Hebdomadaire (simulée)'}]} />
                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">Mapping des champs (Simplifié):</label>
                    <p className="text-xs text-text-secondary p-2 bg-slate-50 rounded">
                        HubSpot Email &rarr; Premunia Email <br/>
                        HubSpot Nom &rarr; Premunia Nom <br/>
                        HubSpot Statut Lead &rarr; Premunia Statut Prospect (Mapping auto.)
                    </p>
                </div>
                <p className="text-xs text-text-faded text-center">Options de configuration simulées.</p>
              </div>
            </div>
          )}
          {selectedType === 'hubspot' && currentStep === 4 && ( // Prévisualisation
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-medium text-text-main mb-4 text-center">Prévisualisation & Filtrage (HubSpot)</h2>
              <p className="text-text-secondary mb-4 text-center">Voici un aperçu des contacts qui seraient importés/synchronisés depuis HubSpot.</p>
              <div className="overflow-x-auto border border-card-border rounded-md">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-2 text-left font-medium text-text-secondary">Nom (HubSpot)</th>
                            <th className="p-2 text-left font-medium text-text-secondary">Email</th>
                            <th className="p-2 text-left font-medium text-text-secondary">Statut (HubSpot)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {mockHubSpotContactsPreview.map(contact => (
                            <tr key={contact.id}>
                                <td className="p-2 text-text-main">{contact.name}</td>
                                <td className="p-2 text-text-main">{contact.email}</td>
                                <td className="p-2 text-text-main">{contact.status}</td>
                            </tr>
                        ))}
                         <tr>
                            <td colSpan={3} className="p-2 text-center text-text-faded">... et plus de contacts (simulation)</td>
                        </tr>
                    </tbody>
                </table>
              </div>
               <p className="text-xs text-text-faded text-center mt-2">Prévisualisation simulée. Aucun filtre réel appliqué.</p>
            </div>
          )}
          {selectedType === 'hubspot' && currentStep === 5 && ( // Synchronisation
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-xl font-medium text-text-main mb-4">Synchronisation avec HubSpot</h2>
              {isSyncing ? (
                <>
                  <p className="text-text-secondary mb-2">Synchronisation en cours...</p>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-primary-blue h-2.5 rounded-full" style={{ width: `${syncProgress}%` }}></div>
                  </div>
                  <p className="text-sm text-primary-blue mt-2">{syncProgress}%</p>
                </>
              ) : (
                <p className="text-text-secondary">Prêt à lancer la synchronisation.</p>
              )}
            </div>
          )}


          {selectedType !== 'hubspot' && currentStep > 2 && currentStep <= steps.length && (
                <div className="text-center">
                    <h2 className="text-xl font-medium text-text-main mb-4">{steps[currentStep-1]} pour {selectedType}</h2>
                     <p className="text-text-secondary">Contenu pour l'étape {currentStep} pour l'import de fichier "{fileName || 'non sélectionné'}"...</p>
                </div>
           )}
        </div>

        <div className="p-4 border-t border-card-border flex justify-between items-center">
            <Button 
                variant="outline" 
                onClick={handlePrevious} 
                disabled={currentStep === 1 || isSyncing}
            >
              Précédent
            </Button>
            <Button 
                variant="primary" 
                onClick={handleContinue} 
                disabled={
                    (!selectedType && currentStep === 1) || 
                    (selectedType !== 'hubspot' && currentStep === 2 && !fileName) ||
                    (selectedType === 'hubspot' && currentStep === hubspotSteps.length && !isSyncing) || // Done button after sync finishes
                    isSyncing // Disable while syncing
                }
            >
              {getButtonText()}
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default ImportPage;
