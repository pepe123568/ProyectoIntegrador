import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonContent,
  IonSpinner,
  IonIcon,
  IonText,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonBadge,
  IonCardContent,
  IonModal,
  IonList,
  IonItem,
  IonNote,
  IonFooter,
  IonTabBar,
  IonTabButton
} from '@ionic/angular';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  where,
  type Unsubscribe
} from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  closeCircleOutline,
  receiptOutline,
  storefrontOutline,
  chevronForwardOutline,
  closeOutline,
  cubeOutline,
  homeOutline,
  calendarOutline,
  bagHandleOutline,
  personCircleOutline,
  barcodeOutline,
  swapHorizontalOutline
} from 'ionicons/icons';

import { firebaseAuth, db } from '../../services/firebase';

export type FiltroPedido = 'todos' | 'por_pagar' | 'activos' | 'completados';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonContent,
    IonSpinner,
    IonIcon,
    IonText,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonBadge,
    IonCardContent,
    IonModal,
    IonList,
    IonItem,
    IonNote,
    IonFooter,
    IonTabBar,
    IonTabButton
  ],
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss']
})
export class PedidosPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private suscripciones: Unsubscribe[] = [];

  cargando = signal(true);
  error = signal('');
  pedidos = signal<any[]>([]);
  filtroEstado = signal<FiltroPedido>('todos');
  pedidoSeleccionado = signal<any | null>(null);

  // Contador de pedidos pendientes de pago
  cantidadPorPagar = computed(() =>
    this.pedidos().filter((p) => this.esPorPagar(p)).length
  );

  // Lista filtrada según la pestaña elegida
  pedidosFiltrados = computed(() => {
    const filtro = this.filtroEstado();
    const lista = this.pedidos();

    if (filtro === 'por_pagar') {
      return lista.filter((p) => this.esPorPagar(p));
    }

    if (filtro === 'activos') {
      return lista.filter((p) =>
        ['pendiente', 'pagado', 'en_preparacion', 'en_camino'].includes(p.estado)
      );
    }

    if (filtro === 'completados') {
      return lista.filter((p) =>
        ['entregado', 'completado', 'cancelado'].includes(p.estado)
      );
    }

    return lista;
  });

  constructor() {
    addIcons({
      closeCircleOutline,
      receiptOutline,
      storefrontOutline,
      chevronForwardOutline,
      closeOutline,
      cubeOutline,
      homeOutline,
      calendarOutline,
      bagHandleOutline,
      personCircleOutline,
      barcodeOutline,
      swapHorizontalOutline
    });
  }

  ngOnInit(): void {
    onAuthStateChanged(firebaseAuth, (usuario) => {
      this.limpiarSuscripciones();

      if (!usuario) {
        this.cargando.set(false);
        this.error.set('Inicia sesión para ver tus pedidos.');
        return;
      }

      this.escucharTodosLosPedidos(usuario.uid, usuario.email ?? '');
    });
  }

  ngOnDestroy(): void {
    this.limpiarSuscripciones();
  }

  private limpiarSuscripciones(): void {
    this.suscripciones.forEach((unsub) => unsub());
    this.suscripciones = [];
  }

  private escucharTodosLosPedidos(uid: string, email: string): void {
    this.cargando.set(true);
    this.error.set('');

    const mapaPedidos = new Map<string, any>();
    const refColeccion = collection(db, 'pedidos');

    // Consultas compatibles con pedidos nuevos (uid) y anteriores (usuarioId, userId, correoContacto)
    const consultas = [
      query(refColeccion, where('uid', '==', uid)),
      query(refColeccion, where('usuarioId', '==', uid)),
      query(refColeccion, where('userId', '==', uid))
    ];

    if (email) {
      consultas.push(query(refColeccion, where('correoContacto', '==', email)));
      consultas.push(query(refColeccion, where('correo', '==', email)));
    }

    const actualizarLista = () => {
      const combinados = Array.from(mapaPedidos.values());

      combinados.sort((a, b) => {
        const fechaA = a.fecha?.toMillis
          ? a.fecha.toMillis()
          : a.fecha
          ? new Date(a.fecha).getTime()
          : 0;
        const fechaB = b.fecha?.toMillis
          ? b.fecha.toMillis()
          : b.fecha
          ? new Date(b.fecha).getTime()
          : 0;
        return fechaB - fechaA;
      });

      this.pedidos.set(combinados);
      this.cargando.set(false);
    };

    consultas.forEach((q) => {
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docs.forEach((d) => {
            mapaPedidos.set(d.id, { id: d.id, ...(d.data() as any) });
          });
          actualizarLista();
        },
        () => {
          // Si alguna consulta secundaria no tiene permiso o índice, mantiene las demás activas
          this.cargando.set(false);
        }
      );
      this.suscripciones.push(unsub);
    });
  }

  cambiarFiltro(event: any): void {
    const valor = event.detail?.value as FiltroPedido;
    if (valor) {
      this.filtroEstado.set(valor);
    }
  }

  esPorPagar(pedido: any): boolean {
    return pedido?.estado === 'pendiente_pago' || pedido?.estado === 'por_pagar';
  }

  esTransferencia(pedido: any): boolean {
    const metodo = String(pedido?.metodoPago ?? '').toLowerCase().trim();
    return metodo === 'transferencia' || Boolean(pedido?.clabeSpei || pedido?.conceptoPago);
  }

  async abrirPedido(pedido: any): Promise<void> {
    if (this.esPorPagar(pedido)) {
      if (this.esTransferencia(pedido)) {
        await this.router.navigate(['/transferencia'], {
          state: {
            productos: pedido.productos || [],
            subtotal: pedido.subtotal,
            envio: pedido.envio ?? 0,
            total: pedido.total,
            conceptoPago: pedido.conceptoPago || pedido.referenciaPago || `KAMUR-${this.obtenerFolio(pedido)}`,
            folio: this.obtenerFolio(pedido),
            metodoEntrega: pedido.metodoEntrega,
            direccionEntrega: pedido.direccionEntrega,
            sucursal: pedido.sucursal
          }
        });
        return;
      }

      const refExistente =
        pedido.referenciaPago || `98${String(pedido.id).replace(/\D/g, '').padEnd(16, '0').slice(0, 16)}`;

      await this.router.navigate(['/pago-efectivo'], {
        state: {
          productos: pedido.productos || [],
          subtotal: pedido.subtotal,
          envio: pedido.envio ?? 0,
          total: pedido.total,
          referenciaPago: refExistente,
          folio: this.obtenerFolio(pedido),
          metodoEntrega: pedido.metodoEntrega,
          direccionEntrega: pedido.direccionEntrega,
          sucursal: pedido.sucursal
        }
      });
      return;
    }

    this.pedidoSeleccionado.set(pedido);
  }

  cerrarDetalle(): void {
    this.pedidoSeleccionado.set(null);
  }

  obtenerFolio(pedido: any): string {
    if (pedido?.folio) {
      return String(pedido.folio).toUpperCase();
    }
    return String(pedido?.id ?? '').slice(0, 6).toUpperCase();
  }

  obtenerTotalArticulos(pedido: any): number {
    if (!Array.isArray(pedido?.productos)) return 0;
    return pedido.productos.reduce((acc: number, item: any) => acc + (Number(item.cantidad) || 1), 0);
  }

  obtenerTextoEstado(estado: string): string {
    switch (estado) {
      case 'pendiente_pago':
      case 'por_pagar':
        return 'Falta pagar el producto';
      case 'pendiente':
      case 'pagado':
        return 'Pagado · En preparación';
      case 'en_camino':
        return 'En camino';
      case 'entregado':
      case 'completado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado || 'En proceso';
    }
  }

  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'pendiente_pago':
      case 'por_pagar':
        return 'warning';
      case 'pendiente':
      case 'pagado':
      case 'en_camino':
        return 'primary';
      case 'entregado':
      case 'completado':
        return 'success';
      case 'cancelado':
        return 'danger';
      default:
        return 'medium';
    }
  }
}