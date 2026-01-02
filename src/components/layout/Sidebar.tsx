import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserCheck,
  CalendarDays,
  FileText,
  User,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  // ===============================
  // STATE
  // ===============================
  const [profilePhoto, setProfilePhoto] = React.useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = React.useState(true);

  // ===============================
  // LOAD PROFILE PHOTO (WAIT USER)
  // ===============================
  React.useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const fetchPhoto = async () => {
      try {
        setLoadingPhoto(true);

        const res = await fetch(
          'http://localhost:3001/api/users/me/profile-photo',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error('Failed to fetch profile photo');

        const data = await res.json();
        setProfilePhoto(data.photoUrl); // base64
      } catch (err) {
        console.error('Load profile photo error:', err);
        setProfilePhoto(null);
      } finally {
        setLoadingPhoto(false);
      }
    };

    fetchPhoto();
  }, [user]);

  // ===============================
  // MENU CONFIG
  // ===============================
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: CalendarDays,
      roles: ['Karyawan', 'HR', 'IT', 'Admin', 'Super Admin']
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      roles: ['Karyawan', 'HR', 'IT', 'Admin', 'Super Admin']
    },
    {
      id: 'attendance-history',
      label: 'Riwayat Kehadiran',
      icon: CalendarDays,
      roles: ['Karyawan']
    },
    {
      id: 'access-management',
      label: 'Akses Manajemen',
      icon: UserCheck,
      roles: ['HR', 'Admin', 'Super Admin']
    },
    {
      id: 'role-management',
      label: 'Hak Akses Aplikasi',
      icon: Users,
      roles: ['IT', 'Admin', 'Super Admin']
    },
    {
      id: 'employee-attendance',
      label: 'Daftar Riwayat Kehadiran',
      icon: FileText,
      roles: ['HR']
    }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* HEADER */}
      <div className="p-6 border-b flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
          {!loadingPhoto && profilePhoto ? (
            <img
              src={`data:image/jpeg;base64,${profilePhoto}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-gray-500" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            {user?.fullName}
          </p>
          <p className="text-xs text-brand-600 font-medium">
            {user?.role}
          </p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start h-11 ${
                  currentPage === item.id
                    ? 'bg-brand-500 text-white hover:bg-brand-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
