import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import type {
  AbstractControl,
  ValidationErrors} from '@angular/forms';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  callOutline,
  checkmarkCircleOutline,
  helpCircleOutline,
  logoWhatsapp,
  sendOutline
} from 'ionicons/icons';

import { db, firebaseAuth } from '../../services/firebase';

function noSoloEspacios(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '');
  if (valor.length > 0 && valor.trim().length === 0) {
    return { soloEspacios: true };
  }
  return null;
}

@Component({
  selector: 'app-soporte',
  standalone: true,
  templateUrl: './soporte.page.html',
  styleUrls: ['./soporte.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonSpinner
  ]
})
export class SoportePage {
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  readonly telefonoSoporte = '2717123456';
  readonly whatsappUrl =
    'https://wa.me/522717123456?text=Hola%20VetKamur,%20necesito%20ayuda%20con%20mi%20cuenta%20o%20pedido.';

  readonly preguntasFrecuentes = [
    {
      valor: 'faq-1',
      pregunta: '¿Cuánto tarda en llegar mi pedido?',
      respuesta:
        'Las entregas locales en Córdoba y Fortín se realizan el mismo día o en un máximo de 24 horas hábiles tras confirmar tu pago.'
    },
    {
      valor: 'faq-2',
      pregunta: '¿Cómo consulto el estado de mi compra?',
      respuesta:
        'Entra a tu Perfil y selecciona "Mis pedidos" para revisar el folio, los productos adquiridos y el estatus actualizado.'
    },
    {
      valor: 'faq-3',
      pregunta: '¿Es seguro pagar con tarjeta en la app?',
      respuesta:
        'Sí. Los pagos se procesan mediante Mercado Pago con encriptación directa; VetKamur nunca almacena los datos completos de tu tarjeta.'
    },
    {
      valor: 'faq-4',
      pregunta: '¿Puedo cambiar mi dirección de entrega?',
      respuesta:
        'Puedes actualizar tu domicilio en cualquier momento desde Perfil → Dirección de entrega antes de confirmar tu compra.'
    }
  ];

  readonly formulario = new FormGroup({
    motivo: new FormControl('pedido', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    asunto: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, noSoloEspacios, Validators.minLength(4)]
    }),
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, noSoloEspacios, Validators.minLength(10)]
    })
  });

  constructor() {
    addIcons({
      logoWhatsapp,
      callOutline,
      helpCircleOutline,
      sendOutline,
      alertCircleOutline,
      checkmarkCircleOutline
    });
  }

  async enviarConsulta(): Promise<void> {
    this.error.set('');
    this.exito.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa el asunto y describe tu consulta con al menos 10 caracteres.');
      return;
    }

    this.enviando.set(true);

    try {
      const usuario = firebaseAuth.currentUser;
      const datos = this.formulario.getRawValue();

      await addDoc(collection(db, 'soporte_tickets'), {
        uid: usuario?.uid || 'invitado',
        correo: usuario?.email || 'sin-correo',
        motivo: datos.motivo,
        asunto: datos.asunto.trim(),
        mensaje: datos.mensaje.trim(),
        estado: 'abierto',
        fechaCreacion: serverTimestamp()
      });

      this.formulario.reset({
        motivo: 'pedido',
        asunto: '',
        mensaje: ''
      });
      this.exito.set('Tu mensaje fue enviado. Nuestro equipo te responderá a la brevedad.');
    } catch (err) {
      console.error('Error al enviar ticket de soporte:', err);
      this.error.set('No se pudo enviar tu consulta. Inténtalo nuevamente o contáctanos por WhatsApp.');
    } finally {
      this.enviando.set(false);
    }
  }
}