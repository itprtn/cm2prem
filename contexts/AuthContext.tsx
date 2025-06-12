
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types'; // Adjust path as needed

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, demoUser?: User) => Promise<void>; // Modified to accept demoUser
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for persisted auth state (optional)
    const storedUser = localStorage.getItem('premuniacrm_user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('premuniacrm_user');
      }
    }
  }, []);

  const login = async (email: string, demoUser?: User) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let loggedInUser: User;

    if (demoUser) {
      loggedInUser = demoUser;
    } else if (email.toLowerCase() === 'admin@premunia.fr') {
      loggedInUser = { 
        id: 'admin001', 
        name: 'Pierre Dubois', 
        email: 'admin@premunia.fr', 
        role: UserRole.ADMIN, 
        avatarUrl: `https://picsum.photos/seed/pierredubois/100/100` 
      };
    } else if (email.toLowerCase() === 'jean@premunia.fr') {
       loggedInUser = { 
        id: 'user002', 
        name: 'Jean Conseiller', 
        email: 'jean@premunia.fr', 
        role: UserRole.COMMERCIAL, 
        avatarUrl: `https://picsum.photos/seed/jeanconseiller/100/100` 
      };
    }
     else {
      // For any other email, create a generic user for testing
      loggedInUser = { 
        id: 'generic001', 
        name: email.split('@')[0] || 'Utilisateur Test', 
        email: email, 
        role: UserRole.COMMERCIAL, 
        avatarUrl: `https://picsum.photos/seed/${email}/100/100` 
      };
    }
    
    setUser(loggedInUser);
    setIsAuthenticated(true);
    localStorage.setItem('premuniacrm_user', JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('premuniacrm_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
