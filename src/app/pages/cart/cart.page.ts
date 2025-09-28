import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // <-- necesario para [(ngModel)]
import { CartService } from '../../services/cart.service';
import { Router} from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './cart.page.html'
})
export class CartPage {
  items: any[] = [];
  total = 0;
  showForm = false;

  checkoutData = {
    name: '',
    cedula: '',
    address: ''
  };

  constructor(
    private cart: CartService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.refresh();
  }

  goToProducts(){ this.router.navigateByUrl('/products'); }
  
  refresh() {
    this.items = this.cart.get();
    this.total = this.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  }

  remove(id: number) {
    this.cart.remove(id);
    this.refresh();
  }

  updateQuantity(item: any, qty: number) {
    if (qty < 1) {
      this.remove(item.product.id);
    } else {
      this.cart.updateQuantity(item.product, qty);
      this.refresh();
    }
  }

  async getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.checkoutData.address = `Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`;
      });
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Geolocalización no soportada',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  async confirmPurchase() {
  // Aquí enviarías checkoutData + items al backend
  const order = {
    ...this.checkoutData,
    items: this.items,
    total: this.total
  };

  console.log('Orden enviada:', order); // simula el envío

  const toast = await this.toastCtrl.create({
    message: `Compra confirmada: ${this.items.length} productos, Total $${this.total}`,
    duration: 3000,
    color: 'success'
  });
  toast.present();

  this.cart.clear();
  this.showForm = false;
  this.refresh();
  this.router.navigateByUrl('/products'); // solo aquí rediriges
 }
  
 async checkout() {
  // Cambiamos el comportamiento: solo mostramos el formulario
  this.showForm = true;

  // Opcional: aviso al usuario que debe completar sus datos
  const toast = await this.toastCtrl.create({
    message: 'Completa tus datos para finalizar la compra',
    duration: 2000,
    color: 'primary'
  });
  toast.present();
  }
}
