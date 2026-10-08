import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter, IonRadio, IonRadioGroup } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-pago',
  standalone: true,
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter, IonRadio, IonRadioGroup,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class PagoPage {
  metodo = '';
  error = '';

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Continúa con el método de pago seleccionado
  continuar() {
    this.error = '';

    // Verifica que el carrito tenga productos
    if (!this.datos.carrito.length) {
      this.error = 'El carrito está vacío.';
      return;
    }

    // Verifica que se haya seleccionado un método de pago
    if (!this.metodo) {
      this.error = 'Selecciona un método de pago.';
      return;
    }

    // Selecciona la ruta dependiendo del método de pago
    const ruta = this.metodo === 'Tarjeta'
      ? '/pago-tarjeta'
      : this.metodo === 'Transferencia'
        ? '/transferencia'
        : '/pago-efectivo';

    this.router.navigateByUrl(ruta);
  }
}