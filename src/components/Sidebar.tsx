import React, { useState } from 'react';
import { User } from '../types.ts';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Database,
  LogOut,
  Menu,
  X,
  BookOpen,
  Shield,
  User as UserIcon,
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onOpenBackup: () => void;
  onOpenDocs: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  onSelectTab,
  onLogout,
  onOpenBackup,
  onOpenDocs,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user.role === 'admin';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      id: 'records',
      label: 'Registros',
      icon: MapPin,
      show: true,
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      show: isAdmin,
    },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation bar */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
            T
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TerritorioMix</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-slate-800 text-white rounded-xl"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col p-6 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
              T
            </div>
            <span className="text-white font-bold text-xl tracking-tight">TerritorioMix</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

          <div className="my-4 border-t border-slate-800"></div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                onOpenBackup();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all font-medium text-left"
            >
              <Database className="w-5 h-5" />
              <span>Backup / Restaurar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onOpenDocs();
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all font-medium text-left"
          >
            <BookOpen className="w-5 h-5" />
            <span>Guía Despliegue</span>
          </button>
        </nav>

        {/* User Card & Logout */}
        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="p-4 bg-slate-800 rounded-2xl flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-bold">
              {isAdmin ? <Shield className="w-5 h-5 text-amber-400" /> : <UserIcon className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-white text-sm font-semibold truncate">{user.name}</p>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-mono">
                {user.role === 'admin' ? 'Administrador' : 'Censista / User'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
