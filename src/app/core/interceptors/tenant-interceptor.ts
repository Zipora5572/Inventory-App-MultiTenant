import { HttpInterceptorFn } from '@angular/common/http';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantId = localStorage.getItem('tenant-id') || '';
  console.log(`Tenant ID from localStorage: ${tenantId}`);
  
  const modifiedReq = req.clone({
    setHeaders: {
      'X-Tenant-ID': tenantId
    }
  });


  return next(modifiedReq);
};
