import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

import { UsuariosService } from '../services/UsuariosService';
import { ProveedoresService } from '../services/ProveedoresService';
import { LicitacionesService } from '../services/LicitacionesService';
import { AdjudicacionesService } from '../services/AdjudicacionesService';
import { AlertasService } from '../services/AlertasService';

import { LoggerUtils } from '../utils/LoggerUtils';

export class MenuPrincipal {
  private rl = readline.createInterface({ input, output });

  private usuariosService = new UsuariosService();
  private proveedoresService = new ProveedoresService();
  private licitacionesService = new LicitacionesService();
  private adjudicacionesService = new AdjudicacionesService();
  private alertasService = new AlertasService();

  private async preguntar(texto: string): Promise<string> {
    this.rl.resume();
    const respuesta = await this.rl.question(texto);
    return respuesta.trim();
  }

  private async esperarTecla(): Promise<void> {
    await this.preguntar('\n Presione [ENTER] para continuar...');
  }

  public async iniciar(): Promise<void> {
    let salir = false;

    while (!salir) {
      console.clear();
      console.log('========================================');
      console.log('       SISTEMA GOVTRACE - MENU MAIN      ');
      console.log('========================================');
      console.log('1. Gestión de Usuarios');
      console.log('2. Gestión de Proveedores');
      console.log('3. Gestión de Licitaciones');
      console.log('4. Gestión de Adjudicaciones');
      console.log('5. Gestión de Alertas');
      console.log('0. Salir');
      console.log('========================================');

      const opcion = await this.preguntar('Seleccione una opción: ');

      switch (opcion) {
        case '1':
          await this.menuUsuarios();
          break;
        case '2':
          await this.menuProveedores();
          break;
        case '3':
          await this.menuLicitaciones();
          break;
        case '4':
          await this.menuAdjudicaciones();
          break;
        case '5':
          await this.menuAlertas();
          break;
        case '0':
          console.log('\nCerrando sesión en GovTrace... ¡Hasta luego!');
          salir = true;
          this.rl.close();
          process.exit(0);
          break;
        default:
          console.log('\nOpción inválida. Intente de nuevo.');
          await this.esperarTecla();
      }
    }
  }

  private async menuUsuarios(): Promise<void> {
    let volver = false;
    while (!volver) {
      console.clear();
      console.log('--- GESTIÓN DE USUARIOS ---');
      console.log('1. Listar Usuarios');
      console.log('2. Buscar Usuario por ID');
      console.log('3. Registrar Usuario');
      console.log('4. Actualizar Usuario');
      console.log('5. Eliminar Usuario');
      console.log('0. Volver al Menú Principal');

      const op = await this.preguntar('Opción: ');
      try {
        if (op === '1') {
          console.log('\n--- LISTA DE USUARIOS ---');
          const lista = await this.usuariosService.listarUsuarios();
          console.table(lista);
          await this.esperarTecla();
        } else if (op === '2') {
          const id = await this.preguntar('Ingrese ID: ');
          const u = await this.usuariosService.obtenerUsuarioPorId(Number(id));
          console.log('\nResultado:');
          console.table(u ? [u] : []);
          await this.esperarTecla();
        } else if (op === '3') {
          const nombre = await this.preguntar('Nombre: ');
          const email = await this.preguntar('Email: ');
          const password = await this.preguntar('Password: ');
          const rolInput = await this.preguntar('Rol (ADMIN/AUDITOR/CIUDADANO): ');

          const rol = (rolInput.toUpperCase() as any) || 'CIUDADANO';
          const nuevo = await this.usuariosService.registrarUsuario({ nombre, email, password, rol });
          console.log('\n Usuario creado exitosamente:', nuevo);
          await this.esperarTecla();
        } else if (op === '4') {
          const id = await this.preguntar('Ingrese ID del Usuario a actualizar: ');
          const existente = await this.usuariosService.obtenerUsuarioPorId(Number(id));
          if (!existente) {
            console.log('\n Usuario no encontrado.');
          } else {
            console.log('*(Presione ENTER para mantener el valor actual)*');
            const nombre = await this.preguntar(`Nuevo Nombre [${existente.nombre}]: `);
            const email = await this.preguntar(`Nuevo Email [${existente.email}]: `);
            const rolInput = await this.preguntar(`Nuevo Rol [${existente.rol}]: `);

            const actualizado = await this.usuariosService.actualizarUsuario(Number(id), {
              nombre: nombre || existente.nombre,
              email: email || existente.email,
              rol: (rolInput.toUpperCase() as any) || existente.rol,
            });
            console.log('\n Usuario actualizado exitosamente:', actualizado);
          }
          await this.esperarTecla();
        } else if (op === '5') {
          const id = await this.preguntar('Ingrese ID del Usuario a eliminar: ');
          const conf = await this.preguntar(`¿Confirmar eliminación del usuario ID ${id}? (s/n): `);
          if (conf.toLowerCase() === 's') {
            await this.usuariosService.eliminarUsuario(Number(id));
            console.log('\n Usuario eliminado correctamente.');
          } else {
            console.log('\nOperación cancelada.');
          }
          await this.esperarTecla();
        } else if (op === '0') {
          volver = true;
        } else {
          console.log('\nOpción inválida.');
          await this.esperarTecla();
        }
      } catch (error: any) {
        LoggerUtils.error(error.message);
        await this.esperarTecla();
      }
    }
  }

