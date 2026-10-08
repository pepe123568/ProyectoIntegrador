import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  templateUrl: './transferencia.page.html',
  styleUrls: ['./transferencia.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class TransferenciaPage {
  copiado = false;
  archivo = '';
  error = '';

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Simula que se copia el número
  copiar() {
    this.copiado = true;
  }

  // Obtiene el nombre del archivo seleccionado
  archivoSel(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    this.archivo = f?.name || '';
  }

  // Confirma el pago por transferencia
  confirmar() {
    if (!this.archivo) {
      this.error = 'Selecciona un comprobante para continuar.';
      return;
    }

    if (this.datos.comprar('Transferencia')) {
      this.router.navigateByUrl('/pago-exitoso');
    }
  }
}