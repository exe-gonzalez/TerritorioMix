import React from 'react';
import { BookOpen, X, Terminal, Server, Globe, Shield, Database, Github } from 'lucide-react';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Guía Técnica de Despliegue y Arquitectura</h3>
              <p className="text-xs text-slate-400">
                Instrucciones de clonación, configuración de variables de entorno y hosting en Vercel/Render
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-800 text-sm">
          {/* Section 1: Stack */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
              <Server className="w-5 h-5 text-blue-600" />
              <span>1. Stack Tecnológico & Arquitectura</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              TerritorioMix está implementado con una arquitectura moderna de full-stack ágil:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <li className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">Frontend:</strong>
                React 19, TypeScript, Vite, Tailwind CSS y componentes responsivos con diseño "Bento Grid".
              </li>
              <li className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">Backend:</strong>
                Node.js con Express, autenticación JWT con <code>bcryptjs</code> para hash seguro de contraseñas.
              </li>
              <li className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">Base de Datos & Backups:</strong>
                Motor de persistencia en disco con soporte de exportación/restauración JSON instantáneo.
              </li>
              <li className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">Reportes & Exportaciones:</strong>
                Generación de PNG (alta legibilidad móvil), PDF profesional y planillas CSV/Excel con <code>jsPDF</code> y <code>html-to-image</code>.
              </li>
            </ul>
          </section>

          {/* Section 2: Environment variables */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>2. Variables de Entorno (.env)</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Nunca expongas claves en el código fuente. Crea un archivo <code>.env</code> en la raíz basándote en <code>.env.example</code>:
            </p>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto">
{`# URL pública de tu aplicación
APP_URL="https://tu-app-en-produccion.vercel.app"

# Clave secreta para firmar tokens JWT de sesión
JWT_SECRET="una_clave_secreta_muy_larga_y_segura_para_produccion"

# Ruta para persistencia de datos (en Railway/Render usar volumen persistente)
DB_FILE_PATH="./data/territorio_mix_db.json"

# Credenciales SMTP para correo de recuperación de contraseña (opcional)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="tu_sendgrid_api_key"`}
            </pre>
          </section>

          {/* Section 3: Cloning and Local run */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
              <Terminal className="w-5 h-5 text-emerald-600" />
              <span>3. Clonación e Instalación Paso a Paso</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700">
              <li>
                <strong>Clonar repositorio:</strong>{' '}
                <code className="bg-slate-100 px-2 py-0.5 rounded">git clone https://github.com/tu-usuario/territorio-mix.git</code>
              </li>
              <li>
                <strong>Instalar dependencias:</strong>{' '}
                <code className="bg-slate-100 px-2 py-0.5 rounded">npm install</code>
              </li>
              <li>
                <strong>Configurar variables:</strong> Copiar <code>.env.example</code> a <code>.env</code> y ajustar <code>JWT_SECRET</code>.
              </li>
              <li>
                <strong>Iniciar servidor de desarrollo:</strong>{' '}
                <code className="bg-slate-100 px-2 py-0.5 rounded">npm run dev</code> (o <code>npm start</code> en producción).
              </li>
            </ol>
          </section>

          {/* Section 4: Hosting in Vercel & Railway/Render */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
              <Globe className="w-5 h-5 text-amber-600" />
              <span>4. Despliegue en Vercel & Railway/Render</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <span>▲ Vercel (Frontend o Fullstack)</span>
                </h4>
                <p className="text-slate-600 leading-relaxed mb-2">
                  Puedes conectar tu repositorio de GitHub directamente a <strong>Vercel</strong>. En la configuración de construcción:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li><strong>Build Command:</strong> <code>npm run build</code></li>
                  <li><strong>Output Directory:</strong> <code>dist</code></li>
                  <li>Agrega <code>JWT_SECRET</code> y <code>APP_URL</code> en Vercel Environment Variables.</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <span>🚀 Railway o Render (Backend dedicado)</span>
                </h4>
                <p className="text-slate-600 leading-relaxed mb-2">
                  Si deseas un servidor permanente para el backend Express:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li><strong>Start Command:</strong> <code>npm start</code> (o <code>node dist/server.cjs</code>)</li>
                  <li>Crea un disco/volumen persistente montado en <code>/data</code> para que el archivo JSON/DB se mantenga entre reinicios.</li>
                  <li>Puedes utilizar la función de <strong>Backup / Restaurar</strong> del panel de administrador para descargar respaldos en cualquier momento.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-md"
          >
            Entendido, cerrar guía
          </button>
        </div>
      </div>
    </div>
  );
};
