import React, { useState } from 'react';
import { User, UserRole, StatCardItem } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { SearchIcon, FilterIcon, PlusIcon, EyeIcon, EditIcon, DeleteIcon, UserCircleIcon, UsersIcon, ShieldIcon } from '../constants'; // Added ShieldIcon for admin

const initialUsers: User[] = [
  { id: '1', name: 'Pierre Dubois', email: 'admin@premunia.fr', role: UserRole.ADMIN, avatarUrl: 'https://picsum.photos/seed/pd/100', status: 'Actif', createdDate: '2024-01-01', permissions: ['Tous droits'], lastActivity: 'il y a 1h' },
  { id: '2', name: 'Marie Martin', email: 'marie@premunia.fr', role: UserRole.COMMERCIAL, avatarUrl: 'https://picsum.photos/seed/mm/100', status: 'Actif', createdDate: '2024-01-05', permissions: ['Contacts', 'Propositions', 'Contrats'], lastActivity: 'il y a 2h' }, // objectifs field removed
  { id: '3', name: 'Jean Dupont', email: 'jean@premunia.fr', role: UserRole.COMMERCIAL, avatarUrl: 'https://picsum.photos/seed/jd/100', status: 'Actif' },
];

const roleOptions = [
  { value: 'all', label: 'Tous les rôles' },
  ...Object.values(UserRole).map(r => ({ value: r, label: r }))
];

const statusUserOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'Actif', label: 'Actif' },
    { value: 'Inactif', label: 'Inactif' },
];

const UserStatCard: React.FC<StatCardItem> = ({ title, value, icon, iconBgColor }) => (
    <Card className="flex-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-semibold text-text-main">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBgColor}`}>
          {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: 'h-6 w-6 text-white' })}
        </div>
      </div>
    </Card>
  );

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === UserRole.ADMIN).length;
  const commercialCount = users.filter(u => u.role === UserRole.COMMERCIAL).length;

  const stats: StatCardItem[] = [
    { title: 'Total Utilisateurs', value: totalUsers, icon: <UsersIcon />, iconBgColor: 'bg-status-blue' },
    { title: 'Administrateurs', value: adminCount, icon: <ShieldIcon />, iconBgColor: 'bg-status-purple' },
    { title: 'Commerciaux', value: commercialCount, icon: <UsersIcon />, iconBgColor: 'bg-status-green' },
  ];

  const UserCardDisplay: React.FC<{user: User}> = ({ user }) => (
    <Card className="mb-4">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full mr-4"/>
                ) : (
                    <UserCircleIcon className="w-12 h-12 text-slate-400 mr-4"/>
                )}
                <div>
                    <h3 className="text-lg font-semibold text-text-headings font-heading">{user.name} {user.role === UserRole.COMMERCIAL && ' conseiller'}</h3>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                    {user.createdDate && <p className="text-xs text-text-faded">Créé le: {new Date(user.createdDate).toLocaleDateString('fr-FR')}</p>}
                </div>
            </div>
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                <Badge text={user.role} type={user.role}/>
                {user.status && <Badge text={user.status} type={user.status === 'Actif' ? 'active' : 'inactive'}/>}
            </div>
        </div>
        {/* The user.objectifs check has been removed as the field 'objectifs' is no longer on User type */}
        {(user.permissions || user.lastActivity) && (
            <div className="p-4 border-t border-card-border grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.permissions && (
                    <div>
                        <h4 className="text-xs font-medium text-text-secondary uppercase mb-1 font-heading">Permissions</h4>
                        <p className="text-sm text-text-main">{user.permissions.join(', ')}</p>
                    </div>
                )}
                {user.lastActivity && (
                    <div>
                        <h4 className="text-xs font-medium text-text-secondary uppercase mb-1 font-heading">Dernière Activité</h4>
                        <p className="text-sm text-text-main">{user.lastActivity}</p>
                    </div>
                )}
            </div>
        )}
        <div className="p-4 border-t border-card-border flex justify-end space-x-2">
            <Button variant="outline" size="sm" leftIcon={<EditIcon className="w-4 h-4"/>}>Modifier</Button>
            {user.role !== UserRole.ADMIN && <Button variant="outline" size="sm" className="text-red-500 border-red-300 hover:bg-red-50" leftIcon={<DeleteIcon className="w-4 h-4"/>}>Supprimer</Button>}
        </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-semibold text-text-headings font-heading">Gestion des Utilisateurs</h1>
            <p className="text-sm text-text-secondary">{filteredUsers.length} utilisateurs</p>
        </div>
        <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5"/>}>
            Nouvel Utilisateur
        </Button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map(stat => <UserStatCard key={stat.title} {...stat} />)}
      </div>
      
      <Card>
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center border-b border-card-border">
          <div className="w-full md:flex-1">
             <Input 
                placeholder="Rechercher par nom ou email..."
                icon={<SearchIcon />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto">
            <Select 
                options={roleOptions}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="min-w-[180px]"
            />
          </div>
          <div className="w-full md:w-auto">
            <Select 
                options={statusUserOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-w-[180px]"
            />
          </div>
        </div>
        
        <div className="p-4">
            {filteredUsers.map((user) => (
                <UserCardDisplay key={user.id} user={user} />
            ))}
        </div>

        {filteredUsers.length === 0 && (
            <div className="text-center py-10 text-text-secondary">
                Aucun utilisateur ne correspond à vos critères.
            </div>
        )}
      </Card>
    </div>
  );
};

export default UsersPage;