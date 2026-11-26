/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { computed, Injectable, signal } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { from } from 'rxjs';

import { db, firebaseAuth } from './firebase';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly usuarioSignal = signal<string | null>(null);
  private readonly autenticadoSignal = signal(false);
  private readonly cargandoSignal = signal(true);

  readonly username = computed(() => this.usuarioSignal());
  readonly isAuthenticated = computed(() => this.autenticadoSignal());
  readonly cargandoSesion = this.cargandoSignal.asReadonly();

  constructor() {
    onAuthStateChanged(
      firebaseAuth,
      (usuario) => {
        this.usuarioSignal.set(usuario?.email ?? null);
        this.autenticadoSignal.set(usuario !== null);
        this.cargandoSignal.set(false);
      },
      () => {
        this.cargandoSignal.set(false);
      }
    );
  }

  // INICIAR SESIÓN
  login(correo: string, password: string) {
    return from(
      signInWithEmailAndPassword(
        firebaseAuth,
        correo,
        password
      )
    );
  }

  // REGISTRAR USUARIO
  registro(
    correo: string,
    password: string,
    nombre: string,
    apellidos: string
  ) {
    return from(
      this.crearUsuario(
        correo,
        password,
        nombre,
        apellidos
      )
    );
  }

  private async crearUsuario(
    correo: string,
    password: string,
    nombre: string,
    apellidos: string
  ) {
    const credencial = await createUserWithEmailAndPassword(
      firebaseAuth,
      correo,
      password
    );

    await updateProfile(credencial.user, {
      displayName: `${nombre} ${apellidos}`.trim()
    });

    return credencial;
  }

  // RECUPERAR CONTRASEÑA
  recuperarPassword(correo: string) {
    return from(
      sendPasswordResetEmail(
        firebaseAuth,
        correo
      )
    );
  }

  // OBTENER USUARIO ACTUAL
  obtenerUsuario() {
    return firebaseAuth.currentUser;
  }

  // CERRAR SESIÓN
  logout() {
    return from(
      signOut(firebaseAuth)
    );
  }
}
