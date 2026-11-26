/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectorRef, Component, NgZone, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar
} from '@ionic/angular';
import { onAuthStateChanged } from 'firebase/auth';
import type { Unsubscribe } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  calendarClearOutline,
  checkmarkOutline,
  closeOutline,
  createOutline,
  timeOutline,
  trashOutline
} from 'ionicons/icons';

import { db, firebaseAuth } from '../../services/firebase';

export interface Cita {
  id: string;
  servicio: string;
  fecha: string;
  hora: string;
  notas?: string;
  estado: string;
}

@Component({
  selector: 'app-citas',
  standalone: true,
  templateUrl: './citas.page.html',
  styleUrls: ['./citas.page.scss'],
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
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
    IonText,
    IonList,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonBadge,
    IonModal,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
    IonToast
  ],
})
export class CitasPage implements OnInit, OnDestroy {
  @ViewChild('modalEditor') modalEditor?: IonModal;

  citas: Cita[] = [];
  pestanaa: 'proximas' | 'historial' = 'proximas';
  cargando = true;
  error = '';
  avisoBloqueo = '';
  mensajeToast = '';

  citaEditando: Cita | null = null;
  guardandoEdicion = false;
  errorEdicion = '';

  readonly serviciosDisponibles = [
    'Consulta general',
    'Vacunación',
    'Desparasitación',
    'Estética y baño',
    'Urgencias',
    'Cirugía'
  ];

  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private cancelarAuth?: Unsubscribe;
  private cancelarCitas?: () => void;

  constructor() {
    addIcons({
      alertCircleOutline,
      arrowBackOutline,
      calendarClearOutline,
      checkmarkOutline,
      closeOutline,
      createOutline,
      timeOutline,
      trashOutline
    });
  }

  async ngOnInit() {
    // Espera a que Firebase resuelva la sesión inicial antes de consultar
    await firebaseAuth.authStateReady();

    if (firebaseAuth.currentUser) {
      this.escucharCitasEnTiempoReal(firebaseAuth.currentUser.uid);
    }

    this.cancelarAuth = onAuthStateChanged(firebaseAuth, usuario => {
      this.ngZone.run(() => {
        this.cancelarCitas?.();

        if (usuario) {
          this.escucharCitasEnTiempoReal(usuario.uid);
        } else {
          this.citas = [];
          this.cargando = false;
          this.error = 'Inicia sesión para ver tus citas.';
          this.cdr.detectChanges();
        }
      });
    });
  }

  ngOnDestroy() {
    this.cancelarAuth?.();
    this.cancelarCitas?.();
  }

