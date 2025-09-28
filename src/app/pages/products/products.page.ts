import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { Router, RouterLink } from '@angular/router';  
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
  templateUrl: './products.page.html'
})
export class ProductsPage {
  products: Product[] = [];

  constructor(
    private ps: ProductService, 
    private cart: CartService,
    private router: Router,
    public auth: AuthService,
    private alert: AlertController,
    private toast: ToastController,
  ) {}


  ionViewWillEnter(){ 
    this.ps.list().subscribe(r => this.products = r);
   }

  add(p: Product){ 
    this.cart.add(p);
     this.router.navigate(['/cart']);
   }

   // ---- trackBy para el *ngFor
  trackById(index: number, p: Product) {
    return p.id ?? index;   // evita re-render y no falla si id es undefined
  }

  edit(p: Product) {
  const id = p.id;
  if (id == null) return;                  // protege si no hay id
  this.router.navigate(['/admin/edit', id]);
  }

  async confirmDelete(p: Product) {
  const id = p.id;
  if (id == null) return;

  const a = await this.alert.create({
    header: 'Eliminar',
    subHeader: p.title,                         // resalta el nombre
    message: 'Esta acción no se puede deshacer.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Eliminar', role: 'destructive', handler: () => this.del(id) } // <-- pasa el número
    ]
  });
  await a.present();
  }

 private del(id: number) {
  this.ps.remove(id).subscribe({
    next: async () => {
      this.products = this.products.filter(x => x.id !== id);
      (await this.toast.create({ message: 'Producto eliminado', duration: 1200, color: 'success' })).present();
    },
    error: async () => {
      (await this.toast.create({ message: 'No se pudo eliminar', duration: 1500, color: 'danger' })).present();
    }
  });
  }

  logout(){
    this.auth.logout();              // limpia token/roles/name
    this.cart.clear?.();             // opcional: limpia carrito si existe
    this.router.navigateByUrl('/start', { replaceUrl: true });
  }

  // --- Helpers para armar la URL correcta de la imagen ---
  imageSrc(p: Product): string {
    const u = p.imageUrl || '';
    if (!u) return 'assets/placeholder.png';
    if (u.startsWith('http')) return u;                          // ya es absoluta
    if (u.startsWith('/uploads')) return environment.api + u;    // /uploads/...
    return `${environment.api}/uploads/${u}`;                    // nombre de archivo
  }

  

  onImgError(ev: Event){
    const img = ev.target as HTMLImageElement;
    img.onerror = null;                  // evita loop infinito
    img.src = 'assets/placeholder.svg';  // fallback local
  }

}


