import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUsers = [
  {
    id: '1',
    email: 'user@demo.com',
    password: 'password',
    name: 'John Doe',
    role: 'user' as const
  },
  {
    id: '2', 
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    id: '3', 
    email: 'superadmin@demo.com',
    password: 'super123',
    name: 'Super Admin',
    role: 'superadmin' as const
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem('machinery_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userToSave = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role
      };
      setUser(userToSave);
      localStorage.setItem('machinery_user', JSON.stringify(userToSave));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('machinery_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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