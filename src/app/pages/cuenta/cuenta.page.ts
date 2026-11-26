import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonInput,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonTabBar,
  IonTabButton,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import { signOut, verifyBeforeUpdateEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  bagHandleOutline,
  calendarOutline,
  homeOutline,
  personCircleOutline,
  personOutline
} from 'ionicons/icons';

import { db, firebaseAuth } from '../../services/firebase';

interface DireccionUsuario {
  codigoPostal?: string;
  ciudad?: string;
  colonia?: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
}

interface DatosUsuario {
  nombre?: string;
  apellidos?: string;
  correo?: string;
  telefono?: string;
  direccion?: DireccionUsuario;
}

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonSpinner,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonAvatar,
    IonList,
    IonItem,
    IonInput,
    IonLabel,
    IonNote,
    IonFooter,
    IonTabBar,
    IonTabButton
  ],
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss']
})
export class CuentaPage implements OnInit {
  private readonly router = inject(Router);

  readonly usuario = signal<DatosUsuario | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly cerrandoSesion = signal(false);
  readonly editando = signal(false);
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  borrador = { nombre: '', apellidos: '', telefono: '', correo: '', direccion: {
    calle: '', numeroExterior: '', numeroInterior: '', colonia: '', ciudad: '', codigoPostal: ''
  }};

  constructor() {
    addIcons({
      arrowBackOutline,
      personOutline,
      homeOutline,
      calendarOutline,
      bagHandleOutline,
      personCircleOutline
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarUsuario();
  }

  async cargarUsuario(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');

    try {
      await firebaseAuth.authStateReady();
      const actual = firebaseAuth.currentUser;

      if (!actual) {
        await this.router.navigateByUrl('/login', { replaceUrl: true });
        return;
      }

      const documento = await getDoc(doc(db, 'usuarios', actual.uid));

      if (documento.exists()) {
        this.usuario.set({ ...documento.data() as DatosUsuario, correo: actual.email || (documento.data() as DatosUsuario).correo });
      } else {
        this.usuario.set({
          nombre: actual.displayName || '',
          correo: actual.email || ''
        });
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      this.error.set('No se pudo cargar tu información.');
    } finally {
      this.cargando.set(false);
    }
  }

  nombreCompleto(): string {
    const datos = this.usuario();
    if (!datos) return 'Usuario';
    return [datos.nombre, datos.apellidos].filter(Boolean).join(' ') || 'Usuario';
  }

  direccionCompleta(): string {
    const d = this.usuario()?.direccion;
    if (!d) return 'Sin dirección registrada';

    const calle = [
      d.calle,
      d.numeroExterior,
      d.numeroInterior ? `Int. ${d.numeroInterior}` : ''
    ].filter(Boolean).join(' ');

    return [
      calle,
      d.colonia,
      d.ciudad,
      d.codigoPostal ? `C.P. ${d.codigoPostal}` : ''
    ].filter(Boolean).join(', ') || 'Sin dirección registrada';
  }

  editarInformacion(): void {
    const u = this.usuario();
    if (!u) return;
    const d = u.direccion;
    this.borrador = {
      nombre: u.nombre || '', apellidos: u.apellidos || '',
      telefono: u.telefono || '', correo: u.correo || '',
      direccion: { calle: d?.calle || '', numeroExterior: d?.numeroExterior || '',
        numeroInterior: d?.numeroInterior || '', colonia: d?.colonia || '',
        ciudad: d?.ciudad || '', codigoPostal: d?.codigoPostal || '' }
    };
    this.error.set('');
    this.mensaje.set('');
    this.editando.set(true);
  }

  cancelarEdicion(): void {
    this.editando.set(false);
    this.error.set('');
    this.mensaje.set('');
  }

  async guardarCambios(): Promise<void> {
    if (this.guardando() || !this.editando()) return;
    const actual = firebaseAuth.currentUser;
    if (!actual) { this.error.set('Inicia sesión nuevamente.'); return; }
    const b = this.borrador;
    const correo = b.correo.trim();
    if (!b.nombre.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      this.error.set('Escribe un nombre y un correo válido.'); return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');
    try {
      const cambioCorreo = correo !== (actual.email || '');
      const datos = {
        nombre: b.nombre.trim(), apellidos: b.apellidos.trim(),
        telefono: b.telefono.trim(), correo: actual.email || this.usuario()?.correo || '',
        direccion: { ...b.direccion }
      };
      await setDoc(doc(db, 'usuarios', actual.uid), datos, { merge: true });
      this.usuario.set({ ...this.usuario(), ...datos });
      if (cambioCorreo) {
        try {
          await verifyBeforeUpdateEmail(actual, correo);
          this.mensaje.set('Datos guardados. Confirma el nuevo correo mediante el enlace enviado.');
        } catch (e) {
          console.error(e);
          this.error.set('Los datos personales se guardaron, pero no se pudo solicitar el cambio de correo. Vuelve a iniciar sesión e inténtalo nuevamente.');
          return;
        }
      } else {
        this.mensaje.set('Información actualizada correctamente.');
      }
      this.editando.set(false);
    } catch (e) {
      console.error(e);
      this.error.set('No se pudieron guardar los cambios. Revisa tu conexión y los permisos de Firebase.');
    } finally {
      this.guardando.set(false);
    }
  }

  async cerrarSesion(): Promise<void> {
    if (this.cerrandoSesion()) return;
    this.cerrandoSesion.set(true);

    try {
      await signOut(firebaseAuth);
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      console.error(error);
      this.error.set('No se pudo cerrar la sesión.');
    } finally {
      this.cerrandoSesion.set(false);
    }
  }
}