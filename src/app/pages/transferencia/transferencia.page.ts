import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
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
  IonIcon,
  IonButton,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner
} from '@ionic/angular';
import {
  addDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  timeOutline,
  copyOutline,
  checkmarkOutline,
  cubeOutline
} from 'ionicons/icons';

import { firebaseAuth, db } from '../../services/firebase';
import { TiendaService } from '../../services/tienda.service';

export interface ProductoCompra {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [
    CommonModule,
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
    IonIcon,
    IonButton,
    IonText,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonSpinner
  ],
  templateUrl: './transferencia.page.html',
  styleUrls: ['./transferencia.page.scss']
})
export class TransferenciaPage implements OnInit {
  private readonly router = inject(Router);
  private readonly tiendaService = inject(TiendaService);

  // Datos de la cuenta SPEI autorizada
  readonly bancoDestino = 'BBVA México / STP';
  readonly beneficiario = 'VetKamur S.A. de C.V.';
  readonly clabeSpei = '646180157000482914';

  productos = signal<ProductoCompra[]>([]);
  subtotal = signal(0);
  envio = signal(0);
  total = signal(0);
  conceptoPago = signal('');
  folio = signal('');
  metodoEntrega = signal<'domicilio' | 'sucursal'>('domicilio');
  direccionEntrega = signal('');
  sucursal = signal('');

  copiadoClabe = signal(false);
  copiadoConcepto = signal(false);
  guardando = signal(false);
  yaGuardado = signal(false);

  constructor() {
    addIcons({
      timeOutline,
      copyOutline,
      checkmarkOutline,
      cubeOutline
    });
  }

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || history.state;

    // 1. Obtiene los productos desde state.items, state.productos o TiendaService
    const listaCruda =
      state?.items?.length ? state.items :
      state?.productos?.length ? state.productos :
      this.tiendaService.items();

    if (listaCruda && listaCruda.length > 0) {
      const listaNormalizada: ProductoCompra[] = listaCruda.map((item: any) => {
        const info = item.producto ? item.producto : item;
        return {
          id: String(info.id ?? item.id ?? Math.random()),
          nombre: String(info.nombre ?? item.nombre ?? 'Producto'),
          precio: Number(info.precio ?? item.precio ?? 0),
          cantidad: Number(item.cantidad ?? 1)
        };
      });

      this.productos.set(listaNormalizada);

      const calcSub = listaNormalizada.reduce(
        (acc, p) => acc + p.precio * p.cantidad,
        0
      );
      const calcEnvio = Number(state?.envio ?? 0);

      this.subtotal.set(calcSub);
      this.envio.set(calcEnvio);
      this.total.set(Number(state?.total ?? (calcSub + calcEnvio)));
      this.metodoEntrega.set(state?.metodoEntrega ?? 'domicilio');
      this.direccionEntrega.set(state?.direccionEntrega ?? '');
      this.sucursal.set(state?.sucursal ?? '');
    }

    // 2. Si viene desde "Mis pedidos" conserva su concepto; si es nueva compra, genera uno y guarda
    if (state?.conceptoPago || state?.referenciaPago) {
      this.conceptoPago.set(state.conceptoPago || state.referenciaPago);
      this.folio.set(state.folio ?? '');
      this.yaGuardado.set(true);
    } else {
      const folioGen = Math.floor(100000 + Math.random() * 900000).toString();
      this.folio.set(folioGen);
      this.conceptoPago.set(`KAMUR-${folioGen}`);
      this.registrarPedidoPendiente();
    }
  }

  async copiarDato(texto: string, tipo: 'clabe' | 'concepto'): Promise<void> {
    try {
      await navigator.clipboard.writeText(texto);
      if (tipo === 'clabe') {
        this.copiadoClabe.set(true);
        setTimeout(() => this.copiadoClabe.set(false), 2500);
      } else {
        this.copiadoConcepto.set(true);
        setTimeout(() => this.copiadoConcepto.set(false), 2500);
      }
    } catch {
      // Respaldo silencioso
    }
  }

  private async registrarPedidoPendiente(): Promise<void> {
    await firebaseAuth.authStateReady();
    const usuario = firebaseAuth.currentUser;
    if (!usuario || this.productos().length === 0 || this.yaGuardado()) return;

    this.guardando.set(true);
    try {
      await addDoc(collection(db, 'pedidos'), {
        uid: usuario.uid,
        folio: this.folio(),
        referenciaPago: this.conceptoPago(),
        conceptoPago: this.conceptoPago(),
        clabeSpei: this.clabeSpei,
        metodoPago: 'transferencia',
        estado: 'pendiente_pago',
        productos: this.productos(),
        subtotal: this.subtotal(),
        envio: this.envio(),
        total: this.total(),
        metodoEntrega: this.metodoEntrega(),
        direccionEntrega: this.direccionEntrega(),
        sucursal: this.sucursal(),
        fecha: serverTimestamp()
      });

      this.yaGuardado.set(true);

      const servicioAny = this.tiendaService as any;
      if (typeof servicioAny.vaciarCarrito === 'function') {
        servicioAny.vaciarCarrito();
      } else if (typeof servicioAny.limpiarCarrito === 'function') {
        servicioAny.limpiarCarrito();
      }
    } catch (error) {
      console.error('Error registrando pedido por transferencia:', error);
    } finally {
      this.guardando.set(false);
    }
  }

  async irAPedidos(): Promise<void> {
    await this.router.navigate(['/pedidos'], { replaceUrl: true });
  }
}