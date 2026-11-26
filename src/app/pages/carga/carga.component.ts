
import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { firebaseAuth } from '../../services/firebase';

@Component({
  selector: 'app-carga',
  standalone: true,
  imports: [],
  templateUrl: './carga.component.html',
  styleUrl: './carga.component.scss'
})
export class CargaComponent implements OnInit {

  private router = inject(Router);

  async ngOnInit(): Promise<void> {

    try {
      // Esperar a que Firebase restaure la sesión
      await firebaseAuth.authStateReady();

      // Comprobar si existe un usuario autenticado
      const usuario = firebaseAuth.currentUser;

      if (usuario) {

        // Sesión iniciada: ir directamente a Inicio
        await this.router.navigateByUrl('/inicio', {
          replaceUrl: true
        });

      } else {

        // Sin sesión: mostrar Login
        await this.router.navigateByUrl('/login', {
          replaceUrl: true
        });

      }

    } catch (error) {

      console.error('Error al verificar la sesión:', error);

      await this.router.navigateByUrl('/login', {
        replaceUrl: true
      });

    }
  }
}
