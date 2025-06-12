import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PremuniaLogoIcon, ShieldIcon } from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { UserRole, DemoUser } from '../types';

const demoUsers: DemoUser[] = [
  { id: 'admin001', name: 'Directeur Admin', role: UserRole.ADMIN, avatarColor: 'bg-premunia-purple' },
  { id: 'user002', name: 'Jean Conseiller', role: UserRole.COMMERCIAL, avatarColor: 'bg-premunia-red' },
  { id: 'user003', name: 'Sophie Gestionnaire', role: UserRole.SUPPORT, avatarColor: 'bg-premunia-pink' },
];

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email et mot de passe sont requis.');
      return;
    }
    try {
      await login(email); // Regular login
      navigate('/dashboard');
    } catch (err) {
      setError('Échec de la connexion. Vérifiez vos identifiants.');
      console.error(err);
    }
  };

  const handleDemoLogin = async (demoUser: DemoUser) => {
    setError('');
    try {
      const fullDemoUser = {
        id: demoUser.id,
        name: demoUser.name,
        email: `${demoUser.name.toLowerCase().replace(' ', '.')}@premunia.fr`,
        role: demoUser.role,
        avatarUrl: `https://picsum.photos/seed/${demoUser.id}/100/100`
      };
      await login(fullDemoUser.email, fullDemoUser); // Pass full demo user object
      navigate('/dashboard');
    } catch (err) {
      setError('Échec de la connexion démo.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
        <ShieldIcon className="mx-auto h-16 w-auto text-primary" />
        <h2 className="mt-6 text-3xl font-extrabold text-text-headings font-heading">
          Premunia CRM
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Connectez-vous à votre espace de travail
        </p>
      </div>

      <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10 w-full max-w-md">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
          />
          <Input
            id="password"
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" variant="primary">
            Se connecter
          </Button>
        </form>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 shadow-xl rounded-lg sm:px-10">
          <h3 className="text-sm font-medium text-text-main text-center mb-4 font-heading">Connexion rapide (Démo)</h3>
          <div className="grid grid-cols-2 gap-3">
            {demoUsers.map((dUser) => (
              <Button 
                key={dUser.id} 
                variant="outline"
                size="custom" // Using custom to allow specific padding here
                className="w-full flex flex-col items-center !py-3 !px-2 text-xs" // Custom padding and text size
                onClick={() => handleDemoLogin(dUser)}
              >
                <span className={`w-8 h-8 rounded-full ${dUser.avatarColor} flex items-center justify-center text-white font-semibold mb-1`}>
                  {dUser.name.substring(0, 1)}
                </span>
                <span className="text-text-main">{dUser.name}</span>
                <span className="text-text-faded">{dUser.role}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
       <div className="mt-8 text-center">
         <PremuniaLogoIcon className="h-10 w-auto text-primary mx-auto" />
      </div>
    </div>
  );
};

export default LoginPage;