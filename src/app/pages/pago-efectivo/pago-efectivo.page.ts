import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-pago-efectivo',
  standalone: true,
  templateUrl: './pago-efectivo.page.html',
  styleUrls: ['./pago-efectivo.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class PagoEfectivoPage {
  generado = false;

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Genera el pago en efectivo
  generar() {
    if (this.datos.comprar('Efectivo')) {
      this.generado = true;
    }
  }
}