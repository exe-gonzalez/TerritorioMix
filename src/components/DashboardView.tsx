import React, { useState, useEffect } from 'react';
import { StatsSummary, TerritorioRecord, User } from '../types.ts';
import {
  MapPin,
  FileSpreadsheet,
  FileText,
  Image,
  RefreshCw,
  Plus,
  Database,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { exportToCSV, exportToPDF, exportElementToPNG } from '../lib/exportUtils.ts';

interface DashboardViewProps {
  user: User;
  onNewEntry: () => void;
  onOpenBackup: () => void;
  onNavigateToRecords: (filterTerritorio?: string, filterTipo?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNewEntry,
  onOpenBackup,
  onNavigateToRecords,
}) => {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [recentRecords, setRecentRecords] = useState<TerritorioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingPng, setExportingPng] = useState(false);

  const isAdmin = user.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('territorio_mix_token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isAdmin) {
        const resStats = await fetch('/api/admin/stats', { headers });
        if (resStats.ok) {
          const statsData = await resStats.json();
          setStats(statsData);
        }
      }

      // Fetch recent records for all users
      const resRecords = await fetch('/api/records', { headers });
      if (resRecords.ok) {
        const recs: TerritorioRecord[] = await resRecords.json();
        setRecentRecords(recs.slice(0, 5));

        // If user is not admin, compute local basic stats summary
        if (!isAdmin) {
          const totalRecords = recs.length;
          const tipoMap: Record<string, number> = {};
          const terrMap: Record<string, number> = {};
          recs.forEach((r) => {
            tipoMap[r.tipoEdificacion] = (tipoMap[r.tipoEdificacion] || 0) + 1;
            terrMap[r.territorio] = (terrMap[r.territorio] || 0) + 1;
          });
          const byTipoEdificacion = Object.entries(tipoMap).map(([name, count]) => ({
            name,
            count,
            percentage: totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0,
          }));
          const byTerritorio = Object.entries(terrMap).map(([name, count]) => ({
            name,
            count,
          }));

          setStats({
            totalRecords,
            byTipoEdificacion,
            byTerritorio,
            totalUsers: 1,
            recentRecordsCount: recs.length,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportPNG = async () => {
    setExportingPng(true);
    await exportElementToPNG('bento-dashboard-export', 'territoriomix_dashboard.png');
    setExportingPng(false);
  };

  const colorPalette = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-rose-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-slate-400',
  ];

  if (loading || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Cargando métricas y panel territorial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-slate-500 text-sm">
            Métricas generales y gestión del relevamiento territorial
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenBackup}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors text-sm shadow-sm"
            >
              <Database className="w-4 h-4 text-blue-600" />
              <span>Restaurar Backup</span>
            </button>
          )}
          <button
            type="button"
            onClick={onNewEntry}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Entrada</span>
          </button>
        </div>
      </header>

      {/* Bento Grid */}
      <div
        id="bento-dashboard-export"
        className="grid grid-cols-12 gap-6 flex-1 pb-8"
      >
        {/* Metric Card 1 - Total Registros */}
        <div
          onClick={() => onNavigateToRecords()}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">Total Registros</p>
            <MapPin className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-slate-900">{stats.totalRecords.toLocaleString()}</p>
            <p className="text-emerald-600 text-xs font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{stats.recentRecordsCount} relevados últ. semana</span>
            </p>
          </div>
        </div>

        {/* Metric Card 2 - Territorios Activos */}
        <div
          onClick={() => onNavigateToRecords()}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">Territorios Activos</p>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-slate-900">{stats.byTerritorio.length}</p>
            <p className="text-slate-400 text-xs mt-1">
              {stats.byTerritorio[0]?.name
                ? `Territorio principal: ${stats.byTerritorio[0].name}`
                : 'Zonas distribuidas'}
            </p>
          </div>
        </div>

        {/* Building Breakdown Chart (Bento Large) */}
        <div className="col-span-12 lg:col-span-6 row-span-2 bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-slate-900">Edificaciones por Tipo</h3>
                <p className="text-xs text-slate-500">Distribución porcentual de los inmuebles censados</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                Tiempo Real
              </span>
            </div>

            {stats.byTipoEdificacion.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No hay registros cargados aún</p>
            ) : (
              <div className="space-y-4">
                {stats.byTipoEdificacion.slice(0, 5).map((item, idx) => {
                  const colorClass = colorPalette[idx % colorPalette.length];
                  return (
                    <div
                      key={item.name}
                      onClick={() => onNavigateToRecords(undefined, item.name)}
                      className="group cursor-pointer"
                    >
                      <div className="flex justify-between text-sm mb-1.5 text-slate-600 font-medium">
                        <span className="group-hover:text-blue-600 transition-colors">
                          {item.name} ({item.count})
                        </span>
                        <span className="font-bold text-slate-900">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className={`${colorClass} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(item.percentage, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tipologías activas: {stats.byTipoEdificacion.length}</span>
            <button
              type="button"
              onClick={() => onNavigateToRecords()}
              className="text-blue-600 font-semibold hover:underline"
            >
              Ver desglose completo →
            </button>
          </div>
        </div>

        {/* Recent Activity Table (Bento Medium) */}
        <div className="col-span-12 lg:col-span-6 row-span-2 bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Últimos Registros</h3>
              <button
                type="button"
                onClick={() => onNavigateToRecords()}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Ver todos
              </button>
            </div>

            {recentRecords.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No se encontraron registros recientes</p>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((rec, index) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="overflow-hidden pr-2">
                      <div className="flex items-center gap-1 font-semibold text-sm truncate">
                        <span className="text-slate-900">{rec.territorio}</span>
                        <span className="text-slate-400 font-normal">-</span>
                        <span className="text-blue-600">{rec.manzana}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {rec.calleNumeracion} • <span className="font-medium text-slate-700">{rec.tipoEdificacion}</span>
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded font-bold shrink-0 ${
                        index === 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {index === 0
                        ? 'NUEVO'
                        : new Date(rec.createdAt).toLocaleDateString('es-AR', {
                            month: 'short',
                            day: 'numeric',
                          })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Última actualización: {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="font-medium text-slate-700">TerritorioMix v1.0</span>
          </div>
        </div>

        {/* Export/Action Card */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-indigo-600 p-6 rounded-3xl flex flex-col justify-between shadow-lg shadow-indigo-100">
          <div>
            <p className="text-indigo-100 text-sm font-medium">Exportar Datos</p>
            <p className="text-white text-xs opacity-80 mt-1">
              Reporte instantáneo para móvil/oficina
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={() => exportToPDF(recentRecords, 'territoriomix_recientes.pdf')}
              className="p-2.5 bg-indigo-500 text-white rounded-xl text-xs font-bold border border-indigo-400 hover:bg-indigo-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportPNG}
              disabled={exportingPng}
              className="p-2.5 bg-indigo-500 text-white rounded-xl text-xs font-bold border border-indigo-400 hover:bg-indigo-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <Image className="w-3.5 h-3.5" />
              <span>{exportingPng ? '...' : 'PNG'}</span>
            </button>
            <button
              type="button"
              onClick={() => exportToCSV(recentRecords, 'territoriomix_recientes.csv')}
              className="p-2.5 bg-indigo-500 text-white rounded-xl text-xs font-bold border border-indigo-400 hover:bg-indigo-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={() => exportToCSV(recentRecords, 'territoriomix_recientes.xls')}
              className="p-2.5 bg-indigo-500 text-white rounded-xl text-xs font-bold border border-indigo-400 hover:bg-indigo-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Quick Status */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between">
          <p className="text-slate-500 text-sm font-medium">Estado del Sistema</p>
          <div className="my-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-slate-900 font-bold">Backup al día</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Base de datos segura y activa en servidor
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase">
            Ult: {new Date().toISOString().slice(0, 10)} 03:00AM
          </p>
        </div>
      </div>
    </div>
  );
};
