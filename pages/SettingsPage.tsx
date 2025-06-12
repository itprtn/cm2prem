import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
    KeyIcon, 
    EyeIcon, 
    EyeSlashIcon, 
    ClipboardDocumentIcon, 
    ArrowTopRightOnSquareIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon
} from '../constants';

type SettingsTab = 'Vue d\'ensemble' | 'Authentification' | 'Fichiers journaux' | 'Webhooks';

interface HubSpotScope {
  name: string;
  sensitive?: boolean;
}

const hubSpotScopes: HubSpotScope[] = [
  { name: 'crm.schemas.quotes.read' }, { name: 'crm.objects.subscriptions.write' }, { name: 'crm.objects.line_items.read' },
  { name: 'crm.schemas.subscriptions.read' }, { name: 'crm.objects.line_items.write' }, { name: 'crm.schemas.invoices.write' },
  { name: 'automation' }, { name: 'crm.objects.goals.write' }, { name: 'actions' }, { name: 'timeline' },
  { name: 'business-intelligence' }, { name: 'forms' }, { name: 'account-info.security.read' }, { name: 'crm.export' },
  { name: 'crm.objects.products.read' }, { name: 'crm.objects.products.write' }, { name: 'accounting' },
  { name: 'crm.objects.goals.read' }, { name: 'crm.lists.read' }, { name: 'crm.objects.contacts.read' },
  { name: 'crm.objects.subscriptions.read' }, { name: 'crm.import' },
  { name: 'crm.commercepayments.read' }, { name: 'crm.commercepayments.write' },
  { name: 'crm.objects.contacts.sensitive.read', sensitive: true }, { name: 'crm.objects.invoices.read' },
  { name: 'crm.schemas.invoices.read' }, { name: 'crm.objects.companies.sensitive.read', sensitive: true },
  { name: 'crm.objects.deals.sensitive.read', sensitive: true }, { name: 'crm.objects.custom.sensitive.read', sensitive: true },
  { name: 'crm.objects.users.read' }, { name: 'crm.objects.contacts.write' }, { name: 'crm.objects.users.write' },
  { name: 'crm.objects.marketing_events.read' }, { name: 'crm.objects.marketing_events.write' },
  { name: 'crm.schemas.custom.read' }, { name: 'crm.objects.custom.read' },
];


