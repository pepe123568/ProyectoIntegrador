export interface Cita {
  id: number;
  servicio: string;
  fecha: string;
  hora: string;
  notas: string;
  estado: 'Próxima' | 'Completada' | 'Cancelada';
  veterinario: string;
}