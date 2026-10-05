drop table if exists alertas cascade;
drop table if exists adjudicaciones cascade;
drop table if exists licitaciones cascade;
drop table if exists proveedores cascade;
drop table if exists usuarios cascade;

create table usuarios (
    id serial primary key,
    nombre varchar(100) not null,
    email varchar(120) unique not null,
    password varchar(255) not null, 
    rol varchar(30) default 'CIUDADANO' check (rol in ('ADMIN', 'AUDITOR', 'CIUDADANO')),
    creado_en timestamp default current_timestamp
);

create table proveedores (
    id serial primary key,
    nit varchar(20) unique not null,
    razon_social varchar(150) not null,
    email varchar(100) not null,
    calificacion decimal(3,2) default 5.00 check (calificacion between 0 and 5),
    creado_en timestamp default current_timestamp
);

create table licitaciones (
    id serial primary key,
    codigo_licitacion varchar(50) unique not null,
    titulo varchar(200) not null,
    descripcion text,
    entidad varchar(150),
    presupuesto_asignado decimal(12,2) not null check (presupuesto_asignado > 0),
    estado varchar(30) default 'PUBLICADA' check (estado in ('PUBLICADA', 'ADJUDICADA', 'CANCELADA', 'CON_ALERTA')),
    fecha_inicio date not null,
    fecha_cierre date not null,
    creado_por int references usuarios(id) on delete set null,
    creado_en timestamp default current_timestamp,
    constraint chk_fechas check (fecha_cierre >= fecha_inicio)
);

create table adjudicaciones (
    id serial primary key,
    licitacion_id int unique references licitaciones(id) on delete cascade,
    proveedor_id int references proveedores(id) on delete restrict,
    monto_adjudicado decimal(12,2) not null check (monto_adjudicado > 0),
    fecha_adjudicacion timestamp default current_timestamp,
    observaciones text
);

create table alertas (
    id serial primary key,
    licitacion_id int references licitaciones(id) on delete cascade,
    tipo_alerta varchar(50) not null check (tipo_alerta in ('SOBRECOSTO', 'PROVEEDOR_INHABILITADO', 'TIEMPO_IRREGULAR', 'DENUNCIA_CIUDADANA')),
    descripcion text not null,
    nivel_riesgo varchar(20) default 'MEDIO' check (nivel_riesgo in ('BAJO', 'MEDIO', 'ALTO', 'CRITICO')),
    creado_en timestamp default current_timestamp
);

create index idx_licitaciones_estado on licitaciones(estado);
create index idx_alertas_riesgo on alertas(nivel_riesgo);
create index idx_proveedores_nit on proveedores(nit);