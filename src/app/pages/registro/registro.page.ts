import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonIcon, IonHeader, IonToolbar, IonItem, IonButtons, IonBackButton } from '@ionic/angular';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  callOutline,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

import { firebaseAuth, db } from '../../services/firebase';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [IonBackButton, IonButtons, IonItem, IonToolbar, IonHeader, 
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonIcon
  ],
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss']
})
export class RegistroPage {

  private router = inject(Router);

  cargando = signal(false);
  error = signal('');
  mostrarPassword = signal(false);
  mostrarConfirmacion = signal(false);

  formulario = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    apellidos: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    }),
    telefono: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(6)
      ]
    }),
    confirmarPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  // Registra los íconos de Ionic utilizados en los campos del formulario
  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      callOutline,
      eyeOutline,
      eyeOffOutline
    });
  }

  // Revisa campo por campo para devolver el mensaje exacto del dato que falta o está mal escrito
  obtenerMensajeErrorCampos(): string {
    const controles = this.formulario.controls;

    if (controles.nombre.errors?.['required']) {
      return 'Este campo es obligatorio';
    }

    if (controles.apellidos.errors?.['required']) {
      return 'Este campo es obligatorio';
    }

    if (controles.correo.errors?.['required']) {
      return 'Este campo es obligatorio';
    }
    if (controles.correo.errors?.['email']) {
      return 'El formato del correo electrónico no es válido.';
    }

    if (controles.password.errors?.['required']) {
      return 'Este campo es obligatorio';
    }
    if (controles.password.errors?.['minlength']) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    if (controles.confirmarPassword.errors?.['required']) {
      return 'Este campo es obligatorio';
    }

    if (controles.telefono.errors?.['required']) {
      return 'Este campo es obligatorio';
    }
    if (controles.telefono.errors?.['pattern']) {
      return 'El teléfono debe contener exactamente 10 dígitos numéricos.';
    }

    return 'Revisa que todos los campos estén llenos correctamente.';
  }

  // Valida los datos, crea la cuenta en Firebase Auth, guarda el perfil en Firestore y redirige
  async registrar(): Promise<void> {
    this.error.set('');

    // Marca los controles para que aparezcan las letras chiquitas debajo de cada campo
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();

    // Verifica que ambas contraseñas sean idénticas antes de enviar a Firebase
    if (datos.password !== datos.confirmarPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.cargando.set(true);

    try {
      const credencial = await createUserWithEmailAndPassword(
        firebaseAuth,
        datos.correo.trim(),
        datos.password
      );

      const usuario = credencial.user;

      await updateProfile(usuario, {
        displayName: `${datos.nombre} ${datos.apellidos}`
      });

      await setDoc(doc(db, 'usuarios', usuario.uid), {
        uid: usuario.uid,
        nombre: datos.nombre.trim(),
        apellidos: datos.apellidos.trim(),
        correo: usuario.email,
        telefono: datos.telefono.trim(),
        fechaRegistro: serverTimestamp()
      });

      this.formulario.reset();
      await this.router.navigate(['/direccion']);

    } catch (error: any) {
      console.error('Error al registrar:', error);

      switch (error.code) {
        case 'auth/email-already-in-use':
          this.error.set('Este correo ya está registrado.');
          break;

        case 'auth/invalid-email':
          this.error.set('El correo electrónico no es válido.');
          break;

        case 'auth/weak-password':
          this.error.set('La contraseña debe tener al menos 6 caracteres');
          break;

        case 'permission-denied':
          this.error.set('Firestore no permite guardar los datos. Revisa las reglas.');
          break;

        default:
          this.error.set('No se pudo completar el registro. Inténtalo nuevamente.');
      }

    } finally {
      this.cargando.set(false);
    }
  }
}