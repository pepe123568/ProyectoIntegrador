import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
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
  IonNote,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
  NavController
} from '@ionic/angular';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  callOutline,
  cardOutline,
  flashOutline,
  locationOutline,
  lockClosedOutline,
  mailOutline,
  personOutline
} from 'ionicons/icons';

import { firebaseAuth } from '../../services/firebase';
import type { DatosTarjetaMP } from '../../services/mercadopago.service';
import { MercadoPagoService } from '../../services/mercadopago.service';
import type { CarritoItem } from '../../services/tienda.service';
import { TiendaService } from '../../services/tienda.service';

@Component({
  selector: 'app-pago-tarjeta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonNote,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonText,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner
  ],
  templateUrl: './pago-tarjeta.page.html',
  styleUrls: ['./pago-tarjeta.page.scss']
})
export class PagoTarjetaPage {
  private readonly tiendaService = inject(TiendaService);
  private readonly mercadoPagoService = inject(MercadoPagoService);
  private readonly navCtrl = inject(NavController);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly items = this.tiendaService.items;
  readonly totalPagar = this.tiendaService.subtotal;
  readonly totalArticulos = this.tiendaService.totalArticulos;

  readonly meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  readonly anios = ['26', '27', '28', '29', '30', '31', '32', '33', '34'];

  datosTarjeta: DatosTarjetaMP = {
    nombreTitular: '',
    numeroTarjeta: '',
    mesExpiracion: '11',
    anioExpiracion: '30',
    cvv: '',
    correo: '',
    telefono: '',
    direccion: ''
  };

  procesando = false;
  errorPago = '';

  constructor() {
    addIcons({
      arrowBackOutline,
      cardOutline,
      lockClosedOutline,
      alertCircleOutline,
      personOutline,
      mailOutline,
      callOutline,
      locationOutline,
      flashOutline
    });
  }

  regresar(): void {
    void this.navCtrl.navigateBack('/pago');
  }

  rellenarDatosPrueba(): void {
    this.datosTarjeta = {
      nombreTitular: 'APRO',
      numeroTarjeta: '5474 9254 3267 0366',
      mesExpiracion: '11',
      anioExpiracion: '30',
      cvv: '123',
      correo: this.datosTarjeta.correo || '',
      telefono: '2711234567',
      direccion: 'Av. Principal #123, Córdoba, Veracruz'
    };
  }

  formatearNumeroTarjeta(event: CustomEvent): void {
    const valor = String(event.detail.value ?? '').replace(/\D/g, '').slice(0, 16);
    this.datosTarjeta.numeroTarjeta = valor.replace(/(.{4})/g, '$1 ').trim();
  }

  async pagarConMercadoPago(): Promise<void> {
    this.errorPago = '';

    if (this.items().length === 0) {
      this.errorPago = 'No hay productos en el carrito.';
      return;
    }

    if (!this.datosTarjeta.correo.trim() || !this.datosTarjeta.direccion.trim()) {
      this.errorPago = 'Completa tu correo y dirección de entrega.';
      return;
    }

    const usuario = firebaseAuth.currentUser;
    if (!usuario) {
      this.errorPago = 'Debes iniciar sesión para registrar tu pedido.';
      return;
    }

    this.procesando = true;
    this.cdr.detectChanges();

    try {
      const carrito: CarritoItem[] = this.items();
      const total = this.totalPagar();

      const resultado = await this.mercadoPagoService.procesarPagoConTarjeta(
        this.datosTarjeta,
        carrito,
        total
      );

      const db = getFirestore();
      const folio = `KMR-${Date.now().toString().slice(-6)}`;

      const productosPedido = carrito.map((item: CarritoItem) => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio: item.producto.precio
         ?? ''
      }));

      await addDoc(collection(db, 'pedidos'), {
        usuarioId: usuario.uid,
        folio,
        fecha: serverTimestamp(),
        estado: 'pendiente',
        metodoPago: 'tarjeta',
        idTransaccion: resultado.idTransaccion,
        tarjeta: `${resultado.marca} •••• ${resultado.ultimosCuatro}`,
        productos: productosPedido,
        subtotal: total,
        envio: 0,
        total,
        metodoEntrega: 'domicilio',
        direccionEntrega: this.datosTarjeta.direccion.trim(),
        telefonoContacto: this.datosTarjeta.telefono.trim(),
        correoContacto: this.datosTarjeta.correo.trim()
      });

      this.tiendaService.vaciarCarrito();
      await this.navCtrl.navigateForward('/pago-exitoso', {
        queryParams: {
          estado: resultado.estado,
          transaccion: resultado.idTransaccion,
          tarjeta: `${resultado.marca} •••• ${resultado.ultimosCuatro}`
        }
      });
    } catch (error: unknown) {
      console.error('Error al procesar tarjeta:', error);
      this.errorPago =
        error instanceof Error ? error.message : 'No se pudo procesar el pago con tarjeta.';
      this.procesando = false;
      this.cdr.detectChanges();
    }
  }
}