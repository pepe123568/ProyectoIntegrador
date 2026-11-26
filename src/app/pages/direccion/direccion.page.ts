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
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonInput,
  IonText,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonSpinner
} from '@ionic/angular';
import {
  doc,
  updateDoc
} from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  mapOutline,
  navigateOutline,
  homeOutline,
  businessOutline,
  alertCircleOutline
} from 'ionicons/icons';

import { firebaseAuth, db } from '../../services/firebase';

@Component({
  selector: 'app-direccion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonInput,
    IonText,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonSpinner
  ],
  templateUrl: './direccion.page.html',
  styleUrls: ['./direccion.page.scss']
})
export class DireccionPage {

  private router = inject(Router);

  cargando = signal(false);
  error = signal('');

  formulario = new FormGroup({
    codigoPostal: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[0-9]{5}$/)
      ]
    }),
    ciudad: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    colonia: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    calle: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    numeroExterior: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    numeroInterior: new FormControl('', {
      nonNullable: true
    })
  });

  constructor() {
    addIcons({
      locationOutline,
      mapOutline,
      navigateOutline,
      homeOutline,
      businessOutline,
      alertCircleOutline
    });
  }

  async siguiente(): Promise<void> {
    this.error.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const usuario = firebaseAuth.currentUser;

    if (!usuario) {
      this.error.set('No se encontró una sesión activa. Regresa e inténtalo de nuevo.');
      return;
    }

    const datos = this.formulario.getRawValue();
    this.cargando.set(true);

    try {
      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        direccion: {
          codigoPostal: datos.codigoPostal.trim(),
          ciudad: datos.ciudad.trim(),
          colonia: datos.colonia.trim(),
          calle: datos.calle.trim(),
          numeroExterior: datos.numeroExterior.trim(),
          numeroInterior: datos.numeroInterior.trim()
        }
      });

      this.formulario.reset();
      await this.router.navigate(['/home']);

    } catch (error) {
      console.error('Error al guardar dirección:', error);
      this.error.set('No se pudo guardar la dirección. Inténtalo nuevamente.');
    } finally {
      this.cargando.set(false);
    }
  }
}