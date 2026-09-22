insert into usuarios (nombre, email, password, rol) values
('Carlos Mendoza', 'admin.mendoza@govtrace.gob', '$2b$10$e834jdfh834jhf834jhf83', 'ADMIN'),
('Lucía Morales', 'lmorales@auditoria.gob', '$2b$10$e834jdfh834jhf834jhf84', 'AUDITOR'),
('Pedro Vásquez', 'pedro.vasquez@email.com', '$2b$10$e834jdfh834jhf834jhf85', 'CIUDADANO'),
('Ana Sofía Gómez', 'agomez@salud.gob', '$2b$10$e834jdfh834jhf834jhf86', 'ADMIN'),
('Roberto Arenas', 'rarenas@contraloria.gob', '$2b$10$e834jdfh834jhf834jhf87', 'AUDITOR'),
('María Fernanda Castillo', 'mfcastillo@email.com', '$2b$10$e834jdfh834jhf834jhf88', 'CIUDADANO'),
('Jorge Luis Estrada', 'jestrada@comunicaciones.gob', '$2b$10$e834jdfh834jhf834jhf89', 'ADMIN'),
('Karla Vanessa Ruiz', 'kruiz@transparencia.org', '$2b$10$e834jdfh834jhf834jhf90', 'AUDITOR'),
('Diego Alejandro Santos', 'dsantos@email.com', '$2b$10$e834jdfh834jhf834jhf91', 'CIUDADANO'),
('Elena Beatriz Fuentes', 'efuentes@educacion.gob', '$2b$10$e834jdfh834jhf834jhf92', 'ADMIN');

insert into proveedores (nit, razon_social, email, calificacion) values
('1234567-8', 'TechGuate S.A.', 'contacto@techguate.com', 4.85),
('9876543-2', 'Constructora El Sol, S.A.', 'ventas@constructoraelsol.com', 4.20),
('4567890-1', 'Suministros Médicos Globales', 'info@medicosglobales.com', 4.90),
('3216549-7', 'Sistemas Digitales e Innovación', 'soporte@sistemasdigitales.com', 3.75),
('6549873-4', 'Pavimentos y Caminos del Norte', 'contacto@pavimentosnorte.com', 4.50),
('7891234-5', 'Fármacos e Insumos Hospitalarios', 'ventas@farmacosinsumos.com', 2.80),
('1472583-6', 'Distribuidora Pedagógica Nacional', 'pedagogica@distribuidora.com', 4.60),
('3692581-4', 'Seguridad y Redes Empresariales', 'info@seguridadyredes.com', 4.10),
('2581473-9', 'Infraestructura Cívica S.A.', 'proyectos@infracivica.com', 3.90),
('9517532-8', 'Servicios de Logística e Impreza', 'logistica@impreza.com', 4.70);

