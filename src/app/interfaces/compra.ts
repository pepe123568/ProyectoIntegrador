export interface Compra {
  id: number;
  total: number;
  metodoPago: string;
  fecha: string;
  items: {
    nombre: string;
    cantidad: number;
    precio: number;
  }[];
}