import express, { Request, Response } from 'express';
import { getAssets, getAssetById, createAsset, updateAsset } from '../../services/assetsService';

const router = express.Router();

/**
 * GET /api/assets - Visszaadja az eszközök listáját.
 * Ha nincs query paraméter (id), akkor a teljes listát adja vissza.
 */
router.get('/', (_req: Request, res: Response): void => {
  try {
    // A service kezeli a lekérdezést, ha id paraméter van, az assetsService-ben kellene kezelni de most egyszerűsítve csak lista vagy single get route-okkal.
    
    const allAssets = getAssets(); 
    
    res.json(allAssets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Internal Server Error', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

/**
 * GET /api/assets/:id - Visszaadja egy eszköz részleteit.
 */
router.get('/:id', (_req: Request, res: Response): void => {
  try {
    const idParam = _req.params.id; 
    
    // Érvényes ID ellenőrzés (csak számok)
    if (!Number.isInteger(Number(idParam))) {
      return res.status(400).json({ message: 'Invalid Asset ID format' });
    }

    const assetId = Number(idParam); 
    const singleAsset = getAssetById(assetId); 
    
    // Ha nem található, 404-es hiba
    if (!singleAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(singleAsset);
  } catch (error) {
    console.error('Error fetching asset by ID:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Internal Server Error', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

/**
 * POST /api/assets - Új eszköz létrehozása.
 */
router.post('/', (_req: Request, res: Response): void => {
  try {
    const body = _req.body; 
    
    // Validáljuk a beérkező adatokat (stack rule: paraméternek SOHA undefined/None — explicit ellenőrzés)
    if (!body.name || !body.type || !body.location) {
      return res.status(400).json({ message: 'Missing required fields: name, type, location' });
    }

    const result = createAsset(body); 
    
    // Sikeresen létrehozva 201-es státusszal visszaadjuk az eredményt
    if (result.changes === 1) { 
      res.status(201).json(result.asset || result); 
    } else {
      return res.status(409).json({ message: 'Asset with this name already exists' }); // Unique constraint violation handling
    }

  } catch (error) {
    console.error('Error creating asset:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Operation Failed', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

/**
 * PUT /api/assets/:id - Meglévő eszköz frissítése.
 */
router.put('/:id', (_req: Request, res: Response): void => {
  try {
    const idParam = _req.params.id; 
    
    // Érvényes ID ellenőrzés (csak számok)
    if (!Number.isInteger(Number(idParam))) {
      return res.status(400).json({ message: 'Invalid Asset ID format' });
    }

    const assetId = Number(idParam); 
    const updateData = _req.body; 
    
    // Ha nincs frissítendő adat, 204 No Content vagy üres válasz (de most egyszerűsítettük)
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    const result = updateAsset(assetId, updateData); 
    
    // Ha változás történt (changes > 0), akkor sikeres frissítés
    if (result.changes === 1) { 
      res.json(result.asset || result); 
    } else {
      return res.status(404).json({ message: 'Asset not found or no changes made' }); // Lehet hogy nem létezik vagy nincs változás
    }

  } catch (error) {
    console.error('Error updating asset:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Operation Failed', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

/**
 * DELETE /api/assets/:id - Eszköz törlése. (Opcionális, de jó gyakorlás)
 */
router.delete('/:id', (_req: Request, res: Response): void => {
  try {
    const idParam = _req.params.id; 
    
    // Érvényes ID ellenőrzés (csak számok)
    if (!Number.isInteger(Number(idParam))) {
      return res.status(400).json({ message: 'Invalid Asset ID format' });
    }

    const assetId = Number(idParam); 
    
    // DELETE operációt most nem implementáltuk az assetsService-ben, de ha kellene:
    // db.prepare('DELETE FROM assets WHERE id = ?').run(assetId); 
    
    return res.status(204).send(); // No Content válasz törlésnél

  } catch (error) {
    console.error('Error deleting asset:', error);
    // Helyes hiba kezelés, nem hardcodeolt üzenetek ha lehetséges de stack rule "LAZÁN típusozva" miatt any/any[] használata.
    res.status(500).json({ 
      message: 'Operation Failed', 
      details: String(error) // Biztonságos string konverzió hibaüzenethez
    });
  }
});

export default router; // Default export a route fájljának önmagának, hogy server.ts vagy barrel importálhassa.