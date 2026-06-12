import express from 'express';
const assetsRouter = require('./routes/api/assetsRoute').default; // feltételezem hogy van default export
const healthRouter = require('./routes/api/healthRoute').default; // van explicit `export default router`
const partsRouter = require('./routes/api/partsRoute').default; // van explicit `export default router`

// workOrders route hiányzik - nem mountolom most, később jön létre (zero regression rule)

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/api/assets', assetsRouter);
app.use('/api/health', healthRouter);
app.use('/api/spare_parts', partsRouter);

// workOrders endpoint hiányzik - később jön létre (zero regression rule miatt nem módosítom más fájlokat)
// app.use('/api/work_orders', require('./routes/api/workOrdersRoute').default); // HIÁNYZIK A FÁJL, NEM MOUNTOLOM

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});