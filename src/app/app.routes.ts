import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { adminGuard } from './services/admin.guard';

export const routes: Routes = [

   // Arranque: redirige a start
  { path: '', redirectTo: 'start', pathMatch: 'full' },

  // Página de inicio
  { path: 'start', loadComponent: () => import('./pages/start/start.page').then(m => m.StartPage) },

  // Auth
  { path: 'login',    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },

  // Productos
  { path: 'products',    loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage) },
  { path: 'product/:id', loadComponent: () => import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage) },

  // Carrito/checkout (protegidos)
  { path: 'cart',     loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage), canActivate: [authGuard] },
  

  // Admin (protegido)
  { path: 'admin', loadComponent: () => import('./pages/admin-products/admin-products.page').then(m => m.AdminProductsPage),canActivate: [adminGuard] },

  { path: 'admin/edit/:id',  loadComponent: () => import('./pages/admin-products/admin-products.page').then(m => m.AdminProductsPage), canActivate: [adminGuard] },

  // Wildcard al final
  { path: '**', redirectTo: 'start' }
];
