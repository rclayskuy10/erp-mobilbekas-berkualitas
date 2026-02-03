'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '@/types';
import { users, rolePermissions } from '@/data/dummy';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session - use flag to avoid direct setState
    let mounted = true;
    
    const loadUser = () => {
      const savedUser = localStorage.getItem('erp_user');
      if (mounted) {
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
      }
    };
    
    loadUser();
    
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = users.find(
      u => u.email === email && u.password === password && u.isActive
    );

    if (foundUser) {
      const authUser: AuthUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        avatar: foundUser.avatar,
      };
      setUser(authUser);
      localStorage.setItem('erp_user', JSON.stringify(authUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_user');
  };

  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!user) return false;
    
    const rolePerms = rolePermissions.find(rp => rp.role === user.role);
    if (!rolePerms) return false;

    const modulePerms = rolePerms.permissions.find(p => p.module === module);
    if (!modulePerms) return false;

    return modulePerms.actions[action];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to get role display name
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    owner: 'Owner',
    investor: 'Investor',
    staff: 'Staff',
  };
  return roleNames[role];
}

// Helper to get role badge color
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    owner: 'bg-purple-100 text-purple-800',
    investor: 'bg-blue-100 text-blue-800',
    staff: 'bg-green-100 text-green-800',
  };
  return colors[role];
}
