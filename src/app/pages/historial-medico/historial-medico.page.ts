import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-historial-medico',
  standalone: true,
  templateUrl: './historial-medico.page.html',
  styleUrls: ['./historial-medico.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class HistorialMedicoPage {

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Selecciona un registro del historial y abre sus detalles
  abrir(h: any) {

    this.datos.seleccionarHistorial(h);

    this.router.navigateByUrl('/detalle-medico');

  }

}