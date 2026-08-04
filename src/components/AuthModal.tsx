import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, LogIn, KeyRound, ShieldAlert } from 'lucide-react';
import { APP_VERSION } from '../version';

interface AuthModalProps {
  onLoginSuccess: (token: string, user: User) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [demoResetUrl, setDemoResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setForgotMessage(null);
    setDemoResetUrl(null);

    try {
      if (tab === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email || 'administrador', password }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Error al iniciar sesión');
        }
        onLoginSuccess(data.token, data.user);
      } else if (tab === 'forgot') {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'gonzalez.exe@mendoza.edu.ar' }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'No se pudo enviar correo de recuperación');
        }
        setForgotMessage(data.message);
        if (data.resetUrl) {
          setDemoResetUrl(data.resetUrl);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl text-white mb-2 shadow-lg">
            T
          </div>
          <h2 className="text-xl font-bold tracking-tight">TerritorioMix</h2>
          <p className="text-slate-400 text-xs">Sistema Integral de Relevamiento Territorial</p>
        </div>

        {/* Tab selector: Solo Iniciar Sesión y Recuperar */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === 'login'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('forgot');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === 'forgot'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recuperar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {forgotMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl space-y-2">
              <p className="font-semibold">✓ {forgotMessage}</p>
              {demoResetUrl && (
                <div className="mt-2 p-2 bg-white rounded border border-emerald-300 text-slate-800 font-mono text-[11px] break-all">
                  <span className="font-bold text-blue-600 block mb-1">[Demo Enlace Generado]:</span>
                  <a href={demoResetUrl} className="text-blue-600 underline">
                    {demoResetUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {tab === 'login' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de Usuario o Correo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="administrador"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>En el primer inicio de sesión como <strong>administrador</strong>, la contraseña ingresada quedará definida para tu cuenta.</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl space-y-1">
                <p className="font-bold">Recuperación de cuenta autorizada</p>
                <p>
                  Las instrucciones para restablecer la contraseña se enviarán únicamente al correo oficial:
                </p>
                <p className="font-mono font-bold text-blue-700 text-sm bg-white p-2 rounded border border-blue-200 text-center">
                  gonzalez.exe@mendoza.edu.ar
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {loading ? (
              <span className="text-sm">Procesando...</span>
            ) : tab === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Enviar Instrucciones a gonzalez.exe@mendoza.edu.ar</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <span className="inline-block px-2.5 py-1 text-[11px] font-mono font-medium text-slate-500 bg-slate-100 rounded-full border border-slate-200">
              Versión: {APP_VERSION}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
