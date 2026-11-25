import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonBadge,
  IonButton,
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
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  NavController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bagHandleOutline,
  calendarOutline,
  cardOutline,
  checkmarkCircleOutline,
  homeOutline,
  receiptOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

import { TiendaService } from '../../services/tienda.service';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonNote,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonButton
  ],
  templateUrl: './pago-exitoso.page.html',
  styleUrls: ['./pago-exitoso.page.scss']
})
export class PagoExitosoPage implements ViewWillEnter {
  private readonly navCtrl = inject(NavController);
  private readonly tiendaService = inject(TiendaService);

  estado = 'aprobado';
  transaccion = '';
  tarjeta = 'Tarjeta de crédito / débito';
  fechaCompra = new Date();

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      receiptOutline,
      cardOutline,
      calendarOutline,
      shieldCheckmarkOutline,
      bagHandleOutline,
      homeOutline
    });
  }

  ionViewWillEnter(): void {
    const params = new URLSearchParams(window.location.search);
    this.estado = params.get('estado') || 'aprobado';
    this.transaccion = params.get('transaccion') || `MP-${Date.now()}`;
    this.tarjeta = params.get('tarjeta') || 'Tarjeta aprobada • Mercado Pago';
    this.fechaCompra = new Date();

    // Asegura que el carrito quede limpio tras confirmar el pago
    this.tiendaService.vaciarCarrito();
  }

  irATienda(): void {
    void this.navCtrl.navigateRoot('/tienda');
  }

  irAInicio(): void {
    void this.navCtrl.navigateRoot('/inicio');
  }
}