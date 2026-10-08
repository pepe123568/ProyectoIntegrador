import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  templateUrl: './agendar-cita.page.html',
  styleUrls: ['./agendar-cita.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class AgendarCitaPage {

  servicio = '';
  fecha = '';
  hora = '';
  notas = '';
  error = '';

  servicios = [
    'Consulta general',
    'Vacunación',
    'Desparasitación',
    'Control de peso'
  ];

  horarios = [
    '09:00',
    '10:00',
    '11:30',
    '13:00',
    '16:00',
    '17:30'
  ];

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  agendar() {

    this.error = '';

    // Verifica que los campos obligatorios estén completos
    if (!this.servicio || !this.fecha || !this.hora) {
      this.error = 'Selecciona servicio, fecha y horario.';
      return;
    }

    // Verifica el formato de la fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(this.fecha)) {
      this.error = 'La fecha debe contener un año de 4 dígitos.';
      return;
    }

    // Verifica que el año tenga 4 dígitos válidos
    const anio = Number(this.fecha.slice(0, 4));

    if (anio < 1000 || anio > 9999) {
      this.error = 'Ingresa un año válido de 4 dígitos.';
      return;
    }

    // Obtiene la fecha actual
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Convierte la fecha seleccionada
    const f = new Date(this.fecha + 'T00:00:00');

    // Verifica que sea una fecha válida
    if (Number.isNaN(f.getTime())) {
      this.error = 'Ingresa una fecha válida.';
      return;
    }

    // Evita seleccionar fechas anteriores a hoy
    if (f < hoy) {
      this.error = 'La fecha no puede estar en el pasado.';
      return;
    }

    // Los domingos no hay servicio
    if (f.getDay() === 0) {
      this.error = 'Los domingos no hay servicio.';
      return;
    }

    // Guarda la cita en el arreglo
    this.datos.agregarCita({
      servicio: this.servicio,
      fecha: this.fecha,
      hora: this.hora,
      notas: this.notas.trim() || 'Ninguna'
    });

    // Redirige a la pantalla de cita exitosa
    this.router.navigateByUrl('/cita-exitosa');
  }
}