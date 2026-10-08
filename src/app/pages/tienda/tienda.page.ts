import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-tienda',
  standalone: true,
  templateUrl: './tienda.page.html',
  styleUrls: ['./tienda.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class TiendaPage {
  busqueda = '';
  categoria = 'Todas';

  categorias = [
    'Todas',
    'Accesorios',
    'Medicamentos',
    'Higiene',
    'Alimento'
  ];

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Filtra los productos por categoría y búsqueda
  get lista() {
    const q = this.busqueda.toLowerCase().trim();

    return this.datos.productos.filter(
      p =>
        (this.categoria === 'Todas' || p.categoria === this.categoria) &&
        (!q || p.nombre.toLowerCase().includes(q))
    );
  }

  // Selecciona un producto y abre sus detalles
  abrir(p: any) {
    this.datos.seleccionarProducto(p);
    this.router.navigateByUrl('/producto');
  }

  // Agrega un producto al carrito
  add(p: any, e: Event) {
    e.stopPropagation();
    this.datos.agregarCarrito(p);
  }
}