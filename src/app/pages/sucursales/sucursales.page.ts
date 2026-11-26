import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  IonBackButton,
  IonBadge,
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
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  callOutline,
  locationOutline,
  navigateOutline,
  storefrontOutline,
  timeOutline
} from 'ionicons/icons';

export interface SucursalVetKamur {
  id: string;
  nombre: string;
  zona: string;
  direccion: string;
  horario: string;
  telefono: string;
  abierta: boolean;
  mapsUrl: string;
}

@Component({
  selector: 'app-sucursales',
  standalone: true,
  templateUrl: './sucursales.page.html',
  styleUrls: ['./sucursales.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonButton
  ]
})
export class SucursalesPage {
  readonly terminoBusqueda = signal('');

  readonly sucursales = signal<SucursalVetKamur[]>([
    {
      id: 'suc-centro',
      nombre: 'VetKamur Matriz Centro',
      zona: 'Córdoba, Veracruz',
      direccion: 'Av. 1 #312, Col. Centro, C.P. 94500',
      horario: 'Lun a Sáb: 9:00 AM - 8:00 PM | Dom: 10:00 AM - 3:00 PM',
      telefono: '2717123456',
      abierta: true,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cordoba+Veracruz+Centro'
    },
    {
      id: 'suc-alameda',
      nombre: 'VetKamur Alameda',
      zona: 'Córdoba, Veracruz',
      direccion: 'Calle 22 #1105, Col. Alameda, C.P. 94580',
      horario: 'Lun a Sáb: 9:30 AM - 7:30 PM',
      telefono: '2717148920',
      abierta: true,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Alameda+Cordoba+Veracruz'
    },
    {
      id: 'suc-fortin',
      nombre: 'VetKamur Fortín',
      zona: 'Fortín de las Flores, Veracruz',
      direccion: 'Av. 1 Poniente #104, Centro, C.P. 94470',
      horario: 'Lun a Sáb: 9:00 AM - 7:00 PM',
      telefono: '2717135678',
      abierta: true,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Fortin+de+las+Flores+Veracruz'
    }
  ]);

  readonly sucursalesFiltradas = computed(() => {
    const filtro = this.terminoBusqueda().trim().toLowerCase();
    if (!filtro) {
      return this.sucursales();
    }
    return this.sucursales().filter(
      (s) =>
        s.nombre.toLowerCase().includes(filtro) ||
        s.zona.toLowerCase().includes(filtro) ||
        s.direccion.toLowerCase().includes(filtro)
    );
  });

  constructor() {
    addIcons({
      storefrontOutline,
      locationOutline,
      timeOutline,
      callOutline,
      navigateOutline
    });
  }

  alBuscar(event: CustomEvent): void {
    const valor = (event.detail?.value as string) ?? '';
    this.terminoBusqueda.set(valor);
  }
}