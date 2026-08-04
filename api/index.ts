import express from 'express';
import authRoutes from '../server/routes/authRoutes';
import recordsRoutes from '../server/routes/recordsRoutes';
import adminRoutes from '../server/routes/adminRoutes';

const app = express();

app.disable('x-powered-by');

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Middleware to safely handle body if passed as string by serverless environments
app.use((req, _res, next) => {
  if (typeof req.body === 'string' && req.body.trim().length > 0) {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // Ignore parse error
    }
  }
  next();
});

// Standard express body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Support all possible mount paths for Vercel Serverless Function rewrites
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/records', recordsRoutes);
app.use('/records', recordsRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.get(['/api/health', '/health', '/api'], (_req, res) => {
  res.json({ status: 'ok', service: 'TerritorioMix API', time: new Date().toISOString() });
});

// Fallback 404 handler for unknown API endpoints
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada.' });
});

// Global error handling middleware for Vercel Serverless Function
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Vercel API Serverless Error:', err);
  res.status(500).json({ error: err?.message || 'Error interno del servidor.' });
});

export default app;
