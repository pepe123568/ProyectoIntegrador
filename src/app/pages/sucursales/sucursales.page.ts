import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  templateUrl: './sucursales.page.html',
  styleUrls: ['./sucursales.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class SucursalesPage {
  busqueda = '';

  constructor(
    public datos: DatosService
  ) {}

  // Filtra las sucursales según la búsqueda
  get lista() {
    const q = this.busqueda.toLowerCase().trim();

    return this.datos.sucursales.filter(
      s =>
        !q ||
        (s.nombre + ' ' + s.direccion)
          .toLowerCase()
          .includes(q)
    );
  }
}