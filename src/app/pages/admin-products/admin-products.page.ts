import { Component, OnInit } from '@angular/core';
import {
  IonicModule,
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-admin-products',
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './admin-products.page.html',
})
export class AdminProductsPage implements OnInit {
  // Form NO-NULLABLE
  form = this.fb.nonNullable.group({
    title:       this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    description: this.fb.nonNullable.control(''),
    price:       this.fb.nonNullable.control(0, { validators: [Validators.required, Validators.min(0)] }),
    imageUrl:    this.fb.nonNullable.control(''),
  });

  preview?: string;
  editing = false;
  private fileToUpload?: File | null;  // archivo elegido (si hay)
  productId?: number;

  constructor(
    private fb: FormBuilder,
    private ps: ProductService,
    private toast: ToastController,
    private loading: LoadingController,
    private alert: AlertController,
    public  auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.editing = true;
      this.productId = id;

      this.ps.one(id).subscribe(p => {
        this.form.setValue({
          title: p.title,
          description: p.description ?? '',
          price: p.price,
          imageUrl: p.imageUrl ?? '',
        });
        this.preview = this.absUrl(p.imageUrl ?? '');
      });
    }
  }

  ngOnDestroy(): void {
    // libera blob URL si se generó
    if (this.preview?.startsWith('blob:')) URL.revokeObjectURL(this.preview);
  }


  // Normaliza a URL absoluta para que no intente cargar desde 8100
  private absUrl(u: string): string {
    if (!u) return '';
    if (u.startsWith('http')) return u;
    if (u.startsWith('/uploads')) return environment.api + u;
    return `${environment.api}/uploads/${u}`;
  }

  onImageUrlBlur() {
    if (this.fileToUpload) return; // si hay archivo, mantenemos su preview
    this.preview = this.absUrl(this.form.controls.imageUrl.value);
  }

   /** Usuario eligió un archivo */
  onFileChange(ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0] ?? null;
    this.fileToUpload = f;

    // Previsualiza el archivo local con blob URL (sin subir aún)
    if (f) {
      // limpia blob previo si había
      if (this.preview?.startsWith('blob:')) URL.revokeObjectURL(this.preview);
      this.preview = URL.createObjectURL(f);
    } else {
      // si quitó el archivo, vuelve a usar lo que haya en imageUrl
      this.preview = this.absUrl(this.form.controls.imageUrl.value);
    }
  } 

   /** Para bloquear el botón mientras se guarda */
  isSaving = false;

  /** Fallback de imagen si falla la carga */
  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (!img.src.includes('assets/placeholder')) {
      img.src = 'assets/placeholder.svg';   // asegúrate de tener este archivo en src/assets/
    }
  }

  async save() {
    if (this.form.invalid) return;

    this.isSaving = true;              // <<---
    const loader = await this.loading.create({
      message: this.editing ? 'Actualizando...' : 'Creando producto...',
    });
    await loader.present();

    try {
      const payload = this.form.getRawValue();
      payload.price = Number(payload.price);

      if (this.fileToUpload) {
        console.log('Subiendo imagen con token:', localStorage.getItem('token'));
        const { url } = await firstValueFrom(this.ps.upload(this.fileToUpload));
        payload.imageUrl = url;
        this.preview = this.absUrl(url);
      }

      const req$ = (this.editing && this.productId)
        ? this.ps.update(this.productId, payload)
        : this.ps.create(payload);

      await firstValueFrom(req$);

      (await this.toast.create({
        message: this.editing ? 'Producto actualizado' : 'Producto creado',
        duration: 1200, color: 'success'
      })).present();

      this.fileToUpload = null;
      this.router.navigateByUrl('/products', { replaceUrl: true });

    } catch (err: any) {
      const msg =
        err?.status === 401 ? 'No autenticado' :
        err?.status === 403 ? 'Requiere rol ADMIN' :
        err?.error?.message ?? 'Operación fallida';
      (await this.toast.create({ message: msg, duration: 1500, color: 'danger' })).present();
    } finally {
      this.isSaving = false;      
      await loader.dismiss();
    }
  }

  async confirmDelete() {
    if (!this.editing || !this.productId) return;

    const a = await this.alert.create({
      header: 'Eliminar',
      message: '¿Eliminar este producto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.remove() },
      ],
    });
    await a.present();
  }

  private async remove() {
    if (!this.productId) return;
    const loader = await this.loading.create({ message: 'Eliminando...' });
    await loader.present();

    this.ps.remove(this.productId).subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({ message: 'Producto eliminado', duration: 1200, color: 'success' })).present();
        this.router.navigateByUrl('/products', { replaceUrl: true });
      },
      error: async () => {
        await loader.dismiss();
        (await this.toast.create({ message: 'No se pudo eliminar', duration: 1500, color: 'danger' })).present();
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
