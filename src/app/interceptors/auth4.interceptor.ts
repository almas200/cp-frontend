import { HttpInterceptorFn } from '@angular/common/http';

export const auth4Interceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('cp_token');

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
