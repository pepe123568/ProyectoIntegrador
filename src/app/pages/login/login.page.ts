import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class LoginPage {
  correo = '';
  contrasena = '';
  mensaje = '';
  mostrar = false;

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Inicia sesión
  entrar() {
    this.mensaje = '';

    // Verifica que los campos estén completos
    if (!this.correo.trim() || !this.contrasena) {
      this.mensaje = 'Completa correo y contraseña.';
      return;
    }

    // Verifica que el correo sea válido
    if (!/^\S+@\S+\.\S+$/.test(this.correo)) {
      this.mensaje = 'Ingresa un correo válido.';
      return;
    }

    // Verifica las credenciales
    this.datos.login(this.correo, this.contrasena)
      ? this.router.navigateByUrl('/home')
      : this.mensaje = 'Correo o contraseña incorrectos.';
  }

  // Ingresa con la cuenta de prueba
  demo() {
    this.correo = 'correo@ejemplo.com';
    this.contrasena = '1234';
    this.entrar();
  }
}