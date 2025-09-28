import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-product-detail',
  imports: [IonicModule, CommonModule],
  templateUrl: './product-detail.page.html',
})
export class ProductDetailPage implements OnInit {
  product?: Product;

  constructor(
    private route: ActivatedRoute,
    private ps: ProductService,
    private cart: CartService,
    private toast: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.ps.one(id).subscribe(p => this.product = p);
    }
  }

  // Normaliza URL de imagen
  imageSrc(p: Product): string {
    const u = p.imageUrl || '';
    if (!u) return 'assets/placeholder.svg';
    if (u.startsWith('http')) return u;
    if (u.startsWith('/uploads')) return environment.api + u;
    return `${environment.api}/uploads/${u}`;
  }

  async addToCart(p: Product) {
    this.cart.add(p);
    (await this.toast.create({ message: 'Agregado al carrito', duration: 1200, color: 'success' })).present();
    this.router.navigateByUrl('/cart');  // <<--- lleva a carrito
  }

  buyNow(p: Product) {
    this.cart.clear?.();   // opcional: limpiar carrito
    this.cart.add(p,1);
    this.router.navigateByUrl('/checkout'); // <<--- lleva a compra directa
  }
}
