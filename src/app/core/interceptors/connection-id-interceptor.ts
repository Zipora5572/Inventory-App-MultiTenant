import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { InventoryHub } from '../../services/inventory-hub';

export const connectionIdInterceptor: HttpInterceptorFn = (req, next) => {
  const hub = inject(InventoryHub);
  const connectionId = hub.getConnectionId();

  if (connectionId) {
    req = req.clone({
      setHeaders: {
        'X-Connection-Id': connectionId
      }
    });
  }

  return next(req);
};