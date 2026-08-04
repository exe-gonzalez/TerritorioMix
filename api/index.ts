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

// Body parser middleware that respects pre-parsed body from serverless environment
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, (err) => {
    if (err) {
      express.urlencoded({ extended: true })(req, res, next);
    } else {
      express.urlencoded({ extended: true })(req, res, next);
    }
  });
});

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
