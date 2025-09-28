import { Injectable } from "@angular/core";
import { Product } from "../models/product.model";

@Injectable({ providedIn: 'root' })
export class CartService {
  private key = 'cart';

  get() {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }

  add(product: Product, qty = 1) {
    const c = this.get();
    const f = c.find((x: any) => x.product.id === product.id);
    if (f) {
      f.quantity += qty;
    } else {
      c.push({ product, quantity: qty });
    }
    localStorage.setItem(this.key, JSON.stringify(c));
  }

  updateQuantity(product: Product, qty: number) {
  const c = this.get();
  const f = c.find((x: any) => x.product.id === product.id);
  if (f) {
    f.quantity = qty;
    if (f.quantity < 1) {
      if (product.id != null) {          //  validación
        this.remove(product.id);
      }
      return;
    }
    localStorage.setItem(this.key, JSON.stringify(c));
  }
}

  remove(id: number) {
    const c = this.get().filter((x: any) => x.product.id !== id);
    localStorage.setItem(this.key, JSON.stringify(c));
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  //  aumentar cantidad
  increase(id: number) {
    const c = this.get();
    const f = c.find((x: any) => x.product.id === id);
    if (f) {
      f.quantity++;
      localStorage.setItem(this.key, JSON.stringify(c));
    }
  }

  //  disminuir cantidad
  decrease(id: number) {
    const c = this.get();
    const f = c.find((x: any) => x.product.id === id);
    if (f) {
      f.quantity--;
      if (f.quantity <= 0) {
        this.remove(id); // si llega a 0, lo eliminamos
      } else {
        localStorage.setItem(this.key, JSON.stringify(c));
      }
    }
  }
}
