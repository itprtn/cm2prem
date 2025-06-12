import React, { useState } from 'react';
import { Campaign } from '../types'; // Assuming Campaign type is defined
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { SearchIcon, FilterIcon, PlusIcon, EyeIcon, EditIcon, DeleteIcon } from '../constants';

const initialCampaigns: Campaign[] = [
  { id: 'camp1', name: 'Campagne Printemps Seniors', status: 'Active', startDate: '01/03/2024', endDate: '31/05/2024', targetAudience: 'Seniors 60+', budget: 5000 },
  { id: 'camp2', name: 'Webinaire Protection Familiale', status: 'Terminée', startDate: '15/01/2024', endDate: '15/01/2024', targetAudience: 'Jeunes Familles', budget: 500 },
  // Add more mock campaigns
];

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Terminée', label: 'Terminée' },
];

const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-semibold text-text-headings font-heading">Toutes les Compagnies / Campagnes</h1>
            <p className="text-sm text-text-secondary">{filteredCampaigns.length} campagnes</p>
        </div>
        <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5"/>}>
            Nouvelle Campagne
        </Button>
      </div>

      <Card>
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center border-b border-card-border">
          <div className="w-full md:flex-1">
            <Input 
              placeholder="Rechercher par nom..."
              icon={<SearchIcon />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto">
            <Select 
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-w-[200px]"
            />
          </div>
          <Button variant="outline" leftIcon={<FilterIcon />}>
            Filtres
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Nom de la Campagne</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date de Début</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date de Fin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Audience Cible</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Budget</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">{campaign.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge text={campaign.status} type={campaign.status === 'Active' ? 'active' : (campaign.status === 'Terminée' ? 'inactive' : 'default')} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{campaign.startDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{campaign.endDate || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{campaign.targetAudience}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{campaign.budget.toFixed(2)}€</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-primary hover:text-primary-hover"><EyeIcon className="w-5 h-5"/></button>
                    <button className="text-yellow-500 hover:text-yellow-600"><EditIcon className="w-5 h-5"/></button>
                    <button className="text-red-500 hover:text-red-600"><DeleteIcon className="w-5 h-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCampaigns.length === 0 && (
            <div className="text-center py-10 text-text-secondary">
                Aucune campagne ne correspond à vos critères.
            </div>
        )}
      </Card>
    </div>
  );
};

export default CampaignsPage;