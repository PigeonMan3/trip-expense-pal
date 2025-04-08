
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user storage - in a real app, this would use a secure backend
const USERS_STORAGE_KEY = 'tripExpensePal-users';
const CURRENT_USER_KEY = 'tripExpensePal-currentUser';

interface StoredUser extends User {
  password: string;
}

const loadUsers = (): StoredUser[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error('Error loading users from local storage:', error);
    return [];
  }
};

const saveUsers = (users: StoredUser[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to local storage:', error);
  }
};

const saveCurrentUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Error saving current user to local storage:', error);
  }
};

const loadCurrentUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error loading current user from local storage:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(loadCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!loadCurrentUser());

  useEffect(() => {
    // Initialize with a demo user if none exist
    const users = loadUsers();
    if (users.length === 0) {
      const demoUser: StoredUser = {
        id: uuidv4(),
        email: 'demo@example.com',
        name: 'Demo User',
        password: 'password'
      };
      saveUsers([demoUser]);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = loadUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      saveCurrentUser(userWithoutPassword);
      return true;
    }
    
    return false;
  };

  const signup = async (email: string, name: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = loadUsers();
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      return false;
    }
    
    const newUser: StoredUser = {
      id: uuidv4(),
      email,
      name,
      password
    };
    
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    saveCurrentUser(userWithoutPassword);
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    saveCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
