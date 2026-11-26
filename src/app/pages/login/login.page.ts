import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonText
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  logoApple,
  logoGoogle,
  mailOutline,
  pawOutline
} from 'ionicons/icons';
import { finalize } from 'rxjs';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardContent,
    IonText,
    IonIcon,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  mostrarPassword = signal(false);
  loading = signal(false);
  error = signal('');
  mensaje = signal('');

  formulario = new FormGroup({
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  constructor() {
    addIcons({
      pawOutline,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      logoGoogle,
      logoApple
    });
  }

  cambiarVisibilidad(): void {
    this.mostrarPassword.update(valor => !valor);
  }

  iniciarSesion(): void {
    this.error.set('');
    this.mensaje.set('');

    if (this.loading()) return;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Introduce un correo electrónico válido y una contraseña.');
      return;
    }

    const { correo, password } = this.formulario.getRawValue();
    this.loading.set(true);

    this.auth.login(correo, password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/inicio', { replaceUrl: true });
        },
        error: (err: unknown) => {
          const codigo = (err as { code?: string }).code;
          switch (codigo) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
              this.error.set('Correo electrónico o contraseña incorrectos.');
              break;
            case 'auth/invalid-email':
              this.error.set('El correo electrónico no es válido.');
              break;
            case 'auth/too-many-requests':
              this.error.set('Demasiados intentos. Inténtalo más tarde.');
              break;
            case 'auth/network-request-failed':
              this.error.set('Comprueba tu conexión a Internet.');
              break;
            default:
              this.error.set('No se pudo iniciar sesión. Inténtalo nuevamente.');
          }
        }
      });
  }

  recuperarPassword(): void {
    this.error.set('');
    this.mensaje.set('');

    const correo = this.formulario.controls.correo.value;
    if (!correo || this.formulario.controls.correo.invalid) {
      this.error.set('Introduce un correo electrónico válido para recuperar tu contraseña.');
      return;
    }

    if (this.loading()) return;
    this.loading.set(true);

    this.auth.recuperarPassword(correo)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.mensaje.set('Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.');
        },
        error: () => {
          this.error.set('No se pudo enviar el correo de recuperación.');
        }
      });
  }

  loginGoogle(): void {
    this.error.set('El acceso con Google aún no está configurado.');
  }

  loginApple(): void {
    this.error.set('El acceso con Apple aún no está configurado.');
  }
}