import React, { useState, useEffect } from 'react';
import {
  TerritorioRecord,
  TipoEdificacion,
  TIPOS_EDIFICACION_LIST,
  User,
} from '../types.ts';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  FileText,
  FileSpreadsheet,
  Image,
  X,
  MapPin,
  Building2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { exportToCSV, exportToPDF, exportElementToPNG } from '../lib/exportUtils.ts';

interface RecordsViewProps {
  user: User;
  initialFilterTerritorio?: string;
  initialFilterTipo?: string;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  user,
  initialFilterTerritorio = 'TODOS',
  initialFilterTipo = 'TODOS',
}) => {
  const [records, setRecords] = useState<TerritorioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTerritorio, setFilterTerritorio] = useState(initialFilterTerritorio);
  const [filterTipo, setFilterTipo] = useState(initialFilterTipo);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TerritorioRecord | null>(null);
  const [formTerritorio, setFormTerritorio] = useState('');
  const [formManzana, setFormManzana] = useState('');
  const [formCalle, setFormCalle] = useState('');
  const [formNumeracion, setFormNumeracion] = useState('');
  const [formTipo, setFormTipo] = useState<TipoEdificacion>('Departamentos');
  const [formPisos, setFormPisos] = useState('');
  const [formCantidadDepartamentos, setFormCantidadDepartamentos] = useState('');
  const [formPorteriaVigilancia, setFormPorteriaVigilancia] = useState('');
  const [formObs, setFormObs] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [exportingPng, setExportingPng] = useState(false);

  const isAdmin = user.role === 'admin';

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('territorio_mix_token');
      const params = new URLSearchParams();
      if (filterTerritorio && filterTerritorio !== 'TODOS') {
        params.append('territorio', filterTerritorio);
      }
      if (filterTipo && filterTipo !== 'TODOS') {
        params.append('tipoEdificacion', filterTipo);
      }
      if (searchQuery.trim() !== '') {
        params.append('search', searchQuery.trim());
      }
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filterTerritorio, filterTipo, searchQuery, dateFrom, dateTo]);

  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setFormTerritorio('');
    setFormManzana('');
    setFormCalle('');
    setFormNumeracion('');
    setFormTipo('Departamentos');
    setFormPisos('');
    setFormCantidadDepartamentos('');
    setFormPorteriaVigilancia('');
    setFormObs('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: TerritorioRecord) => {
    if (!isAdmin) return;
    setEditingRecord(rec);
    setFormTerritorio(rec.territorio);
    setFormManzana(rec.manzana);
    setFormCalle(rec.calle || rec.calleNumeracion || '');
    setFormNumeracion(rec.numeracion || '');
    setFormTipo(rec.tipoEdificacion);
    setFormPisos(rec.pisos || '');
    setFormCantidadDepartamentos(rec.cantidadDepartamentos || '');
    setFormPorteriaVigilancia(rec.porteriaVigilancia || '');
    setFormObs(rec.observaciones || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem('territorio_mix_token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const payload = {
        territorio: formTerritorio,
        manzana: formManzana,
        calle: formCalle,
        numeracion: formNumeracion,
        calleNumeracion: `${formCalle} ${formNumeracion}`.trim(),
        tipoEdificacion: formTipo,
        pisos: formTipo === 'Departamentos' ? formPisos : undefined,
        cantidadDepartamentos: formTipo === 'Departamentos' ? formCantidadDepartamentos : undefined,
        porteriaVigilancia: formTipo === 'Departamentos' ? formPorteriaVigilancia : undefined,
        observaciones: formObs,
      };

      if (editingRecord) {
        const res = await fetch(`/api/records/${editingRecord.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al actualizar el registro');
      } else {
        const res = await fetch('/api/records', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al crear el registro');
      }

      setIsModalOpen(false);
      await fetchRecords();
    } catch (err: any) {
      setFormError(err.message || 'Error guardando registro.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('¿Estás seguro de eliminar este registro territorial de forma definitiva?')) {
      return;
    }

    try {
      const token = localStorage.getItem('territorio_mix_token');
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'No se pudo eliminar el registro.');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const uniqueTerritorios = Array.from(new Set(records.map((r) => r.territorio))).sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return String(a).localeCompare(String(b));
  });

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registros Territoriales</h1>
          <p className="text-slate-500 text-sm">
            Gestión de manzanas, edificaciones y censos ({records.length} resultados)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-200 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </header>

      {/* Filter and Search Bar (Bento card) */}
      <div className="bg-white border border-slate-200 p-5 rounded-3xl mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por calle, manzana, observaciones..."
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Territorio */}
          <div>
            <select
              value={filterTerritorio}
              onChange={(e) => setFilterTerritorio(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="TODOS">📍 Todos los territorios</option>
              {uniqueTerritorios.map((terr) => (
                <option key={terr} value={terr}>
                  {isNaN(Number(terr)) ? terr : `Territorio ${terr}`}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tipo Edificacion */}
          <div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="TODOS">🏢 Todos los tipos</option>
              {TIPOS_EDIFICACION_LIST.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters / Refresh */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFilterTerritorio('TODOS');
                setFilterTipo('TODOS');
                setSearchQuery('');
                setDateFrom('');
                setDateTo('');
              }}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={fetchRecords}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              title="Refrescar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Filter row */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Desde:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
            />
            <span>Hasta:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
            />
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Exportar vista:</span>
            <button
              type="button"
              onClick={() => exportToPDF(records, 'reporte_territorial.pdf')}
              className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold flex items-center gap-1 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => exportToCSV(records, 'reporte_territorial.csv')}
              className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold flex items-center gap-1 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel/CSV</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                setExportingPng(true);
                await exportElementToPNG('records-print-container', 'territorio_registros.png');
                setExportingPng(false);
              }}
              disabled={exportingPng}
              className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold flex items-center gap-1 transition-colors"
            >
              <Image className="w-3.5 h-3.5" />
              <span>{exportingPng ? '...' : 'PNG (Móvil)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Records Container */}
      <div id="records-print-container" className="flex-1">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium">Cargando registros...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base mb-1">
              No hay registros territoriales
            </h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
              {searchQuery || filterTerritorio !== 'TODOS' || filterTipo !== 'TODOS'
                ? 'Prueba modificando o limpiando los filtros de búsqueda.'
                : 'Aún no se ha cargado ninguna manzana o edificación en el sistema.'}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Crear primer registro
            </button>
          </div>
        ) : (
          /* Responsive Layout: Cards on mobile, Table on desktop */
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Desktop Table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
                    <th className="py-3.5 px-4">Territorio & Manzana</th>
                    <th className="py-3.5 px-4">Calle y Numeración</th>
                    <th className="py-3.5 px-4">Tipo de Edificación</th>
                    <th className="py-3.5 px-4">Observaciones</th>
                    <th className="py-3.5 px-4">Censista</th>
                    <th className="py-3.5 px-4">Fecha</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-base">
                          <span className="text-slate-900">{rec.territorio}</span>
                          <span className="text-slate-400 font-normal">-</span>
                          <span className="text-blue-600">{rec.manzana}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div>{rec.calleNumeracion}</div>
                        {rec.tipoEdificacion === 'Departamentos' && (rec.pisos || rec.cantidadDepartamentos || rec.porteriaVigilancia) && (
                          <div className="flex flex-wrap gap-1 mt-1 text-[11px] font-normal text-slate-600">
                            {rec.pisos && <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Pisos: <strong>{rec.pisos}</strong></span>}
                            {rec.cantidadDepartamentos && <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Dptos: <strong>{rec.cantidadDepartamentos}</strong></span>}
                            {rec.porteriaVigilancia && <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Portería: <strong>{rec.porteriaVigilancia}</strong></span>}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          {rec.tipoEdificacion}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-xs text-slate-600 truncate">
                        {rec.observaciones || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-semibold text-slate-800">{rec.createdByName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                        {new Date(rec.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(rec)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar registro"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card grid view */}
            <div className="md:hidden divide-y divide-slate-100">
              {records.map((rec) => (
                <div key={rec.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-lg">
                      <span className="text-slate-900">{rec.territorio}</span>
                      <span className="text-slate-400 font-normal">-</span>
                      <span className="text-blue-600">{rec.manzana}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {new Date(rec.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>

                  <div className="text-sm text-slate-800 font-medium">
                    📍 {rec.calleNumeracion}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
                      🏢 {rec.tipoEdificacion}
                    </span>
                    {rec.tipoEdificacion === 'Departamentos' && rec.pisos && (
                      <span className="text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100">
                        Pisos: {rec.pisos}
                      </span>
                    )}
                    {rec.tipoEdificacion === 'Departamentos' && rec.cantidadDepartamentos && (
                      <span className="text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100">
                        Dptos: {rec.cantidadDepartamentos}
                      </span>
                    )}
                    {rec.tipoEdificacion === 'Departamentos' && rec.porteriaVigilancia && (
                      <span className="text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100">
                        Portería: {rec.porteriaVigilancia}
                      </span>
                    )}
                  </div>

                  {rec.observaciones && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl italic">
                      "{rec.observaciones}"
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Censista: <strong>{rec.createdByName}</strong></span>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(rec)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="px-2 py-1 bg-rose-50 text-rose-700 rounded-lg font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Borrar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Record Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">
                  {editingRecord ? 'Editar Registro Territorial' : 'Nuevo Registro Territorial'}
                </h3>
                <p className="text-xs text-slate-400">
                  Formulario oficial de relevamiento (TerritorioMix)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRecord} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Territorio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Territorio <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTerritorio}
                  onChange={(e) => setFormTerritorio(e.target.value)}
                  placeholder="Ej. 54"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Manzana */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manzana <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formManzana}
                  onChange={(e) => setFormManzana(e.target.value)}
                  placeholder="Ej. 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Calle y Numeración en campos separados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Calle <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCalle}
                    onChange={(e) => setFormCalle(e.target.value)}
                    placeholder="Ej. Av. San Martín"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Numeración <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNumeracion}
                    onChange={(e) => setFormNumeracion(e.target.value)}
                    placeholder="Ej. 1045 o S/N"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tipo de Edificación */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de Edificación <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value as TipoEdificacion)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {TIPOS_EDIFICACION_LIST.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos condicionales al elegir "Departamentos" */}
              {formTipo === 'Departamentos' && (
                <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Información del Edificio de Departamentos</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pisos
                      </label>
                      <input
                        type="text"
                        value={formPisos}
                        onChange={(e) => setFormPisos(e.target.value)}
                        placeholder="Ej. 8 o PB y 4 pisos"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cantidad de departamentos
                      </label>
                      <input
                        type="text"
                        value={formCantidadDepartamentos}
                        onChange={(e) => setFormCantidadDepartamentos(e.target.value)}
                        placeholder="Ej. 24 o 12 dptos"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Portería / Vigilancia
                    </label>
                    <input
                      type="text"
                      value={formPorteriaVigilancia}
                      onChange={(e) => setFormPorteriaVigilancia(e.target.value)}
                      placeholder="Ej. Sí (24 hs), No cuenta con portería, Guardia diurna..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones (opcional)
                </label>
                <textarea
                  rows={3}
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  placeholder="Detalles del inmueble, pisos, estado o notas adicionales..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-colors text-sm"
                >
                  {submitting ? 'Guardando...' : editingRecord ? 'Actualizar' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
