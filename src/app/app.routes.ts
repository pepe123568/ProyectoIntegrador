import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'carga',
    pathMatch: 'full',
  },
  {
    path: 'carga',
    loadComponent: () => import('./pages/carga/carga.component').then((m) => m.CargaComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'direccion',
    loadComponent: () => import('./pages/direccion/direccion.page').then((m) => m.DireccionPage),
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage),
  },
  {
    path: 'cuenta',
    loadComponent: () => import('./pages/cuenta/cuenta.page').then((m) => m.CuentaPage),
  },
  {
    path: 'agendar-cita',
    loadComponent: () => import('./pages/agendar-cita/agendar-cita.page').then((m) => m.AgendarCitaPage),
  },
  {
    path: 'citas',
    loadComponent: () => import('./pages/citas/citas.page').then((m) => m.CitasPage),
  },
  {
    path: 'cita-exitosa',
    loadComponent: () => import('./pages/cita-exitosa/cita-exitosa.page').then((m) => m.CitaExitosaPage),
  },
  {
    path: 'detalle-cita',
    loadComponent: () => import('./pages/detalle-cita/detalle-cita.page').then((m) => m.DetalleCitaPage),
  },
  {
    path: 'tienda',
    loadComponent: () => import('./pages/tienda/tienda.page').then((m) => m.TiendaPage),
  },
  {
    path: 'producto',
    loadComponent: () => import('./pages/producto/producto.page').then((m) => m.ProductoPage),
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito.page').then((m) => m.CarritoPage),
  },
  {
    path: 'pago',
    loadComponent: () => import('./pages/pago/pago.page').then((m) => m.PagoPage),
  },
  {
    path: 'pago-tarjeta',
    loadComponent: () => import('./pages/pago-tarjeta/pago-tarjeta.page').then((m) => m.PagoTarjetaPage),
  },
  {
    path: 'pago-efectivo',
    loadComponent: () => import('./pages/pago-efectivo/pago-efectivo.page').then((m) => m.PagoEfectivoPage),
  },
  {
    path: 'transferencia',
    loadComponent: () => import('./pages/transferencia/transferencia.page').then((m) => m.TransferenciaPage),
  },
  {
    path: 'pago-exitoso',
    loadComponent: () => import('./pages/pago-exitoso/pago-exitoso.page').then((m) => m.PagoExitosoPage),
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./pages/pedidos/pedidos.page').then((m) => m.PedidosPage),
  },
  {
    path: 'sucursales',
    loadComponent: () => import('./pages/sucursales/sucursales.page').then((m) => m.SucursalesPage),
  },
  {
    path: 'soporte',
    loadComponent: () => import('./pages/soporte/soporte.page').then((m) => m.SoportePage),
  },
  {
    path: 'seguridad',
    loadComponent: () => import('./pages/seguridad/seguridad.page').then((m) => m.SeguridadPage),
  },
  {
    path: '**',
    redirectTo: 'carga',
    pathMatch: 'full',
  },
];