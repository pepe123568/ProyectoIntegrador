import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  templateUrl: './citas.page.html',
  styleUrls: ['./citas.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class CitasPage {

  tab = 'proximas';

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Filtra las citas dependiendo de la pestaña seleccionada
  get lista() {

    return this.datos.citas.filter(
      c =>
        this.tab === 'proximas'
          ? c.estado === 'Próxima'
          : c.estado !== 'Próxima'
    );

  }

  // Selecciona una cita y abre su información
  abrir(c: any) {

    this.datos.seleccionarCita(c);

    this.router.navigateByUrl('/detalle-cita');

  }

}