  private async menuProveedores(): Promise<void> {
    let volver = false;
    while (!volver) {
      console.clear();
      console.log('--- GESTIÓN DE PROVEEDORES ---');
      console.log('1. Listar Proveedores');
      console.log('2. Buscar Proveedor por ID');
      console.log('3. Registrar Proveedor');
      console.log('4. Actualizar Proveedor');
      console.log('5. Eliminar Proveedor');
      console.log('0. Volver al Menú Principal');

      const op = await this.preguntar('Opción: ');
      try {
        if (op === '1') {
          console.log('\n--- LISTA DE PROVEEDORES ---');
          const lista = await this.proveedoresService.listarProveedores();
          console.table(lista);
          await this.esperarTecla();
        } else if (op === '2') {
          const id = await this.preguntar('Ingrese ID: ');
          const p = await this.proveedoresService.obtenerProveedorPorId(Number(id));
          console.log('\nResultado:');
          console.table(p ? [p] : []);
          await this.esperarTecla();
        } else if (op === '3') {
          const nit = await this.preguntar('NIT: ');
          const razon_social = await this.preguntar('Razón Social: ');
          const email = await this.preguntar('Email: ');
          const calificacion = await this.preguntar('Calificación (0.00 - 5.00): ');

          const nuevo = await this.proveedoresService.registrarProveedor({
            nit,
            razon_social,
            email,
            calificacion: Number(calificacion) || 5.0,
          });
          console.log('\n Proveedor registrado:', nuevo);
          await this.esperarTecla();
        } else if (op === '4') {
          const id = await this.preguntar('Ingrese ID del Proveedor a actualizar: ');
          const existente = await this.proveedoresService.obtenerProveedorPorId(Number(id));
          if (!existente) {
            console.log('\n Proveedor no encontrado.');
          } else {
            console.log('*(Presione ENTER para mantener el valor actual)*');
            const nit = await this.preguntar(`Nuevo NIT [${existente.nit}]: `);
            const razon_social = await this.preguntar(`Nueva Razón Social [${existente.razon_social}]: `);
            const email = await this.preguntar(`Nuevo Email [${existente.email}]: `);
            const calificacion = await this.preguntar(`Nueva Calificación [${existente.calificacion}]: `);

            const actualizado = await this.proveedoresService.actualizarProveedor(Number(id), {
              nit: nit || existente.nit,
              razon_social: razon_social || existente.razon_social,
              email: email || existente.email,
              calificacion: calificacion ? Number(calificacion) : existente.calificacion,
            });
            console.log('\n Proveedor actualizado:', actualizado);
          }
          await this.esperarTecla();
        } else if (op === '5') {
          const id = await this.preguntar('Ingrese ID del Proveedor a eliminar: ');
          const conf = await this.preguntar(`¿Confirmar eliminación del proveedor ID ${id}? (s/n): `);
          if (conf.toLowerCase() === 's') {
            await this.proveedoresService.eliminarProveedor(Number(id));
            console.log('\n Proveedor eliminado correctamente.');
          } else {
            console.log('\nOperación cancelada.');
          }
          await this.esperarTecla();
        } else if (op === '0') {
          volver = true;
        } else {
          console.log('\nOpción inválida.');
          await this.esperarTecla();
        }
      } catch (error: any) {
        LoggerUtils.error(error.message);
        await this.esperarTecla();
      }
    }
  }

