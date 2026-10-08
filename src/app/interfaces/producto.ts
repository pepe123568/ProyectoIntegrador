export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  imagen: string;
  badge?: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}