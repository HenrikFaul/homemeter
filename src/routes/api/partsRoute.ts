import express, { Request, Response } from 'express';
// Importáljuk a parts service függvényeit (NEK NINCS DEFAULT EXPORTJA)
import { getPartsList, logStockMovement } from '../../services/partsService'; 

const router = express.Router();

/**
 * GET /api/spare_parts - Visszaadja az alkatrész listát.
 * Ha nincs query paraméter (status/location), akkor a teljes listát adja vissza.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // A service kezeli a szűrés logikáját ha paraméterek érkeznek, 
    // vagy alapértelmezetten az összeset visszaadva (stack rule: "param nélkül a TELJES listát add vissza").
    
    const partsData = getPartsList(); 
    
    res.json(partsData);
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Internal Server Error', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

/**
 * POST /api/spare_parts - Új alkatrész létrehozása vagy készletmozgás rögzítése.
 */
router.post('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // A service elvégzi a validálást és az adatbázis műveleteket (.run/.get/.all) szinkron módon vagy wrapperrel.
    
    const result = logStockMovement(_req.body); 
    
    res.status(201).json(result as any); 
  } catch (error) {
    console.error('Error processing spare part/movement:', error);
    // Hiba esetén status code és üzenet visszaadása.
    if ((error as any)?.status === 400 || String(error).includes('invalid')) {
      res.status(400).json({ message: 'Invalid Input Data' });
    } else {
      res.status(500).json({ 
        message: 'Operation Failed', 
        details: String(error) 
      });
    }
  }
});

export default router; // Default export a route fájljának önmagának, hogy server.ts vagy barrel importálhassa.
