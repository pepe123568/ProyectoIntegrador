import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonContent, IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-producto',
  standalone: true,
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  imports: [
    IonIcon, IonContent,
    IonGrid, IonCard, IonText, IonNote, IonLabel, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea, IonImg, IonList, IonItem, IonHeader, IonFooter,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class ProductoPage {
  cantidad = 1;
  mensaje = '';

  constructor(
    public datos: DatosService,
    private router: Router
  ) {}

  // Agrega el producto seleccionado al carrito
  add() {
    const p = this.datos.productoSeleccionado;

    if (!p) return;

    this.datos.agregarCarrito(p, this.cantidad);
    this.mensaje = 'Producto agregado al carrito.';
  }

  // Agrega el producto y abre el carrito
  comprar() {
    this.add();
    this.router.navigateByUrl('/carrito');
  }
}