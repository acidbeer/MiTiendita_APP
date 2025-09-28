import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required]],
    isAdmin: [false],
    adminCode: ['']                    // validator se agrega/quita dinámicamente
  }, { validators: this.passwordsIguales });

  showPwd = false;
  showCnf = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private loading: LoadingController,
    private toast: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Validación condicional: adminCode es requerido solo si isAdmin = true
    this.form.get('isAdmin')!.valueChanges.subscribe(isAdmin => {
      const codeCtrl = this.form.get('adminCode')!;
      if (isAdmin) {
        codeCtrl.addValidators([Validators.required]);
      } else {
        codeCtrl.clearValidators();
        codeCtrl.reset();
      }
      codeCtrl.updateValueAndValidity();
    });
  }

  private passwordsIguales(group: AbstractControl) {
    const p = group.get('password')?.value;
    const c = group.get('confirm')?.value;
    return p === c ? null : { notMatch: true };
  }

  get f() { return this.form.controls; }

  async submit() {
    if (this.form.invalid) return;

    const loader = await this.loading.create({ message: 'Creando cuenta...' });
    await loader.present();

    const { name, email, password, isAdmin, adminCode } = this.form.value;

    const req$ = isAdmin
      ? this.auth.registerAdmin(name!.trim(), email!.trim(), password!, (adminCode ?? '').trim())
      : this.auth.register(name!.trim(), email!.trim(), password!);

    req$.subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({
          message: 'Cuenta creada. Ahora inicia sesión.',
          duration: 1500, color: 'success'
        })).present();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: async (err) => {
        await loader.dismiss();
        const msg = err?.error?.message ?? 'No se pudo registrar';
        (await this.toast.create({ message: msg, duration: 2000, color: 'danger' })).present();
      }
    });
  }
}
