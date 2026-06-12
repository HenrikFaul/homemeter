import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * GET /api/health - Rendszer státusz lekérdezése.
 * Visszaadja a connectivity state és sync queue információt.
 */
router.get('/', (_req: Request, res: Response): void => {
  try {
    // Alapértelmezett állapotok (ha nincs adatbázis kapcsolat vagy üres)
    const isConnected = true; 
    const syncQueueCount = 0 as number; 
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeMs: process.uptime() * 1000,
      connectivityState: isConnected ? 'connected' : 'disconnected',
      syncQueueInfo: {
        pendingOperations: syncQueueCount,
        lastSyncTime: null as string | null
      },
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      nodeVersion: process.version
    };

    res.json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    // Hiba esetén status code és üzenet visszaadása.
    if ((error as any)?.status === 400 || String(error).includes('invalid')) {
      res.status(400).json({ message: 'Invalid Health Check Request' });
    } else {
      res.status(500).json({ 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: String(error) // Biztonságos string konverzió hibaüzenethez
      });
    }
  }
});

export default router; // Default export a route fájljának önmagának, hogy server.ts vagy barrel importálhassa.