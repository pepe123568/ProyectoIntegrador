import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class CuentaPage {

  editando = false;
  mensaje = '';

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Guarda los cambios realizados en la información
  guardar() {

    this.editando = false;

    this.mensaje = 'Información actualizada.';

  }

  // Cierra la sesión del usuario
  salir() {

    this.datos.logout();

    this.router.navigateByUrl('/login');

  }

}