  private async menuLicitaciones(): Promise<void> {
    let volver = false;
    while (!volver) {
      console.clear();
      console.log('--- GESTIÓN DE LICITACIONES ---');
      console.log('1. Listar Licitaciones');
      console.log('2. Buscar Licitación por ID');
      console.log('3. Crear Licitación');
      console.log('4. Actualizar Licitación');
      console.log('5. Eliminar Licitación');
      console.log('0. Volver al Menú Principal');

      const op = await this.preguntar('Opción: ');
      try {
        if (op === '1') {
          console.log('\n--- LISTA DE LICITACIONES ---');
          const lista = await this.licitacionesService.listarLicitaciones();
          console.table(lista);
          await this.esperarTecla();
        } else if (op === '2') {
          const id = await this.preguntar('Ingrese ID: ');
          const l = await this.licitacionesService.obtenerLicitacionPorId(Number(id));
          console.log('\nResultado:');
          console.table(l ? [l] : []);
          await this.esperarTecla();
        } else if (op === '3') {
          const codigo_licitacion = await this.preguntar('Código Licitación: ');
          const titulo = await this.preguntar('Título: ');
          const descripcion = await this.preguntar('Descripción: ');
          const presupuesto = await this.preguntar('Presupuesto Asignado: ');
          const fecha_inicio = await this.preguntar('Fecha Inicio (YYYY-MM-DD): ');
          const fecha_cierre = await this.preguntar('Fecha Cierre (YYYY-MM-DD): ');
          const creado_por = await this.preguntar('ID Creador (Usuario): ');

          const nueva = await this.licitacionesService.crearLicitacion({
            codigo_licitacion,
            titulo,
            descripcion,
            presupuesto_asignado: Number(presupuesto),
            estado: 'PUBLICADA',
            fecha_inicio,
            fecha_cierre,
            creado_por: Number(creado_por),
          });
          console.log('\n Licitación creada:', nueva);
          await this.esperarTecla();
        } else if (op === '4') {
          const id = await this.preguntar('Ingrese ID de la Licitación a actualizar: ');
          const existente = await this.licitacionesService.obtenerLicitacionPorId(Number(id));
          if (!existente) {
            console.log('\n Licitación no encontrada.');
          } else {
            console.log('*(Presione ENTER para mantener el valor actual)*');
            const titulo = await this.preguntar(`Nuevo Título [${existente.titulo}]: `);
            const descripcion = await this.preguntar(`Nueva Descripción [${existente.descripcion}]: `);
            const presupuesto = await this.preguntar(`Nuevo Presupuesto [${existente.presupuesto_asignado}]: `);
            const estado = await this.preguntar(`Nuevo Estado (BORRADOR/PUBLICADA/ADJUDICADA/CANCELADA) [${existente.estado}]: `);

            const actualizada = await this.licitacionesService.actualizarLicitacion(Number(id), {
              titulo: titulo || existente.titulo,
              descripcion: descripcion || existente.descripcion,
              presupuesto_asignado: presupuesto ? Number(presupuesto) : existente.presupuesto_asignado,
              estado: (estado.toUpperCase() as any) || existente.estado,
            });
            console.log('\n Licitación actualizada:', actualizada);
          }
          await this.esperarTecla();
        } else if (op === '5') {
          const id = await this.preguntar('Ingrese ID de la Licitación a eliminar: ');
          const conf = await this.preguntar(`¿Confirmar eliminación de la licitación ID ${id}? (s/n): `);
          if (conf.toLowerCase() === 's') {
            await this.licitacionesService.eliminarLicitacion(Number(id));
            console.log('\n Licitación eliminada correctamente.');
          } else {
            console.log('\nOperación cancelada.');
          }
          await this.esperarTecla();
        } else if (op === '0') {
          volver = true;
        } else {
          console.log('\nOpción inválida.');
          await this.esperarTecla();
        }
      } catch (error: any) {
        LoggerUtils.error(error.message);
        await this.esperarTecla();
      }
    }
  }