insert into licitaciones (codigo_licitacion, titulo, descripcion, presupuesto_asignado, estado, fecha_inicio, fecha_cierre, creado_por) values
('LIC-2026-001', 'Adquisición de Equipos de Cómputo para Escuelas', 'Compra de 500 computadoras portátiles para escuelas públicas.', 150000.00, 'ADJUDICADA', '2026-09-01', '2026-09-15', 1),
('LIC-2026-002', 'Compra de Lote de Mascarillas y Equipo Médico', 'Insumos de protección para la red nacional de hospitales.', 850000.00, 'CON_ALERTA', '2026-09-10', '2026-09-25', 4),
('LIC-2026-003', 'Reparación de Puente Vehicular Km 45', 'Mantenimiento estructural y pavimentación de tramo.', 2500000.00, 'ADJUDICADA', '2026-08-18', '2026-09-10', 7),
('LIC-2026-004', 'Instalación de Fibra Óptica en Ministerios', 'Cableado estructurado y conectividad de alta velocidad.', 420000.00, 'ADJUDICADA', '2026-08-01', '2026-08-20', 1),
('LIC-2026-005', 'Suministro de Libros de Texto para Primaria', 'Impresión y distribución de 50,000 textos escolares.', 600000.00, 'ADJUDICADA', '2026-07-15', '2026-08-05', 10),
('LIC-2026-006', 'Mantenimiento de Ambulancias de la Red Sur', 'Reparación mecánica y equipamiento de emergencia.', 310000.00, 'CON_ALERTA', '2026-09-05', '2026-09-20', 4),
('LIC-2026-007', 'Construcción de Paso a Desnivel Zona Central', 'Obra civil de infraestructura vial.', 8900000.00, 'PUBLICADA', '2026-09-15', '2026-10-30', 7),
('LIC-2026-008', 'Servicio de Licenciamiento de Software Cloud', 'Renovación de licencias para servidores gubernamentales.', 280000.00, 'ADJUDICADA', '2026-08-10', '2026-08-28', 1),
('LIC-2026-009', 'Adquisición de Insumos Quirúrgicos', 'Material estéril para salas de operaciones.', 1200000.00, 'CON_ALERTA', '2026-09-12', '2026-09-28', 4),
('LIC-2026-010', 'Remozamiento de Aulas Escolares en Sector Rural', 'Pintura, techo y electricidad en 20 centros educativos.', 550000.00, 'CANCELADA', '2026-07-01', '2026-07-20', 10);

insert into adjudicaciones (licitacion_id, proveedor_id, monto_adjudicado, observaciones) values
(1, 1, 145000.00, 'Asignado a TechGuate S.A. por menor costo y garantía extendida de 3 años.'),
(3, 2, 2480000.00, 'Adjudicado a Constructora El Sol tras cumplir evaluación de ingeniería.'),
(4, 4, 415000.00, 'Asignado por cumplimiento al 100% de especificaciones técnicas.'),
(5, 7, 580000.00, 'Adjudicación aprobada por unanimidad en comité pedagógico.'),
(8, 8, 275000.00, 'Proveedor seleccionado con soporte técnico local de 24/7.'),
(2, 3, 840000.00, 'Adjudicado bajo contingencia pero sujeto a auditoría por alerta detectada.'),
(6, 10, 295000.00, 'Adjudicación parcial para revisión de flota de unidades.'),
(9, 6, 1180000.00, 'Asignado temporalmente a falta de más competidores capacitados.'),
(10, 9, 540000.00, 'Proceso revertido y cancelado previo a la firma final del contrato.'),
(7, 5, 8750000.00, 'Propuesta económica pre-calificada en revisión técnica.');

insert into alertas (licitacion_id, tipo_alerta, descripcion, nivel_riesgo) values
(2, 'SOBRECOSTO', 'El precio por unidad de mascarilla excede en un 42% el promedio del mercado.', 'ALTO'),
(6, 'PROVEEDOR_INHABILITADO', 'El proveedor seleccionado registra una sanción previa por incumplimiento de plazos.', 'CRITICO'),
(9, 'SOBRECOSTO', 'Variación injustificada del 30% respecto al costo de insumos del año anterior.', 'MEDIO'),
(3, 'TIEMPO_IRREGULAR', 'El tiempo entre la publicación y el cierre fue inferior a los 15 días reglamentarios.', 'BAJO'),
(2, 'DENUNCIA_CIUDADANA', 'Reporte ciudadano de incongruencia en las especificaciones del lote solicitado.', 'MEDIO'),
(6, 'SOBRECOSTO', 'Presupuesto de repuestos cotizado con sobreprecio del 25%.', 'ALTO'),
(10, 'TIEMPO_IRREGULAR', 'Cancelación repentina sin dictamen técnico publicado.', 'MEDIO'),
(9, 'PROVEEDOR_INHABILITADO', 'Empresa contratista presenta inconsistencias en su registro de NIT.', 'CRITICO'),
(4, 'DENUNCIA_CIUDADANA', 'Observación sobre preferencia técnica hacia una marca específica de cableado.', 'BAJO'),
(8, 'TIEMPO_IRREGULAR', 'Recepción de ofertas extendida fuera del horario oficial de plataforma.', 'BAJO');