import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Unsubscribe
} from 'firebase/firestore';

import { db } from './firebase';

export interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: 'compra' | 'cita' | 'pedido' | 'general';
  leida: boolean;
  fecha?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  [x: string]: any;

  escuchar(
    usuarioId: string,
    callback: (datos: Notificacion[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const consulta = query(
      collection(db, 'notificaciones'),
      where('usuarioId', '==', usuarioId),
      orderBy('fecha', 'desc')
    );

    return onSnapshot(
      consulta,
      snapshot => {
        const datos = snapshot.docs.map(documento => ({
          id: documento.id,
          ...documento.data()
        } as Notificacion));

        callback(datos);
      },
      error => onError?.(error)
    );
  }

  async crear(
    datos: Omit<Notificacion, 'id' | 'fecha'>
  ): Promise<void> {
    await addDoc(collection(db, 'notificaciones'), {
      ...datos,
      fecha: serverTimestamp()
    });
  }
}