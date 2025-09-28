import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';


export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
const token = localStorage.getItem('token');

 // Opcional: limita el header a tu backend
  const isApiCall =
  req.url.startsWith(environment.api) ||
  req.url.includes('/upload') ||
  req.url.startsWith('/api');

  if (token && isApiCall) {
    console.log('Agregando token a request:', req.url);
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  // No setees Content-Type aquí; para FormData lo pone el browser.
  return next(req);
};

