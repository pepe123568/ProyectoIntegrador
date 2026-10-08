import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-pago-tarjeta',
  standalone: true,
  templateUrl: './pago-tarjeta.page.html',
  styleUrls: ['./pago-tarjeta.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class PagoTarjetaPage {
  numero = '';
  exp = '';
  cvv = '';
  titular = '';
  error = '';

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Da formato MM/AA a la fecha de expiración
  formatearExp() {
    let d = this.exp.replace(/\D/g, '').slice(0, 4);

    this.exp = d.length > 2
      ? d.slice(0, 2) + '/' + d.slice(2)
      : d;
  }

  // Valida los datos y realiza el pago
  pagar() {
    this.error = '';

    const n = this.numero.replace(/\s|-/g, '');

    // Verifica los 16 dígitos de la tarjeta
    if (!/^\d{16}$/.test(n)) {
      this.error = 'Ingresa los 16 dígitos de la tarjeta.';
      return;
    }

    // Verifica el formato y mes de la fecha de expiración
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.exp)) {
      this.error = 'La vigencia debe usar un mes del 01 al 12 y formato MM/AA.';
      return;
    }

    const [mm, aa] = this.exp.split('/').map(Number);
    const ahora = new Date();
    const yy = ahora.getFullYear() % 100;
    const mes = ahora.getMonth() + 1;

    // Verifica que la tarjeta no esté vencida
    if (aa < yy || (aa === yy && mm < mes)) {
      this.error = 'La tarjeta está vencida.';
      return;
    }

    // Verifica el CVV
    if (!/^\d{3,4}$/.test(this.cvv)) {
      this.error = 'CVV inválido.';
      return;
    }

    // Verifica el nombre del titular
    if (this.titular.trim().length < 3) {
      this.error = 'Ingresa el nombre del titular.';
      return;
    }

    // Registra la compra y redirige al pago exitoso
    if (this.datos.comprar('Tarjeta')) {
      this.router.navigateByUrl('/pago-exitoso');
    }
  }
}