  private async menuAdjudicaciones(): Promise<void> {
    let volver = false;
    while (!volver) {
      console.clear();
      console.log('--- GESTIÓN DE ADJUDICACIONES ---');
      console.log('1. Listar Adjudicaciones');
      console.log('2. Buscar Adjudicación por ID');
      console.log('3. Adjudicar Licitación');
      console.log('4. Actualizar Adjudicación');
      console.log('5. Eliminar Adjudicación');
      console.log('0. Volver al Menú Principal');

      const op = await this.preguntar('Opción: ');
      try {
        if (op === '1') {
          console.log('\n--- LISTA DE ADJUDICACIONES ---');
          const lista = await this.adjudicacionesService.listarAdjudicaciones();
          console.table(lista);
          await this.esperarTecla();
        } else if (op === '2') {
          const id = await this.preguntar('Ingrese ID: ');
          const a = await this.adjudicacionesService.obtenerAdjudicacionPorId(Number(id));
          console.log('\nResultado:');
          console.table(a ? [a] : []);
          await this.esperarTecla();
        } else if (op === '3') {
          const licitacion_id = await this.preguntar('ID Licitación: ');
          const proveedor_id = await this.preguntar('ID Proveedor: ');
          const monto = await this.preguntar('Monto Adjudicado: ');
          const observaciones = await this.preguntar('Observaciones: ');

          const nueva = await this.adjudicacionesService.adjudicarLicitacion({
            licitacion_id: Number(licitacion_id),
            proveedor_id: Number(proveedor_id),
            monto_adjudicado: Number(monto),
            observaciones,
          });
          console.log('\n Licitación Adjudicada con éxito:', nueva);
          await this.esperarTecla();
        } else if (op === '4') {
          const id = await this.preguntar('Ingrese ID de la Adjudicación a actualizar: ');
          const existente = await this.adjudicacionesService.obtenerAdjudicacionPorId(Number(id));
          if (!existente) {
            console.log('\n Adjudicación no encontrada.');
          } else {
            console.log('*(Presione ENTER para mantener el valor actual)*');
            const monto = await this.preguntar(`Nuevo Monto Adjudicado [${existente.monto_adjudicado}]: `);
            const observaciones = await this.preguntar(`Nuevas Observaciones [${existente.observaciones}]: `);

            const actualizada = await this.adjudicacionesService.actualizarAdjudicacion(Number(id), {
              monto_adjudicado: monto ? Number(monto) : existente.monto_adjudicado,
              observaciones: observaciones || existente.observaciones,
            });
            console.log('\n Adjudicación actualizada:', actualizada);
          }
          await this.esperarTecla();
        } else if (op === '5') {
          const id = await this.preguntar('Ingrese ID de la Adjudicación a eliminar: ');
          const conf = await this.preguntar(`¿Confirmar eliminación de la adjudicación ID ${id}? (s/n): `);
          if (conf.toLowerCase() === 's') {
            await this.adjudicacionesService.eliminarAdjudicacion(Number(id));
            console.log('\n Adjudicación eliminada correctamente.');
          } else {
            console.log('\nOperación cancelada.');
          }
          await this.esperarTecla();
        } else if (op === '0') {
          volver = true;
        } else {
          console.log('\nOpción inválida.');
          await this.esperarTecla();
        }
      } catch (error: any) {
        LoggerUtils.error(error.message);
        await this.esperarTecla();
      }
    }
  }

