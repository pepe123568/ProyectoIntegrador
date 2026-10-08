import { Injectable } from '@angular/core';
import { Usuario, Direccion } from '../interfaces/usuario';
import { Cita } from '../interfaces/cita';
import { HistorialMedico } from '../interfaces/historial-medico';
import { Sucursal } from '../interfaces/sucursal';
import { Producto, ItemCarrito } from '../interfaces/producto';
import { Compra } from '../interfaces/compra';

@Injectable({providedIn:'root'})

export class DatosService 
{
    usuarios:Usuario[]=[{
        id:1,
        nombres:'Cliente',
        apellidos:'Kamur',
        correo:'correo@ejemplo.com',
        contrasena:'1234',
        telefono:'271 123 4567',
        direccion:{
            cp:'94500',
            ciudad:'Córdoba',
            colonia:'Centro',
            calle:'Av. Principal',
            numeroExterior:'123'
        }
    }];
    
    usuarioActual:Usuario|undefined;
    
    registroBorrador:Omit<Usuario,'id'|'direccion'>|undefined;
    
    citas:Cita[]=[
    {
        id:1,
        servicio:'Consulta general',
        fecha:'2026-10-15',
        hora:'10:00',
        notas:'Ninguna',
        estado:'Próxima',
        veterinario:'Dr. Juan Pérez'
    },
    {
        id:2,
        servicio:'Vacunación',
        fecha:'2026-10-28',
        hora:'16:00',
        notas:'Refuerzo anual',
        estado:'Próxima',
        veterinario:'Dra. Andrea Ruiz'
    },
    {
        id:3,
        servicio:'Control de peso',
        fecha:'2026-08-12',
        hora:'12:30',
        notas:'Seguimiento',
        estado:'Completada',
        veterinario:'Dr. Juan Pérez'
    }
    ];
    
    ultimaCita:Cita|undefined;

    historiales:HistorialMedico[]=[
    {id:1,
        tipo:'Consulta general',
        fecha:'2026-08-12',
        veterinario:'Dr. Juan Pérez',
        diagnostico:'Revisión general, buen estado de salud',
        tratamiento:'Ninguno.',
        observaciones:'Próxima revisión en 6 meses.'
    },
    {id:2,
        tipo:'Vacunación',
        fecha:'2026-03-10',
        veterinario:'Dra. Andrea Ruiz',
        diagnostico:'Esquema preventivo al corriente',
        tratamiento:'Aplicación de vacuna',
        observaciones:'Sin reacciones.'
    },
    {id:3,
        tipo:'Desparasitación',
        fecha:'2026-03-10',
        veterinario:'Dr. Juan Pérez',
        diagnostico:'Control preventivo',
        tratamiento:'Desparasitante',
        observaciones:'Seguimiento habitual.'
    }];
    
    sucursales:Sucursal[]=[
    {id:1,
        nombre:'Sucursal Cuitláhuac',
        direccion:'Av. 5 #123',
        distancia:'1.2 km',
        telefono:'271 123 4567',
        horario:'Lun-Sáb · 9:00–19:00'
    },
    {id:2,
        nombre:'Sucursal Córdoba',
        direccion:'Calle Los Pinos #45',
        distancia:'3.8 km',
        telefono:'271 234 5678',
        horario:'Lun-Sáb · 9:00–19:00'
    },
    {id:3,
        nombre:'Sucursal Potrero Nuevo',
        direccion:'Av. Principal #210',
        distancia:'5.4 km',
        telefono:'271 345 6789',
        horario:'Lun-Sáb · 10:00–18:00'
    }];

    productos:Producto[]=[
    {id:1,
        nombre:'Alimento seco premium',
        categoria:'Alimento',
        precio:350,
        imagen:'assets/imagenes/producto-alimento.svg',
        descripcion:'Alimento completo para perro adulto, formulado para una dieta balanceada y de uso diario.',
        badge:'Más vendido'
    },
    {id:2,
        nombre:'Shampoo dermatológico',
        categoria:'Higiene',
        precio:180,
        imagen:'assets/imagenes/producto-shampoo.svg',
        descripcion:'Shampoo suave para limpieza frecuente. Ayuda a mantener el pelaje limpio y brillante.'
    },
    {id:3,
        nombre:'Desparasitante veterinario',
        categoria:'Medicamentos',
        precio:270,
        imagen:'assets/imagenes/producto-desparasitante.svg',
        descripcion:'Producto de control antiparasitario. Consulta a tu veterinario para la dosis adecuada.'
    },
    {id:4,
        nombre:'Pasta dental para mascotas (50 ml)',
        categoria:'Higiene',
        precio:80,
        imagen:'assets/imagenes/producto-pasta-dental.svg',
        descripcion:'Pasta dental diseñada para la higiene bucal de perros y gatos.'
    },
    {id:5,
        nombre:'Kit de paseo',
        categoria:'Accesorios',
        precio:240,
        imagen:'assets/imagenes/producto-paseo.svg',
        descripcion:'Set práctico para paseo compuesto por correa ajustable y accesorio porta-bolsas.'
    },
    {id:6,
        nombre:'Premios de entrenamiento',
        categoria:'Alimento',
        precio:120,
        imagen:'assets/imagenes/producto-premios.svg',
        descripcion:'Bocadillos pequeños ideales como refuerzo durante sesiones de entrenamiento.'
    }];
    
