import { Router, Response } from 'express';
import { db } from '../db';
import { TIPOS_EDIFICACION_LIST, TipoEdificacion } from '../../src/types';
import { authenticateJWT, AuthenticatedRequest, requireAdmin } from '../authMiddleware';

const router = Router();

// Get all records (with filters)
router.get('/', authenticateJWT, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { territorio, tipoEdificacion, search, dateFrom, dateTo } = req.query;
    let records = db.getAllRecords();

    if (territorio && typeof territorio === 'string' && territorio !== 'TODOS') {
      records = records.filter((r) =>
        r.territorio.toLowerCase().includes(territorio.toLowerCase())
      );
    }

    if (tipoEdificacion && typeof tipoEdificacion === 'string' && tipoEdificacion !== 'TODOS') {
      records = records.filter((r) => r.tipoEdificacion === tipoEdificacion);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.calleNumeracion.toLowerCase().includes(q) ||
          r.manzana.toLowerCase().includes(q) ||
          r.territorio.toLowerCase().includes(q) ||
          (r.observaciones && r.observaciones.toLowerCase().includes(q)) ||
          r.tipoEdificacion.toLowerCase().includes(q) ||
          r.createdByName.toLowerCase().includes(q)
      );
    }

    if (dateFrom && typeof dateFrom === 'string') {
      const fromTime = new Date(dateFrom).getTime();
      if (!isNaN(fromTime)) {
        records = records.filter((r) => new Date(r.createdAt).getTime() >= fromTime);
      }
    }

    if (dateTo && typeof dateTo === 'string') {
      const toTime = new Date(dateTo).getTime();
      if (!isNaN(toTime)) {
        records = records.filter((r) => new Date(r.createdAt).getTime() <= toTime + 86400000);
      }
    }

    res.json(records);
  } catch (error) {
    console.error('Error in GET /api/records:', error);
    res.status(500).json({ error: 'Error al consultar registros territoriales.' });
  }
});

// Create new record (User and Admin can create)
router.post('/', authenticateJWT, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      territorio,
      manzana,
      calle,
      numeracion,
      calleNumeracion,
      tipoEdificacion,
      pisos,
      cantidadDepartamentos,
      porteriaVigilancia,
      observaciones,
    } = req.body;

    if (!territorio || !manzana || (!calleNumeracion && (!calle || !numeracion)) || !tipoEdificacion) {
      res.status(400).json({
        error:
          'Campos requeridos faltantes: territorio, manzana, calle, numeracion y tipoEdificacion son obligatorios.',
      });
      return;
    }

    if (!TIPOS_EDIFICACION_LIST.includes(tipoEdificacion as TipoEdificacion)) {
      res.status(400).json({
        error: `Tipo de edificación inválido. Las opciones permitidas son: ${TIPOS_EDIFICACION_LIST.join(', ')}`,
      });
      return;
    }

    const newRecord = db.createRecord(
      {
        territorio,
        manzana,
        calle,
        numeracion,
        calleNumeracion: calleNumeracion || `${calle || ''} ${numeracion || ''}`.trim(),
        tipoEdificacion: tipoEdificacion as TipoEdificacion,
        pisos,
        cantidadDepartamentos,
        porteriaVigilancia,
        observaciones,
      },
      req.user!
    );

    res.status(201).json({
      message: 'Registro territorial creado con éxito.',
      record: newRecord,
    });
  } catch (error) {
    console.error('Error in POST /api/records:', error);
    res.status(500).json({ error: 'No se pudo guardar el registro territorial.' });
  }
});

// Update record (User and Admin can update)
router.put(
  '/:id',
  authenticateJWT,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { id } = req.params;
      const {
        territorio,
        manzana,
        calle,
        numeracion,
        calleNumeracion,
        tipoEdificacion,
        pisos,
        cantidadDepartamentos,
        porteriaVigilancia,
        observaciones,
      } = req.body;

      if (tipoEdificacion && !TIPOS_EDIFICACION_LIST.includes(tipoEdificacion as TipoEdificacion)) {
        res.status(400).json({ error: 'Tipo de edificación inválido.' });
        return;
      }

      const updated = db.updateRecord(id, {
        territorio,
        manzana,
        calle,
        numeracion,
        calleNumeracion,
        tipoEdificacion: tipoEdificacion as TipoEdificacion,
        pisos,
        cantidadDepartamentos,
        porteriaVigilancia,
        observaciones,
      });

      if (!updated) {
        res.status(404).json({ error: 'Registro territorial no encontrado.' });
        return;
      }

      res.json({
        message: 'Registro modificado correctamente por Admin.',
        record: updated,
      });
    } catch (error) {
      console.error('Error in PUT /api/records/:id:', error);
      res.status(500).json({ error: 'Error actualizando registro territorial.' });
    }
  }
);

// Delete record (Only Admin can delete)
router.delete(
  '/:id',
  authenticateJWT,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { id } = req.params;
      const deleted = db.deleteRecord(id);

      if (!deleted) {
        res.status(404).json({ error: 'Registro territorial no encontrado para eliminar.' });
        return;
      }

      res.json({ message: 'Registro territorial eliminado correctamente.' });
    } catch (error) {
      console.error('Error in DELETE /api/records/:id:', error);
      res.status(500).json({ error: 'No se pudo eliminar el registro.' });
    }
  }
);

export default router;
