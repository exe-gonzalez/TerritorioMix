import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { authenticateJWT, AuthenticatedRequest, requireAdmin } from '../authMiddleware';
import { Role } from '../../src/types';

const router = Router();

// Every route in adminRoutes requires JWT + Admin role
router.use(authenticateJWT, requireAdmin);

// Dashboard stats
router.get('/stats', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Error obteniendo estadísticas del panel.' });
  }
});

// List all users
router.get('/users', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const users = db.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Error al consultar lista de usuarios.' });
  }
});

// Admin creates user
router.post('/users', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Los campos name, email y password son requeridos.' });
      return;
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'Ya existe una cuenta con este correo electrónico.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const validRole: Role = role === 'admin' ? 'admin' : 'user';

    const newUser = db.createUser({
      name,
      email,
      passwordHash,
      role: validRole,
    });

    res.status(201).json({
      message: 'Usuario creado con éxito por administrador.',
      user: newUser,
    });
  } catch (err) {
    console.error('Error creating user by admin:', err);
    res.status(500).json({ error: 'No se pudo crear el usuario.' });
  }
});

// Update user role or status
router.put('/users/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { role, active } = req.body;

    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({ error: 'El rol debe ser "user" o "admin".' });
      return;
    }

    const updated = db.updateUserRole(id, role as Role, active);
    if (!updated) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    res.json({
      message: 'Rol y estado de usuario actualizados correctamente.',
      user: updated,
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Error actualizando usuario.' });
  }
});

// Delete user
router.delete('/users/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de administrador activo.' });
      return;
    }

    const deleted = db.deleteUser(id);
    if (!deleted) {
      res.status(404).json({ error: 'Usuario no encontrado para eliminar.' });
      return;
    }

    res.json({ message: 'Usuario eliminado exitosamente.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
});

// Backup database
router.get('/backup', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const backup = db.exportBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="territorio_mix_backup_${new Date().toISOString().slice(0, 10)}.json"`
    );
    res.json(backup);
  } catch (err) {
    console.error('Error exporting backup:', err);
    res.status(500).json({ error: 'Error al generar la copia de seguridad.' });
  }
});

// Restore database
router.post('/restore', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const backup = req.body;
    if (!backup || !backup.records || !backup.users) {
      res.status(400).json({
        error: 'El archivo de copia de seguridad no tiene la estructura válida (debe incluir records y users).',
      });
      return;
    }

    const result = db.restoreBackup(backup);
    res.json(result);
  } catch (err: any) {
    console.error('Error restoring backup:', err);
    res.status(500).json({ error: err?.message || 'Error al restaurar la base de datos.' });
  }
});

export default router;
