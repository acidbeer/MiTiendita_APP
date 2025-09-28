import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // Si ya hay sesión, entra directo
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/products', { replaceUrl: true });
    }
  }
}
