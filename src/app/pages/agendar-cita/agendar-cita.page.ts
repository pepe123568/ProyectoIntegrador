import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonText,
  IonSpinner
} from '@ionic/angular';
import {
  addDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

import { firebaseAuth, db } from '../../services/firebase';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonText,
    IonSpinner
  ],
  templateUrl: './agendar-cita.page.html',
  styleUrls: ['./agendar-cita.page.scss']
})
export class AgendarCitaPage implements OnInit {
  private readonly router = inject(Router);

  servicio = '';
  fecha = '';
  hora = '';
  notas = '';
  fechaMinima = '';

  intentado = signal(false);
  cargando = signal(false);
  error = signal('');

  constructor() {
    addIcons({ arrowBackOutline });
  }

  ngOnInit(): void {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    this.fechaMinima = `${anio}-${mes}-${dia}`;
  }

  // Valida que la hora esté estrictamente entre las 09:00 (9 AM) y las 19:00 (7 PM)
  esHorarioValido(): boolean {
    if (!this.hora) return true;
    const [horasStr, minutosStr] = this.hora.split(':');
    const horas = Number(horasStr);
    const minutos = Number(minutosStr);

    if (Number.isNaN(horas) || Number.isNaN(minutos)) return false;

    const totalMinutos = horas * 60 + minutos;
    const inicioMinutos = 9 * 60;  // 09:00 AM
    const finMinutos = 19 * 60;    // 07:00 PM

    return totalMinutos >= inicioMinutos && totalMinutos <= finMinutos;
  }

  validarHoraEnVivo(): void {
    this.error.set('');
  }

  async agendarCita(): Promise<void> {
    this.error.set('');
    this.intentado.set(true);

    // 1. Verifica que los campos obligatorios estén llenos
    if (!this.servicio || !this.fecha || !this.hora) {
      return;
    }

    // 2. Verifica que la hora esté dentro de 9:00 AM a 7:00 PM
    if (!this.esHorarioValido()) {
      return;
    }

    this.cargando.set(true);

    try {
      // Espera a que Firebase Auth termine de restaurar la sesión en Android/Web
      await firebaseAuth.authStateReady();
      const usuario = firebaseAuth.currentUser;

      if (!usuario) {
        this.error.set('Debes iniciar sesión para agendar una cita.');
        return;
      }

      const nuevaCita = {
        uid: usuario.uid,
        usuarioId: usuario.uid,
        correo: usuario.email ?? '',
        nombreCliente: usuario.displayName ?? '',
        servicio: this.servicio,
        fecha: this.fecha,
        hora: this.hora,
        notas: this.notas.trim(),
        estado: 'pendiente',
        fechaCreacion: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'citas'), nuevaCita);

      const datosCita = {
        id: docRef.id,
        servicio: this.servicio,
        fecha: this.fecha,
        hora: this.hora,
        notas: this.notas.trim()
      };

      this.servicio = '';
      this.fecha = '';
      this.hora = '';
      this.notas = '';
      this.intentado.set(false);

      // Redirige a la página cita-exitosa enviando los datos de la cita
      await this.router.navigate(['/cita-exitosa'], {
        replaceUrl: true,
        state: { cita: datosCita }
      });

    } catch (err: any) {
      console.error('Error al agendar cita en Firestore:', err);
      if (err?.code === 'permission-denied') {
        this.error.set('Firestore bloqueó el guardado. Revisa las reglas de la colección "citas".');
      } else {
        this.error.set(`No se pudo guardar la cita: ${err?.message || 'Inténtalo nuevamente.'}`);
      }
    } finally {
      this.cargando.set(false);
    }
  }
}