    carrito:ItemCarrito[]=[]; 
    compras:Compra[]=[]; 
    productoSeleccionado:Producto|undefined; 
    citaSeleccionada:Cita|undefined; 
    historialSeleccionado:HistorialMedico|undefined;

    login(correo:string,contrasena:string)
    {const e=correo.trim().toLowerCase();
        this.usuarioActual=this.usuarios.find(u=>u.correo.toLowerCase()===e&&u.contrasena===contrasena);
        return !!this.usuarioActual;
    }

    logout(){this.usuarioActual=undefined;}

    correoExiste(c:string)
    {
        return this.usuarios.some(u=>u.correo.toLowerCase()===c.trim().toLowerCase());
    }
    
    guardarBorrador(u:Omit<Usuario,'id'|'direccion'>){this.registroBorrador=u;}

    finalizarRegistro(direccion:Direccion)
    {
        if(!this.registroBorrador)
            return false;
        const nuevo:Usuario={...this.registroBorrador,
            id:this.siguienteId(this.usuarios),direccion};
            this.usuarios.push(nuevo);
            this.usuarioActual=nuevo;
            this.registroBorrador=undefined;
            return true;
    }
    
    actualizarUsuario(datos:Partial<Usuario>)
    {
        if(!this.usuarioActual)
            return;
        Object.assign(this.usuarioActual,datos);
    }

    agregarCita(data:Omit<Cita,'id'|'estado'|'veterinario'>)
    {
        const c:Cita={...data,
            id:this.siguienteId(this.citas),
            estado:'Próxima',
            veterinario:'Dr. Juan Pérez'};
            this.citas.push(c);
            this.ultimaCita=c;
            return c;
    }

    reprogramarCita(id:number,fecha:string,hora:string)
    {
        const c=this.citas.find(x=>x.id===id);
        if(c)
            {
                c.fecha=fecha;
                c.hora=hora;
                c.estado='Próxima';
            }
    }
    
    cancelarCita(id:number)
    {
        const c=this.citas.find(x=>x.id===id);
        if(c)c.estado='Cancelada';
    }
    
    seleccionarCita(c:Cita)
    {
        this.citaSeleccionada=c
    }

    seleccionarHistorial(h:HistorialMedico)
    {
        this.historialSeleccionado=h;
    }
    
    seleccionarProducto(p:Producto)
    {
        this.productoSeleccionado=p;
    }
    
    agregarCarrito(p:Producto,cantidad=1)
    {
        if(cantidad<1)return;
        const item=this.carrito.find(i=>i.producto.id===p.id);
        item?item.cantidad+=cantidad:this.carrito.push({producto:p,cantidad});
    }

    cambiarCantidad(id:number,cambio:number)
    {
        const i=this.carrito.find(x=>x.producto.id===id);
        if(i)i.cantidad=Math.max(1,i.cantidad+cambio);
    }
    
    eliminarCarrito(id:number)
    {
        const i=this.carrito.findIndex(x=>x.producto.id===id);
        if(i>=0)this.carrito.splice(i,1);
    }

    total()
    {
        return this.carrito.reduce((s,i)=>s+i.producto.precio*i.cantidad,0);
    }
    comprar(metodoPago:string)
    {
        if(!this.carrito.length)return false;
        this.compras.unshift({
            id:this.siguienteId(this.compras),
            total:this.total(),
            metodoPago,
            fecha:new Date().toISOString(),
            items:this.carrito.map(i=>({
                nombre:i.producto.nombre,
                cantidad:i.cantidad,
                precio:i.producto.precio}))
            });
            this.carrito.splice(0);return true;
    }
    private siguienteId(a:{id:number}[])
    {
        return a.length?Math.max(...a.map(x=>x.id))+1:1;
    }
}
