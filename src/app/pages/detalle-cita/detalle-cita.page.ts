import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-detalle-cita',
  standalone: true,
  templateUrl: './detalle-cita.page.html',
  styleUrls: ['./detalle-cita.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class DetalleCitaPage {

  nuevaFecha = '';
  nuevaHora = '';
  reprogramando = false;
  mensaje = '';

  constructor(
    public datos: DatosService,
    private router: Router
  ){}

  // Cancela la cita seleccionada
  cancelar() {

    const c = this.datos.citaSeleccionada;

    if (c && confirm('¿Deseas cancelar esta cita?')) {

      this.datos.cancelarCita(c.id);
      this.mensaje = 'Cita cancelada.';

    }

  }

  // Reprograma la fecha y hora de la cita seleccionada
  reprogramar() {

    const c = this.datos.citaSeleccionada;

    // Verifica que exista una cita y que se hayan ingresado los nuevos datos
    if (!c || !this.nuevaFecha || !this.nuevaHora) {

      this.mensaje = 'Selecciona nueva fecha y hora.';
      return;
    }

    // Actualiza la cita
    this.datos.reprogramarCita(
      c.id,
      this.nuevaFecha,
      this.nuevaHora
    );

    this.reprogramando = false;
    this.mensaje = 'Cita reprogramada.';
  }
}