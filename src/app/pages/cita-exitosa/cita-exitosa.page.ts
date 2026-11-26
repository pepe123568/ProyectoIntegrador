import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  checkmarkCircle,
  medkitOutline,
  timeOutline
} from 'ionicons/icons';

import { db, firebaseAuth } from '../../services/firebase';

interface CitaConfirmada {
  servicio: string;
  fecha: string;
  hora: string;
}

@Component({
  selector: 'app-cita-exitosa',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton
  ],
  templateUrl: './cita-exitosa.page.html',
  styleUrls: ['./cita-exitosa.page.scss']
})
export class CitaExitosaPage implements OnInit, ViewWillEnter {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  cita: CitaConfirmada = {
    servicio: '',
    fecha: '',
    hora: ''
  };

  cargando = true;
  error = '';

  constructor() {
    addIcons({
      checkmarkCircle,
      calendarOutline,
      timeOutline,
      medkitOutline
    });
  }

  ngOnInit(): void {
    void this.cargarDatosCita();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.cargarDatosCita();
  }

  private async cargarDatosCita(): Promise<void> {
    this.cargando = true;
    this.error = '';

    const navState = this.router.getCurrentNavigation()?.extras?.state || history.state;
    const citaRecienCreada = navState?.['cita'];

    if (citaRecienCreada && (citaRecienCreada.servicio || citaRecienCreada.fecha)) {
      this.cita = {
        servicio: citaRecienCreada.servicio || '',
        fecha: citaRecienCreada.fecha || '',
        hora: citaRecienCreada.hora || ''
      };
      this.cargando = false;
      return;
    }

    const citaId =
      navState?.['citaId'] ??
      this.route.snapshot.queryParamMap.get('id');

    try {
      if (citaId) {
        const referencia = doc(db, 'citas', citaId);
        const documento = await getDoc(referencia);

        if (documento.exists()) {
          const datos = documento.data();
          this.cita = {
            servicio: datos['servicio'] || '',
            fecha: datos['fecha'] || '',
            hora: datos['hora'] || ''
          };
          this.cargando = false;
          return;
        }
      }

      const usuario = firebaseAuth.currentUser;
      if (usuario) {
        const consulta = query(
          collection(db, 'citas'),
          where('usuarioId', '==', usuario.uid)
        );
        const resultado = await getDocs(consulta);
        if (!resultado.empty) {
          const docs = resultado.docs.map(d => d.data());
          const ultima = docs[docs.length - 1];
          this.cita = {
            servicio: ultima['servicio'] || '',
            fecha: ultima['fecha'] || '',
            hora: ultima['hora'] || ''
          };
        }
      }
    } catch (err) {
      console.error('Error al consultar Firebase:', err);
      this.error = 'No se pudieron consultar los datos de la cita.';
    } finally {
      this.cargando = false;
    }
  }

  get fechaFormateada(): string {
    if (!this.cita.fecha) return 'Fecha no disponible';

    const [anio, mes, dia] = this.cita.fecha.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);

    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(fecha);
  }

  get horaFormateada(): string {
    if (!this.cita.hora) return 'Hora no disponible';

    const [hora, minutos] = this.cita.hora.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(hora, minutos, 0, 0);

    return new Intl.DateTimeFormat('es-MX', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(fecha);
  }
}