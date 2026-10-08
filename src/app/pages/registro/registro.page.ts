import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class RegistroPage {
  nombres = '';
  apellidos = '';
  correo = '';
  contrasena = '';
  confirmar = '';
  telefono = '';
  error = '';

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Valida los datos y continúa con el registro
  siguiente() {
    this.error = '';

    // Verifica nombre y apellidos
    if (
      !this.nombres.trim() ||
      this.nombres.trim().length < 2 ||
      !this.apellidos.trim()
    ) {
      this.error = 'Ingresa tu nombre y apellidos.';
      return;
    }

    // Verifica el correo electrónico
    if (!/^\S+@\S+\.\S+$/.test(this.correo)) {
      this.error = 'Ingresa un correo electrónico válido.';
      return;
    }

    // Verifica que el correo no esté registrado
    if (this.datos.correoExiste(this.correo)) {
      this.error = 'Ese correo ya está registrado.';
      return;
    }

    // Verifica la longitud de la contraseña
    if (this.contrasena.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Verifica que las contraseñas coincidan
    if (this.contrasena !== this.confirmar) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    // Verifica el número de teléfono
    if (!/^[0-9 ()+\-]{10,20}$/.test(this.telefono)) {
      this.error = 'Ingresa un teléfono válido de al menos 10 dígitos.';
      return;
    }

    // Guarda temporalmente los datos del registro
    this.datos.guardarBorrador({
      nombres: this.nombres.trim(),
      apellidos: this.apellidos.trim(),
      correo: this.correo.trim(),
      contrasena: this.contrasena,
      telefono: this.telefono.trim()
    });

    // Continúa con la dirección
    this.router.navigateByUrl('/direccion');
  }
}