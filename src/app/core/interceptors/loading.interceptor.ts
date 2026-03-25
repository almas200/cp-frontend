import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import * as NProgress from 'nprogress';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  NProgress.start();

  return next(req).pipe(
    finalize(() => {
      NProgress.done();
    })
  );
};
