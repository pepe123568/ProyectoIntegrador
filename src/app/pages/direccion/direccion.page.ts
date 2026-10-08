import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-direccion',
  standalone: true,
  templateUrl: './direccion.page.html',
  styleUrls: ['./direccion.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class DireccionPage {

  cp = '';
  ciudad = '';
  colonia = '';
  calle = '';
  exterior = '';
  interior = '';
  error = '';

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Crea la cuenta con los datos del registro y la dirección
  crear() {

    this.error = '';

    // Verifica que primero se hayan completado los datos de registro
    if (!this.datos.registroBorrador) {

      this.error = 'Primero completa tus datos de registro.';
      return;

    }

    // Verifica que el código postal tenga exactamente 5 dígitos
    if (!/^\d{5}$/.test(this.cp)) {

      this.error = 'El código postal debe tener 5 dígitos.';
      return;

    }

    // Verifica que los campos obligatorios estén completos
    if (
      !this.ciudad.trim() ||
      !this.colonia.trim() ||
      !this.calle.trim() ||
      !this.exterior.trim()
    ) {

      this.error = 'Completa todos los campos obligatorios.';
      return;

    }

    // Finaliza el registro del usuario
    if (
      this.datos.finalizarRegistro({
        cp: this.cp,
        ciudad: this.ciudad.trim(),
        colonia: this.colonia.trim(),
        calle: this.calle.trim(),
        numeroExterior: this.exterior.trim(),
        numeroInterior: this.interior.trim() || undefined
      })
    ) {

      // Redirige al inicio
      this.router.navigateByUrl('/home');

    }

  }

}