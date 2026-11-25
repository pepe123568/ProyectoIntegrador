/* eslint-disable @typescript-eslint/prefer-for-of */
import { CommonModule } from '@angular/common';
import type {
  AfterViewInit,
  ElementRef,
  OnInit} from '@angular/core';
import {
  Component,
  ViewChild,
  inject,
  signal
} from '@angular/core';
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
  selector: 'app-pago-efectivo',
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
  templateUrl: './pago-efectivo.page.html',
  styleUrls: ['./pago-efectivo.page.scss']
})
export class PagoEfectivoPage implements OnInit, AfterViewInit {
  @ViewChild('barcodeCanvas') barcodeCanvas?: ElementRef<HTMLCanvasElement>;

  private readonly router = inject(Router);
  private readonly tiendaService = inject(TiendaService);

  productos = signal<ProductoCompra[]>([]);
  subtotal = signal(0);
  envio = signal(0);
  total = signal(0);
  referenciaPago = signal('');
  folio = signal('');
  metodoEntrega = signal<'domicilio' | 'sucursal'>('domicilio');
  direccionEntrega = signal('');
  sucursal = signal('');

  copiado = signal(false);
  guardando = signal(false);
  yaGuardado = signal(false);

  // Tiendas autorizadas para pagar en caja
  tiendasAutorizadas = [
    {
      siglas: 'OXXO',
      nombre: 'Tiendas OXXO',
      instruccion: 'Indica al cajero que realizarás un pago de servicio y muestra el código de barras.',
      comision: 'Comisión en caja: $15.00 MXN · Acreditación inmediata',
      color: '#dc2626'
    },
    {
      siglas: '7-11',
      nombre: '7-Eleven México',
      instruccion: 'Presenta el código de barras o dicta los 18 dígitos de referencia en caja.',
      comision: 'Comisión en caja: $12.00 MXN · Disponible 24/7',
      color: '#15803d'
    },
    {
      siglas: 'F.A.',
      nombre: 'Farmacias del Ahorro',
      instruccion: 'Solicita un depósito con referencia en cualquier sucursal autorizada.',
      comision: 'Comisión en caja: $10.00 MXN · Acreditación en 1 hora',
      color: '#1d4ed8'
    }
  ];

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

    // 1. Toma los productos desde state.items (PagoPage), state.productos (PedidosPage) o directo del TiendaService
    const listaCruda =
      state?.items?.length ? state.items :
      state?.productos?.length ? state.productos :
      this.tiendaService.items();

    if (listaCruda && listaCruda.length > 0) {
      // Normaliza cada producto por si viene anidado como { producto: { id, nombre, precio }, cantidad }
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

    // 2. Si viene desde "Mis pedidos" ya tiene referencia; si es compra nueva, genera una y guarda
    if (state?.referenciaPago) {
      this.referenciaPago.set(state.referenciaPago);
      this.folio.set(state.folio ?? '');
      this.yaGuardado.set(true);
    } else {
      const refGenerada = this.generarReferenciaNumerica();
      this.referenciaPago.set(refGenerada);
      this.folio.set(refGenerada.slice(-6));
      this.registrarPedidoPendiente();
    }
  }

  ngAfterViewInit(): void {
    this.dibujarCodigoBarras(this.referenciaPago());
  }

  private generarReferenciaNumerica(): string {
    const marcaTiempo = Date.now().toString().slice(-10);
    const aleatorio = Math.floor(100000 + Math.random() * 900000).toString();
    return `98${marcaTiempo}${aleatorio}`;
  }

  private dibujarCodigoBarras(codigo: string): void {
    const canvas = this.barcodeCanvas?.nativeElement;
    if (!canvas || !codigo) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const anchoBarra = 2;
    const alto = 76;
    const patron: number[] = [1, 0, 1, 1, 0];

    for (let i = 0; i < codigo.length; i++) {
      const digito = parseInt(codigo[i], 10) || 0;
      const bits = (digito + 3).toString(2).padStart(4, '0');
      for (const bit of bits) {
        patron.push(bit === '1' ? 1 : 0);
        patron.push(bit === '1' ? 1 : 0);
      }
      patron.push(0);
    }
    patron.push(1, 1, 0, 1, 0, 1);

    canvas.width = patron.length * anchoBarra + 20;
    canvas.height = alto;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f172a';
    patron.forEach((barra, idx) => {
      if (barra === 1) {
        ctx.fillRect(10 + idx * anchoBarra, 4, anchoBarra, alto - 8);
      }
    });
  }

  async copiarReferencia(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.referenciaPago());
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2500);
    } catch {
      // Respaldo silencioso
    }
  }

  private async registrarPedidoPendiente(): Promise<void> {
    const usuario = firebaseAuth.currentUser;
    if (!usuario || this.productos().length === 0 || this.yaGuardado()) return;

    this.guardando.set(true);
    try {
      await addDoc(collection(db, 'pedidos'), {
        uid: usuario.uid,
        folio: this.folio(),
        referenciaPago: this.referenciaPago(),
        metodoPago: 'efectivo',
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

      // Limpia el carrito en TiendaService si tiene método vaciarCarrito() o limpiarCarrito()
      const servicioAny = this.tiendaService as any;
      if (typeof servicioAny.vaciarCarrito === 'function') {
        servicioAny.vaciarCarrito();
      } else if (typeof servicioAny.limpiarCarrito === 'function') {
        servicioAny.limpiarCarrito();
      }
    } catch (error) {
      console.error('Error registrando pedido en efectivo:', error);
    } finally {
      this.guardando.set(false);
    }
  }

  async irAPedidos(): Promise<void> {
    await this.router.navigate(['/pedidos'], { replaceUrl: true });
  }
}