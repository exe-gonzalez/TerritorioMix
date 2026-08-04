import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.ts';
import { CONFIG } from '../config.ts';
import { sendPasswordResetEmail } from '../email.ts';
import { authenticateJWT, AuthenticatedRequest } from '../authMiddleware.ts';

const router = Router();

// Register new account
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Todos los campos (name, email, password) son obligatorios.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'Ya existe un usuario registrado con este correo electrónico.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = db.createUser({
      name,
      email,
      passwordHash,
      role: 'user', // default new registrations are user role
    });

    const token = jwt.sign({ userId: user.id }, CONFIG.jwtSecret, {
      expiresIn: CONFIG.jwtExpiresIn,
    });

    res.status(201).json({
      message: 'Usuario registrado con éxito.',
      token,
      user,
    });
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).json({ error: 'Error del servidor al registrar usuario.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Por favor ingresa usuario/correo y contraseña.' });
      return;
    }

    const userWithPass = db.getUserByEmail(email);
    if (!userWithPass || !userWithPass.active) {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos, o cuenta inactiva.' });
      return;
    }

    // Primer inicio de sesión: definir la contraseña si el usuario no la tiene configurada aún
    if (userWithPass.needsPasswordSetup || !userWithPass.passwordHash) {
      if (password.length < 4) {
        res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres.' });
        return;
      }
      const newHash = await bcrypt.hash(password, 10);
      db.resetUserPassword(userWithPass.id, newHash);
      userWithPass.passwordHash = newHash;
      userWithPass.needsPasswordSetup = false;
    } else {
      const validPassword = await bcrypt.compare(password, userWithPass.passwordHash);
      if (!validPassword) {
        res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
        return;
      }
    }

    const { passwordHash, resetToken, resetTokenExpiry, needsPasswordSetup, ...user } = userWithPass;

    const token = jwt.sign({ userId: user.id }, CONFIG.jwtSecret, {
      expiresIn: CONFIG.jwtExpiresIn,
    });

    res.json({
      token,
      user,
    });
  } catch (error) {
    console.error('Error in /login:', error);
    res.status(500).json({ error: 'Error interno en el inicio de sesión.' });
  }
});

// Current user profile
router.get('/me', authenticateJWT, (req: AuthenticatedRequest, res: Response): void => {
  res.json({ user: req.user });
});

// Request Password Reset (Forgot Password) - Exclusivo a gonzalez.exe@mendoza.edu.ar
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const targetEmail = 'gonzalez.exe@mendoza.edu.ar';
    const user = db.getUserByEmail(targetEmail) || db.getUserByEmail('administrador');
    if (!user) {
      res.status(404).json({ error: 'No se encontró la cuenta de usuario en la base de datos.' });
      return;
    }

    const resetToken = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const expiry = Date.now() + 3600000; // 1 hour

    db.setResetToken(user.email, resetToken, expiry);

    const emailResult = await sendPasswordResetEmail(targetEmail, resetToken);

    res.json({
      success: true,
      message: `Las instrucciones de recuperación de contraseña se han enviado a ${targetEmail}.`,
      demoMode: emailResult.demoMode,
      resetUrl: emailResult.demoMode ? emailResult.resetUrl : undefined,
    });
  } catch (error) {
    console.error('Error in /forgot-password:', error);
    res.status(500).json({ error: 'No se pudo procesar la solicitud de restablecimiento.' });
  }
});

// Reset Password with token
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'El token y la nueva contraseña son requeridos.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    const user = db.getUserByResetToken(token);
    if (!user) {
      res.status(400).json({ error: 'El enlace de restablecimiento es inválido o ha expirado.' });
      return;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    db.resetUserPassword(user.id, newPasswordHash);

    res.json({
      success: true,
      message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.',
    });
  } catch (error) {
    console.error('Error in /reset-password:', error);
    res.status(500).json({ error: 'Error en el servidor al restablecer contraseña.' });
  }
});

export default router;
