import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '@/types/user';
import { userService } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      await refreshUser(); // 🔥 AMBIL LANGSUNG DARI SERVER
    } catch (err) {
      console.error("Auth init failed", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  initAuth();
  }, []);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { user: loggedInUser, token } = await userService.login(credentials);

      if (loggedInUser && loggedInUser.isApproved) {
        // 🔥 ambil foto profil
        let photoUrl: string | null = null;
        try {
          const res = await fetch('http://localhost:3001/api/users/me/profile-photo/image', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            photoUrl = data.photoUrl;
          }
        } catch (e) {
          console.warn("Failed to fetch profile photo");
        }

        const enrichedUser = {
          ...loggedInUser,
          photoUrl
        };

        setUser(enrichedUser);
        localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
        localStorage.setItem('authToken', token);

        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }

    setIsLoading(false);
    return false;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await userService.register(data);
      setIsLoading(false);
      return response.success;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  // fungsi untuk ambil user terbaru dari backend
  const refreshUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const [userRes, photoRes] = await Promise.all([
      fetch('http://localhost:3001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://localhost:3001/api/users/me/profile-photo/image', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    if (userRes.ok) {
      const newUser = await userRes.json();
      let photoUrl = null;

      if (photoRes.ok) {
        const photoData = await photoRes.json();
        photoUrl = photoData.photoUrl;
      }

      const enrichedUser = {
        ...newUser,
        photoUrl
      };

      setUser(enrichedUser);
      localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
    }
  } catch (error) {
    console.error('Failed to refresh user:', error);
  }
};

  const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: "Token tidak ditemukan." };
    }

    const res = await fetch("http://localhost:3001/api/auth/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.error || "Gagal mengubah password." };
    }

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, message: "Terjadi kesalahan server." };
  }
};



  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, refreshUser, changePassword }}>
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