const SettingsPage: React.FC = () => {
  const [activeIntegrationTab, setActiveIntegrationTab] = useState<SettingsTab>('Authentification');
  
  const [showAccessToken, setShowAccessToken] = useState(true);
  const [accessToken] = useState('pat-eu1-82f9a8aa-ae76-4860-9750-2aec4ec794f1');
  
  const [showClientSecret, setShowClientSecret] = useState(true);
  const [clientSecret] = useState('4c74e80a-31af-43fe-a077-506d689440df');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert(`${type} copié dans le presse-papiers !`))
      .catch(err => console.error(`Erreur de copie ${type}: `, err));
  };

  const handleActualiser = () => {
    console.log("Simulating HubSpot API token refresh/update. No actual API call is made from the client-side with hardcoded keys.");
    alert("Action 'Actualiser' simulée. Vérifiez la console.");
  };

  const integrationTabs: SettingsTab[] = ['Vue d\'ensemble', 'Authentification', 'Fichiers journaux', 'Webhooks'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-headings font-heading">Paramètres</h1>
      <p className="text-text-secondary">Gérez les paramètres de votre application.</p>

      <Card title="Paramètres Généraux">
        <div className="p-4">
          <p className="text-text-main">Contenu des paramètres généraux ici...</p>
          <p className="text-text-faded mt-2">Exemple: Configuration de l'entreprise, préférences de notification, etc.</p>
        </div>
      </Card>
      
      <Card>
        <div className="border-b border-card-border">
          <nav className="flex px-4" aria-label="Tabs">
            {integrationTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveIntegrationTab(tab)}
                className={`
                  ${tab === activeIntegrationTab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-main hover:border-slate-300'}
                  whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none -mb-px font-heading
                `}
                aria-current={tab === activeIntegrationTab ? 'page' : undefined}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {activeIntegrationTab === 'Authentification' && (
           <div className="p-4 md:p-6 space-y-6">
            <div className="p-4 bg-orange-50 border border-orange-300 rounded-md flex items-start space-x-3">
              <KeyIcon className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Ces identifiants offrent un accès API à votre compte HubSpot. Conservez-les précieusement en sécurité.
                </p>
              </div>
            </div>

            {/* Jeton d'accès */}
            <div className="bg-white border border-card-border rounded-md shadow-sm">
              <div className="p-4 border-b border-card-border">
                <h3 className="text-lg font-semibold text-text-headings font-heading">Jeton d'accès</h3>
                <p className="text-sm text-text-secondary">
                  Utilisé pour passer des appels d'API.
                  <a href="#" className="inline-flex items-center text-primary hover:underline ml-1">
                    Voir un exemple <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-0.5"/>
                  </a>
                </p>
              </div>
              <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
                <span className="font-mono text-sm text-text-main break-all">
                  {showAccessToken ? accessToken : '•'.repeat(accessToken.length)}
                </span>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button onClick={() => setShowAccessToken(!showAccessToken)} className="text-sm text-primary hover:underline p-1" title={showAccessToken ? "Masquer" : "Afficher"}>
                    {showAccessToken ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(accessToken, "Jeton d'accès")} leftIcon={<ClipboardDocumentIcon className="w-4 h-4"/>}>
                    Copier
                  </Button>
                  <Button 
                    variant="primary" // Changed to primary to use themed button
                    size="sm" 
                    onClick={handleActualiser}
                    rightIcon={<ChevronDownIcon className="w-4 h-4" />}
                  >
                    Actualiser
                  </Button>
                </div>
              </div>
            </div>

            {/* Secret du client */}
            <div className="bg-white border border-card-border rounded-md shadow-sm">
              <div className="p-4 border-b border-card-border">
                <h3 className="text-lg font-semibold text-text-headings font-heading">Secret du client</h3>
                <p className="text-sm text-text-secondary">
                  Utilisé pour valider les signatures.
                  <a href="#" className="inline-flex items-center text-primary hover:underline ml-1">
                    En savoir plus <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-0.5"/>
                  </a>
                </p>
              </div>
              <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
                <span className="font-mono text-sm text-text-main break-all">
                  {showClientSecret ? clientSecret : '•'.repeat(clientSecret.length)}
                </span>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button onClick={() => setShowClientSecret(!showClientSecret)} className="text-sm text-primary hover:underline p-1" title={showClientSecret ? "Masquer" : "Afficher"}>
                    {showClientSecret ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(clientSecret, "Secret du client")} leftIcon={<ClipboardDocumentIcon className="w-4 h-4"/>}>
                    Copier
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Domaines */}
            <div className="bg-white border border-card-border rounded-md shadow-sm">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-text-headings font-heading mb-3">Domaines</h3>
                <div className="flex flex-wrap gap-2">
                  {hubSpotScopes.slice(0, 25).map(scope => ( // Display a subset for brevity
                    <span key={scope.name} className="flex items-center bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {scope.name}
                      {scope.sensitive && <ExclamationTriangleIcon className="w-3.5 h-3.5 ml-1.5 text-yellow-500" title="Domaine sensible"/>}
                    </span>
                  ))}
                  {hubSpotScopes.length > 25 && <span className="text-xs text-text-secondary self-center">...et {hubSpotScopes.length - 25} autres.</span>}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeIntegrationTab === 'Vue d\'ensemble' && <div className="p-4 text-text-secondary">Contenu pour Vue d'ensemble des intégrations...</div>}
        {activeIntegrationTab === 'Fichiers journaux' && <div className="p-4 text-text-secondary">Contenu pour Fichiers journaux...</div>}
        {activeIntegrationTab === 'Webhooks' && <div className="p-4 text-text-secondary">Contenu pour Webhooks...</div>}
      </Card>


      <Card title="Facturation">
         <div className="p-4">
          <p className="text-text-main">Consultez et gérez vos informations de facturation.</p>
           <p className="text-text-faded mt-2">(Section Placeholder)</p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;