  private async menuAlertas(): Promise<void> {
    let volver = false;
    while (!volver) {
      console.clear();
      console.log('--- GESTIÓN DE ALERTAS ---');
      console.log('1. Listar Alertas');
      console.log('2. Buscar Alerta por ID');
      console.log('3. Registrar Alerta');
      console.log('4. Actualizar Alerta');
      console.log('5. Eliminar Alerta');
      console.log('0. Volver al Menú Principal');

      const op = await this.preguntar('Opción: ');
      try {
        if (op === '1') {
          console.log('\n--- LISTA DE ALERTAS ---');
          const lista = await this.alertasService.listarAlertas();
          console.table(lista);
          await this.esperarTecla();
        } else if (op === '2') {
          const id = await this.preguntar('Ingrese ID: ');
          const al = await this.alertasService.obtenerAlertaPorId(Number(id));
          console.log('\nResultado:');
          console.table(al ? [al] : []);
          await this.esperarTecla();
        } else if (op === '3') {
          const licitacion_id = await this.preguntar('ID Licitación: ');
          const tipoInput = await this.preguntar('Tipo (SOBRECOSTO/PROVEEDOR_INHABILITADO/TIEMPO_IRREGULAR/DENUNCIA_CIUDADANA): ');
          const descripcion = await this.preguntar('Descripción: ');
          const riesgoInput = await this.preguntar('Nivel Riesgo (BAJO/MEDIO/ALTO/CRITICO): ');

          const nueva = await this.alertasService.registrarAlerta({
            licitacion_id: Number(licitacion_id),
            tipo_alerta: tipoInput.toUpperCase() as any,
            descripcion,
            nivel_riesgo: riesgoInput.toUpperCase() as any,
          });
          console.log('\n Alerta registrada:', nueva);
          await this.esperarTecla();
        } else if (op === '4') {
          const id = await this.preguntar('Ingrese ID de la Alerta a actualizar: ');
          const existente = await this.alertasService.obtenerAlertaPorId(Number(id));
          if (!existente) {
            console.log('\n Alerta no encontrada.');
          } else {
            console.log('*(Presione ENTER para mantener el valor actual)*');
            const tipoInput = await this.preguntar(`Nuevo Tipo [${existente.tipo_alerta}]: `);
            const descripcion = await this.preguntar(`Nueva Descripción [${existente.descripcion}]: `);
            const riesgoInput = await this.preguntar(`Nuevo Riesgo [${existente.nivel_riesgo}]: `);

            const actualizada = await this.alertasService.actualizarAlerta(Number(id), {
              tipo_alerta: (tipoInput.toUpperCase() as any) || existente.tipo_alerta,
              descripcion: descripcion || existente.descripcion,
              nivel_riesgo: (riesgoInput.toUpperCase() as any) || existente.nivel_riesgo,
            });
            console.log('\n Alerta actualizada:', actualizada);
          }
          await this.esperarTecla();
        } else if (op === '5') {
          const id = await this.preguntar('Ingrese ID de la Alerta a eliminar: ');
          const conf = await this.preguntar(`¿Confirmar eliminación de la alerta ID ${id}? (s/n): `);
          if (conf.toLowerCase() === 's') {
            await this.alertasService.eliminarAlerta(Number(id));
            console.log('\nnAlerta eliminada correctamente.');
          } else {
            console.log('\nOperación cancelada.');
          }
          await this.esperarTecla();
        } else if (op === '0') {
          volver = true;
        } else {
          console.log('\nOpción inválida.');
          await this.esperarTecla();
        }
      } catch (error: any) {
        LoggerUtils.error(error.message);
        await this.esperarTecla();
      }
    }
  }
}