import { HttpInterceptorFn } from '@angular/common/http';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantId = localStorage.getItem('tenant-id') || '';
  console.log(`Tenant ID from localStorage: ${tenantId}`);
  
  const modifiedReq = req.clone({
    setHeaders: {
      'X-Tenant-ID': tenantId
    }
  });

  // return toObservable(tenantStore.tenantName).pipe(
  //   take(1), (snapshot)
  //   map((tenantId) => {
  //     const safeTenantId = tenantId || '';
  //     console.log(`Tenant ID from Store: ${safeTenantId}`);
  //     return req.clone({
  //       setHeaders: {
  //         'X-Tenant-ID': safeTenantId
  //       }
  //     });
  //   }),
  //   switchMap((modifiedReq) => next(modifiedReq))
  // );
  return next(modifiedReq);
};
