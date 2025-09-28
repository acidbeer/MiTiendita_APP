import { CanActivateFn, Router } from '@angular/router';
export const authGuard: CanActivateFn = () => !!localStorage.getItem('token');