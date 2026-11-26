
import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';

import { firebaseAuth, db } from './firebase';

export interface Mascota {
  id?: string;
  usuarioId: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  edad: number;
  peso: number;
}

@Injectable({
  providedIn: 'root'
})
export class MascotasService {

  async agregarMascota(
    datos: Omit<Mascota, 'id' | 'usuarioId'>
  ): Promise<void> {

    await firebaseAuth.authStateReady();

    const usuario = firebaseAuth.currentUser;

    if (!usuario) {
      throw new Error('Debes iniciar sesión.');
    }

    const referencia = await addDoc(
      collection(db, 'mascotas'),
      {
        ...datos,
        usuarioId: usuario.uid,
        fechaRegistro: serverTimestamp()
      }
    );

    console.log('Mascota registrada:', referencia.id);
  }

  escucharMascotas(
    callback: (mascotas: Mascota[]) => void,
    errorCallback: (error: Error) => void
  ): Unsubscribe {

    const usuario = firebaseAuth.currentUser;

    if (!usuario) {
      throw new Error('No hay una sesión activa.');
    }

    const consulta = query(
      collection(db, 'mascotas'),
      where('usuarioId', '==', usuario.uid)
    );

    return onSnapshot(
      consulta,
      resultado => {
        const mascotas = resultado.docs.map(
          documento => ({
            ...documento.data(),
            id: documento.id
          } as Mascota)
        );

        callback(mascotas);
      },
      errorCallback
    );
  }

  async eliminarMascota(id: string): Promise<void> {

    await firebaseAuth.authStateReady();

    const usuario = firebaseAuth.currentUser;

    if (!usuario) {
      throw new Error('Debes iniciar sesión.');
    }

    const referencia = doc(db, 'mascotas', id);
    const resultado = await getDoc(referencia);

    if (
      !resultado.exists() ||
      resultado.data()['usuarioId'] !== usuario.uid
    ) {
      throw new Error(
        'No tienes permiso para eliminar esta mascota.'
      );
    }

    await deleteDoc(referencia);
  }
}
