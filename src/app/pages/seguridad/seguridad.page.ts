import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import type {
  AbstractControl,
  ValidationErrors} from '@angular/forms';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import type {
  ViewWillEnter
} from '@ionic/angular';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword
} from 'firebase/auth';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  keyOutline,
  lockClosedOutline,
  logOutOutline,
  mailOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

import { firebaseAuth } from '../../services/firebase';

function noSoloEspacios(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '');
  if (valor.length > 0 && valor.trim().length === 0) {
    return { soloEspacios: true };
  }
  return null;
}

@Component({
  selector: 'app-seguridad',
  standalone: true,
  templateUrl: './seguridad.page.html',
  styleUrls: ['./seguridad.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonBadge,
    IonInput,
    IonButton,
    IonSpinner
  ]
})
export class SeguridadPage implements ViewWillEnter {
  private readonly router = inject(Router);

  readonly correoUsuario = signal('');
  readonly uidUsuario = signal('');
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  readonly formulario = new FormGroup({
    contrasenaActual: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, noSoloEspacios]
    }),
    nuevaContrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, noSoloEspacios, Validators.minLength(6)]
    }),
    confirmarContrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, noSoloEspacios]
    })
  });

  constructor() {
    addIcons({
      shieldCheckmarkOutline,
      mailOutline,
      keyOutline,
      lockClosedOutline,
      logOutOutline,
      alertCircleOutline,
      checkmarkCircleOutline
    });
  }

  ionViewWillEnter(): void {
    this.error.set('');
    this.exito.set('');
    this.formulario.reset();

    const usuario = firebaseAuth.currentUser;
    if (usuario) {
      this.correoUsuario.set(usuario.email ?? 'Sin correo registrado');
      this.uidUsuario.set(usuario.uid);
    } else {
      this.correoUsuario.set('Sin sesión activa');
      this.uidUsuario.set('');
    }
  }

  async actualizarContrasena(): Promise<void> {
    this.error.set('');
    this.exito.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa todos los campos. La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const { contrasenaActual, nuevaContrasena, confirmarContrasena } =
      this.formulario.getRawValue();

    if (nuevaContrasena !== confirmarContrasena) {
      this.error.set('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    const usuario = firebaseAuth.currentUser;
    if (!usuario || !usuario.email) {
      this.error.set('No hay una sesión activa válida para actualizar la contraseña.');
      return;
    }

    this.cargando.set(true);

    try {
      const credencial = EmailAuthProvider.credential(usuario.email, contrasenaActual);
      await reauthenticateWithCredential(usuario, credencial);
      await updatePassword(usuario, nuevaContrasena);

      this.formulario.reset();
      this.exito.set('Tu contraseña ha sido actualizada correctamente.');
    } catch (err: unknown) {
      const codigo = (err as { code?: string })?.code ?? '';
      if (codigo === 'auth/wrong-password' || codigo === 'auth/invalid-credential') {
        this.error.set('La contraseña actual es incorrecta.');
      } else if (codigo === 'auth/too-many-requests') {
        this.error.set('Demasiados intentos fallidos. Intenta de nuevo más tarde.');
      } else {
        this.error.set('No se pudo actualizar la contraseña. Verifica tus datos e intenta de nuevo.');
      }
    } finally {
      this.cargando.set(false);
    }
  }

  async cerrarSesion(): Promise<void> {
    await signOut(firebaseAuth);
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}