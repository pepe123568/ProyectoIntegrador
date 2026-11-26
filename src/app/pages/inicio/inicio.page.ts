import { CommonModule } from '@angular/common';
import type { OnInit} from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonBadge,
  IonContent,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonImg,
  IonText,
  IonModal,
  IonPopover,
  IonSpinner,
  IonList,
  IonItem,
  IonNote,
  IonFooter,
  IonTabBar,
  IonTabButton
} from '@ionic/angular';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  menuOutline,
  notificationsOutline,
  notificationsOffOutline,
  cartOutline,
  calendarOutline,
  receiptOutline,
  bagHandleOutline,
  locationOutline,
  headsetOutline,
  shieldCheckmarkOutline,
  gridOutline,
  closeOutline,
  personCircleOutline,
  settingsOutline,
  logOutOutline,
  homeOutline,
  pawOutline
} from 'ionicons/icons';

import { firebaseAuth, db } from '../../services/firebase';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonBadge,
    IonContent,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonLabel,
    IonImg,
    IonText,
    IonModal,
    IonPopover,
    IonSpinner,
    IonList,
    IonItem,
    IonNote,
    IonFooter,
    IonTabBar,
    IonTabButton
  ],
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss']
})
export class InicioPage implements OnInit {
  private router = inject(Router);

  // Datos del usuario
  nombreUsuario = signal('');
  correoUsuario = signal('');
  esAdministrador = signal(false);

  // Estado de interfaz
  busqueda = signal('');
  cerrandoSesion = signal(false);

  // Notificaciones
  notificacionesAbiertas = signal(false);
  cargandoNotificaciones = signal(false);
  errorNotificaciones = signal('');
  notificaciones = signal<any[]>([]);
  cantidadNoLeidas = signal(0);

  constructor() {
    addIcons({
      menuOutline,
      notificationsOutline,
      notificationsOffOutline,
      cartOutline,
      calendarOutline,
      receiptOutline,
      bagHandleOutline,
      locationOutline,
      headsetOutline,
      shieldCheckmarkOutline,
      gridOutline,
      closeOutline,
      personCircleOutline,
      settingsOutline,
      logOutOutline,
      homeOutline,
      pawOutline
    });
  }

  ngOnInit(): void {
    onAuthStateChanged(firebaseAuth, async (usuario) => {
      if (!usuario) {
        this.nombreUsuario.set('');
        this.correoUsuario.set('');
        this.esAdministrador.set(false);
        return;
      }

      this.correoUsuario.set(usuario.email ?? '');
      this.nombreUsuario.set(usuario.displayName ?? '');

      try {
        const snap = await getDoc(doc(db, 'usuarios', usuario.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data['nombre']) {
            this.nombreUsuario.set(data['nombre']);
          }
          this.esAdministrador.set(data['rol'] === 'admin' || data['esAdmin'] === true);
        }
      } catch (err) {
        console.error('Error cargando perfil en menú:', err);
      }

      this.escucharNotificaciones(usuario.uid);
    });
  }

  // --- NAVEGACIÓN DESDE EL MENÚ DESPLEGABLE ---

  async navegarDesdeMenu(ruta: string, popover?: IonPopover): Promise<void> {
    if (popover) {
      await popover.dismiss();
    }
    await this.router.navigate([ruta]);
  }

  async cerrarSesion(popover?: IonPopover): Promise<void> {
    if (this.cerrandoSesion()) return;

    this.cerrandoSesion.set(true);
    try {
      if (popover) {
        await popover.dismiss();
      }
      await signOut(firebaseAuth);
      await this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      this.cerrandoSesion.set(false);
    }
  }

  // --- NAVEGACIÓN Y BÚSQUEDA ---

  async navegar(ruta: string): Promise<void> {
    await this.router.navigate([ruta]);
  }

  buscar(event: any): void {
    this.busqueda.set(event.detail?.value ?? '');
  }

  async buscarProductos(): Promise<void> {
    const termino = this.busqueda().trim();
    await this.router.navigate(['/tienda'], {
      queryParams: termino ? { q: termino } : {}
    });
  }

  // --- NOTIFICACIONES ---

  alternarNotificaciones(): void {
    this.notificacionesAbiertas.set(!this.notificacionesAbiertas());
  }

  cerrarNotificaciones(): void {
    this.notificacionesAbiertas.set(false);
  }

  private escucharNotificaciones(uid: string): void {
    this.cargandoNotificaciones.set(true);
    try {
      const q = query(
        collection(db, 'notificaciones'),
        where('uid', '==', uid),
        orderBy('fecha', 'desc')
      );

      onSnapshot(
        q,
        (snapshot) => {
          const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          this.notificaciones.set(lista);
          this.cantidadNoLeidas.set(lista.filter((n: any) => !n.leida).length);
          this.cargandoNotificaciones.set(false);
        },
        (error) => {
          console.error('Error en notificaciones:', error);
          this.errorNotificaciones.set('No se pudieron cargar las notificaciones.');
          this.cargandoNotificaciones.set(false);
        }
      );
    } catch {
      this.cargandoNotificaciones.set(false);
    }
  }

  async marcarNotificacionLeida(notificacion: any): Promise<void> {
    if (notificacion.leida) return;
    try {
      await updateDoc(doc(db, 'notificaciones', notificacion.id), {
        leida: true
      });
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  }
}