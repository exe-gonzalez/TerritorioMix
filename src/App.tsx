/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from './types.ts';
import { AuthModal } from './components/AuthModal.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { RecordsView } from './components/RecordsView.tsx';
import { UsersView } from './components/UsersView.tsx';
import { BackupModal } from './components/BackupModal.tsx';
import { DocumentationModal } from './components/DocumentationModal.tsx';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'users'>('dashboard');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Filters passed from dashboard clicks
  const [filterTerritorio, setFilterTerritorio] = useState('TODOS');
  const [filterTipo, setFilterTipo] = useState('TODOS');

  // Check login on startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('territorio_mix_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('territorio_mix_token');
        }
      } catch (err) {
        console.error('Error validating token:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (token: string, loggedUser: User) => {
    localStorage.setItem('territorio_mix_token', token);
    setUser(loggedUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('territorio_mix_token');
    setUser(null);
  };

  const handleNavigateToRecords = (terr?: string, tipo?: string) => {
    if (terr) setFilterTerritorio(terr);
    else setFilterTerritorio('TODOS');

    if (tipo) setFilterTipo(tipo);
    else setFilterTipo('TODOS');

    setActiveTab('records');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold">Cargando TerritorioMix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {!user ? (
        <AuthModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {/* Sidebar */}
          <Sidebar
            user={user}
            activeTab={activeTab}
            onSelectTab={(t) => setActiveTab(t as any)}
            onLogout={handleLogout}
            onOpenBackup={() => setIsBackupOpen(true)}
            onOpenDocs={() => setIsDocsOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {activeTab === 'dashboard' && (
              <DashboardView
                user={user}
                onNewEntry={() => setActiveTab('records')}
                onOpenBackup={() => setIsBackupOpen(true)}
                onNavigateToRecords={handleNavigateToRecords}
              />
            )}

            {activeTab === 'records' && (
              <RecordsView
                user={user}
                initialFilterTerritorio={filterTerritorio}
                initialFilterTipo={filterTipo}
              />
            )}

            {activeTab === 'users' && <UsersView currentUser={user} />}
          </main>

          {/* Backup & Restore Modal */}
          {isBackupOpen && (
            <BackupModal
              onClose={() => setIsBackupOpen(false)}
              onRestoreSuccess={() => {
                setIsBackupOpen(false);
                window.location.reload();
              }}
            />
          )}

          {/* Documentation Modal */}
          {isDocsOpen && <DocumentationModal onClose={() => setIsDocsOpen(false)} />}
        </>
      )}
    </div>
  );
}