  get fechaMinima(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private escucharCitasEnTiempoReal(usuarioId: string) {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    const consulta = query(
      collection(db, 'citas'),
      where('usuarioId', '==', usuarioId)
    );

    // Carga inicial inmediata con getDocs para evitar que el spinner se quede pegado
    getDocs(consulta)
      .then(snapshot => {
        this.ngZone.run(() => {
          this.mapearYOrdenarCitas(snapshot.docs);
          this.cargando = false;
          this.cdr.detectChanges();
        });
      })
      .catch(err => {
        console.error('Error inicial al leer citas:', err);
        this.ngZone.run(() => {
          this.error = 'No se pudieron cargar las citas. Revisa tu conexión o los escudos del navegador.';
          this.cargando = false;
          this.cdr.detectChanges();
        });
      });

    // Suscripción en tiempo real para cambios posteriores
    this.cancelarCitas = onSnapshot(
      consulta,
      resultado => {
        this.ngZone.run(() => {
          this.mapearYOrdenarCitas(resultado.docs);
          this.cargando = false;
          this.error = '';
          this.cdr.detectChanges();
        });
      },
      err => {
        console.error('Error en tiempo real de citas:', err);
      }
    );
  }

  private mapearYOrdenarCitas(docs: any[]) {
    this.citas = docs
      .map(documento => {
        const datos = documento.data();
        return {
          id: documento.id,
          servicio: datos['servicio'] || '',
          fecha: datos['fecha'] || '',
          hora: datos['hora'] || '',
          notas: datos['notas'] || '',
          estado: datos['estado'] || 'pendiente'
        };
      })
      .sort((a, b) => this.convertirFecha(a) - this.convertirFecha(b));
  }

  private convertirFecha(cita: Cita): number {
    return new Date(`${cita.fecha}T${cita.hora}:00`).getTime();
  }

  esCitaVencida(cita: Cita): boolean {
    const timestamp = this.convertirFecha(cita);
    return Number.isNaN(timestamp) || timestamp <= Date.now();
  }

  get citasProximas(): Cita[] {
    return this.citas.filter(
      cita => !this.esCitaVencida(cita) && cita.estado !== 'cancelada'
    );
  }

  get citasHistorial(): Cita[] {
    return this.citas
      .filter(cita => this.esCitaVencida(cita) || cita.estado === 'cancelada')
      .sort((a, b) => this.convertirFecha(b) - this.convertirFecha(a));
  }

  cambiarPestanaa(event: CustomEvent) {
    const valor = event.detail.value as 'proximas' | 'historial';
    if (valor) {
      this.pestanaa = valor;
      this.avisoBloqueo = '';
    }
  }

  abrirEditor(cita: Cita): void {
    this.avisoBloqueo = '';

    if (this.esCitaVencida(cita)) {
      this.avisoBloqueo = 'Esta cita ya pasó de fecha y no puede modificarse.';
      return;
    }

    this.errorEdicion = '';
    this.citaEditando = { ...cita };
    this.cdr.detectChanges();
  }

  async cerrarEditor(): Promise<void> {
    this.citaEditando = null;
    this.errorEdicion = '';
    this.guardandoEdicion = false;
    this.cdr.detectChanges();

    if (this.modalEditor) {
      await this.modalEditor.dismiss().catch(() => {});
    }
  }

  async guardarCambiosCita(): Promise<void> {
    if (!this.citaEditando) return;

    if (!this.citaEditando.servicio.trim() || !this.citaEditando.fecha || !this.citaEditando.hora) {
      this.errorEdicion = 'Completa servicio, fecha y hora.';
      return;
    }

    const nuevaFechaHora = new Date(`${this.citaEditando.fecha}T${this.citaEditando.hora}:00`).getTime();
    if (Number.isNaN(nuevaFechaHora) || nuevaFechaHora <= Date.now()) {
      this.errorEdicion = 'La nueva fecha y hora deben ser posteriores al momento actual.';
      return;
    }

    this.guardandoEdicion = true;
    this.errorEdicion = '';

    try {
      const ref = doc(db, 'citas', this.citaEditando.id);
      await updateDoc(ref, {
        servicio: this.citaEditando.servicio.trim(),
        fecha: this.citaEditando.fecha,
        hora: this.citaEditando.hora,
        notas: this.citaEditando.notas?.trim() || '',
        estado: this.citaEditando.estado
      });

      await this.cerrarEditor();
      this.mensajeToast = 'Cita modificada correctamente';
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error al actualizar cita:', err);
      this.errorEdicion = 'No se pudieron guardar los cambios.';
      this.guardandoEdicion = false;
      this.cdr.detectChanges();
    }
  }

  async eliminarCita(): Promise<void> {
    if (!this.citaEditando) return;

    this.guardandoEdicion = true;
    this.errorEdicion = '';

    try {
      await deleteDoc(doc(db, 'citas', this.citaEditando.id));
      await this.cerrarEditor();
      this.mensajeToast = 'Cita eliminada correctamente';
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error al eliminar cita:', err);
      this.errorEdicion = 'No se pudo eliminar la cita.';
      this.guardandoEdicion = false;
      this.cdr.detectChanges();
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short'
    }).format(new Date(anio, mes - 1, dia));
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    const [horas, minutos] = hora.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);

    return new Intl.DateTimeFormat('es-MX', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(fecha);
  }
}