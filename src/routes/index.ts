import { assetsRoutes } from './api/assetsRoute';
import { workOrdersRoutes } from './api/workOrdersRoute';
import { partsRoutes } from './api/partsRoute';
import { healthRouteHandler } from './api/healthRoute';

export const routes = {
  assets: assetsRoutes,
  workOrders: workOrdersRoutes,
  spareParts: partsRoutes,
  health: healthRouteHandler
};

// Barrel export for clean separation of concerns
export * from './api/assetsRoute';
export * from './api/workOrdersRoute';
export * from './api/partsRoute';
export * from './api/healthRoute';