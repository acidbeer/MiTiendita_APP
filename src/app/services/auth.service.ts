import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface TokenResponse { token: string; name: string; roles: string[] }

@Injectable({ providedIn: 'root' })
export class AuthService {
  userName?: string;
  roles: string[] = [];
  private _authState = new BehaviorSubject<boolean>(this.isLoggedIn());
  authState$ = this._authState.asObservable();

  constructor(private http: HttpClient) {
    this.loadSession(); // restaura roles/name al refrescar
  }

  /** Accesor rápido al token (lo usa el interceptor/guards si quieres) */
  get token(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const t = this.token;
    if (!t) return false;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      const expMs = (payload.exp ?? 0) * 1000;
      return Date.now() < expMs;
    } catch {
      return false;
    }
  }

  /** Ajusta el tipo si tu backend NO devuelve token en register */
  register(name: string, email: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${environment.api}/auth/register`, { name, email, password });
  }

  registerAdmin(name: string, email: string, password: string, adminCode: string) {
  return this.http.post<TokenResponse>(`${environment.api}/auth/register-admin`, {
    name, email, password, adminCode
  });
  }

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${environment.api}/auth/login`, { email, password });
  }

  saveSession(tr: TokenResponse) {
    localStorage.setItem('token', tr.token);
    localStorage.setItem('roles', JSON.stringify(tr.roles || []));
    localStorage.setItem('name', tr.name || '');
    this.userName = tr.name;
    this.roles = tr.roles || [];
    this._authState.next(true); 
  }

  loadSession() {
    this.roles = JSON.parse(localStorage.getItem('roles') || '[]');
    this.userName = localStorage.getItem('name') || undefined;
  }

  isAdmin(): boolean {
    if (!this.roles.length) this.loadSession();
    return this.roles.includes('ADMIN');
  }

  logout() {
    localStorage.clear();
    this.userName = undefined;
    this.roles = [];
    this._authState.next(false);  
  }
   
  async loginWithGoogle(idToken: string): Promise<void> {
    const tr = await firstValueFrom(
      this.http.post<TokenResponse>(`${environment.api}/auth/google`, { idToken })
    );
    this.saveSession(tr);
  }
}
