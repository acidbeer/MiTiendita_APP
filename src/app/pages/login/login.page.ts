import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './login.page.html'
})
export class LoginPage {
  email=''; password='';

  constructor(private auth:AuthService, private router:Router){}
  login(){
    this.auth.login(this.email, this.password).subscribe(tr => {
      this.auth.saveSession(tr);
      this.router.navigateByUrl('/products');
    });
  }
 
   google() {
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      console.error('Google Identity Services no está cargado');
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: async (resp: any) => {
        try {
          await this.auth.loginWithGoogle(resp.credential);
          this.router.navigateByUrl('/products');
        } catch (err) {
          console.error('Error en login con Google', err);
        }
      },
    });

    // abre popup One Tap
    google.accounts.id.prompt();
  }
  
}
