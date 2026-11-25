import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  cardOutline,
  cashOutline,
  shieldCheckmarkOutline,
  swapHorizontalOutline
} from 'ionicons/icons';

import { TiendaService } from '../../services/tienda.service';

export type MetodoPago = 'tarjeta' | 'efectivo' | 'transferencia';

@Component({
  selector: 'app-pago',
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
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonNote,
    IonItem,
    IonLabel,
    IonRadioGroup,
    IonList,
    IonRadio,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonText
  ],
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss']
})
export class PagoPage {
  private readonly router = inject(Router);
  private readonly tiendaService = inject(TiendaService);

  metodoSeleccionado: MetodoPago = 'tarjeta';
  mensajeError = '';

  readonly items = this.tiendaService.items;
  readonly totalPagar = this.tiendaService.subtotal;
  readonly totalArticulos = this.tiendaService.totalArticulos;

  constructor() {
    addIcons({
      arrowBackOutline,
      cardOutline,
      cashOutline,
      swapHorizontalOutline,
      alertCircleOutline,
      shieldCheckmarkOutline
    });
  }

  async continuarPago(): Promise<void> {
    this.mensajeError = '';

    if (this.items().length === 0 || this.totalArticulos() <= 0) {
      this.mensajeError = 'Tu carrito está vacío. Agrega productos antes de pagar.';
      return;
    }

    const rutasPorMetodo: Record<MetodoPago, string> = {
      tarjeta: '/pago-tarjeta',
      efectivo: '/pago-efectivo',
      transferencia: '/transferencia'
    };

    const rutaDestino = rutasPorMetodo[this.metodoSeleccionado];
    await this.router.navigate([rutaDestino], {
      state: {
        items: this.items(),
        total: this.totalPagar(),
        metodo: this.metodoSeleccionado
      }
    });
  }
}