export interface Direccion {
  cp: string;
  ciudad: string;
  colonia: string;
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
}

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  telefono: string;
  direccion?: Direccion;
}