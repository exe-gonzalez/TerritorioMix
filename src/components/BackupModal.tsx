import React, { useState } from 'react';
import { Database, Download, Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BackupModalProps {
  onClose: () => void;
  onRestoreSuccess: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose, onRestoreSuccess }) => {
  const [restoring, setRestoring] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleDownloadBackup = async () => {
    try {
      const token = localStorage.getItem('territorio_mix_token');
      const response = await fetch('/api/admin/backup', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('No se pudo descargar la copia de seguridad');
      }

      const backupData = await response.json();
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `territoriomix_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setResultMsg({
        type: 'success',
        text: 'Copia de seguridad descargada exitosamente en formato JSON.',
      });
    } catch (err: any) {
      setResultMsg({
        type: 'error',
        text: err.message || 'Error al descargar la copia de seguridad',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('¿Estás seguro de restaurar esta copia de seguridad? Se reemplazarán los datos actuales en el servidor.')) {
      return;
    }

    setRestoring(true);
    setResultMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        const token = localStorage.getItem('territorio_mix_token');
        const res = await fetch('/api/admin/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(parsed),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Fallo en la restauración');
        }

        setResultMsg({
          type: 'success',
          text: data.message || 'Base de datos restaurada correctamente.',
        });
        onRestoreSuccess();
      } catch (err: any) {
        setResultMsg({
          type: 'error',
          text: err.message || 'El archivo seleccionado no es un backup válido de TerritorioMix.',
        });
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Copias de Seguridad & Restauración</h3>
              <p className="text-xs text-slate-400">
                Resguardo de la base de datos de TerritorioMix
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

        {/* Body */}
        <div className="p-6 space-y-6">
          {resultMsg && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-start gap-3 border ${
                resultMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {resultMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              )}
              <div className="font-medium leading-relaxed">{resultMsg.text}</div>
            </div>
          )}

          {/* Backup Section */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Exportar Copia de Seguridad (Backup)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Genera un archivo JSON consolidado con todos los registros territoriales y las cuentas
              de usuario vigentes en el sistema para resguardo externo.
            </p>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Archivo JSON de Resguardo</span>
            </button>
          </div>

          {/* Restore Section */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Restaurar Base de Datos (Restore)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Selecciona un archivo JSON de respaldo previo de TerritorioMix para reincorporar los
              registros en caso de contingencia.
            </p>
            <label className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md">
              <Upload className="w-4 h-4" />
              <span>{restoring ? 'Procesando restauración...' : 'Seleccionar Archivo de Respaldo (.json)'}</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                disabled={restoring}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
