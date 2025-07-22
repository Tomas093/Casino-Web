-- CreateTable
CREATE TABLE "administrador" (
    "adminid" SERIAL NOT NULL,
    "superadmin" BOOLEAN,
    "usuarioid" INTEGER NOT NULL,

    CONSTRAINT "administrador_pkey" PRIMARY KEY ("adminid")
);

-- CreateTable
CREATE TABLE "amistad" (
    "id_amistad" SERIAL NOT NULL,
    "usuario1_id" INTEGER NOT NULL,
    "usuario2_id" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amistad_pkey" PRIMARY KEY ("id_amistad")
);

-- CreateTable
CREATE TABLE "cliente" (
    "clienteid" SERIAL NOT NULL,
    "balance" BIGINT,
    "influencer" BOOLEAN,
    "usuarioid" INTEGER NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("clienteid")
);

-- CreateTable
CREATE TABLE "egreso" (
    "egresoid" SERIAL NOT NULL,
    "clienteid" INTEGER,
    "monto" DECIMAL(10,2),
    "fecha" TIMESTAMP(6),
    "metodo" VARCHAR(255),

    CONSTRAINT "egreso_pkey" PRIMARY KEY ("egresoid")
);

-- CreateTable
CREATE TABLE "ingreso" (
    "ingresoid" SERIAL NOT NULL,
    "clienteid" INTEGER,
    "monto" DECIMAL(10,2),
    "fecha" TIMESTAMP(6),
    "cuponid" INTEGER,
    "metodo" VARCHAR(255),

    CONSTRAINT "ingreso_pkey" PRIMARY KEY ("ingresoid")
);

-- CreateTable
CREATE TABLE "juego" (
    "juegoid" SERIAL NOT NULL,
    "nombre" VARCHAR(255),
    "estado" BOOLEAN,

    CONSTRAINT "juego_pkey" PRIMARY KEY ("juegoid")
);

-- CreateTable
CREATE TABLE "jugada" (
    "jugadaid" SERIAL NOT NULL,
    "clienteid" INTEGER,
    "fecha" TIMESTAMP(6),
    "retorno" INTEGER,
    "apuesta" INTEGER,
    "juegoid" INTEGER,

    CONSTRAINT "jugada_pkey" PRIMARY KEY ("jugadaid")
);

-- CreateTable
CREATE TABLE "limitehorario" (
    "clienteid" INTEGER NOT NULL,
    "limitediario" INTEGER,
    "limitesemanal" INTEGER,
    "limitemensual" INTEGER,

    CONSTRAINT "limitehorario_pkey" PRIMARY KEY ("clienteid")
);

-- CreateTable
CREATE TABLE "limitemonetario" (
    "clienteid" INTEGER NOT NULL,
    "limitediario" DECIMAL(10,2),
    "limitesemanal" DECIMAL(10,2),
    "limitemensual" DECIMAL(10,2),

    CONSTRAINT "limitemonetario_pkey" PRIMARY KEY ("clienteid")
);

-- CreateTable
CREATE TABLE "partida" (
    "partidaid" SERIAL NOT NULL,
    "clienteid" INTEGER,
    "fecha" TIMESTAMP(6),
    "gananciaperdida" INTEGER,
    "apuesta" INTEGER,

    CONSTRAINT "partida_pkey" PRIMARY KEY ("partidaid")
);

-- CreateTable
CREATE TABLE "pausa" (
    "clienteid" INTEGER NOT NULL,
    "fechainicio" TIMESTAMP(6),
    "fechafin" TIMESTAMP(6),
    "duracion" INTEGER,

    CONSTRAINT "pausa_pkey" PRIMARY KEY ("clienteid")
);

-- CreateTable
CREATE TABLE "suspendidos" (
    "suspendidoid" SERIAL NOT NULL,
    "usuarioid" INTEGER,
    "fechainicio" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechafin" TIMESTAMPTZ(6),
    "razon" TEXT,

    CONSTRAINT "suspendidos_pkey" PRIMARY KEY ("suspendidoid")
);

-- CreateTable
CREATE TABLE "usuario" (
    "usuarioid" SERIAL NOT NULL,
    "nombre" VARCHAR(255),
    "apellido" VARCHAR(255),
    "email" VARCHAR(255),
    "password" VARCHAR(255),
    "dni" TEXT,
    "img" TEXT,
    "fechanacimiento" TIMESTAMP(6),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("usuarioid")
);

-- CreateTable
CREATE TABLE "solicitudesamistad" (
    "id_solicitud" SERIAL NOT NULL,
    "id_remitente" INTEGER NOT NULL,
    "id_receptor" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudesamistad_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateTable
CREATE TABLE "mensaje" (
    "mensajeid" SERIAL NOT NULL,
    "ticketid" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaenvio" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuarioid" INTEGER NOT NULL,

    CONSTRAINT "mensaje_pkey" PRIMARY KEY ("mensajeid")
);

-- CreateTable
CREATE TABLE "ticket" (
    "ticketid" SERIAL NOT NULL,
    "clienteid" INTEGER,
    "problema" TEXT,
    "resuelto" BOOLEAN DEFAULT false,
    "adminid" INTEGER,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "fechacierre" TIMESTAMP(6),
    "prioridad" TEXT,
    "categoria" TEXT,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("ticketid")
);

-- CreateTable
CREATE TABLE "faq" (
    "preguntaid" SERIAL NOT NULL,
    "pregunta" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "categoria" VARCHAR(255) NOT NULL,

    CONSTRAINT "faq_pkey" PRIMARY KEY ("preguntaid")
);

-- CreateTable
CREATE TABLE "cupon" (
    "cuponid" TEXT NOT NULL DEFAULT nextval('promocion_promocionid_seq'::regclass),
    "beneficio" DECIMAL,
    "fechainicio" TIMESTAMPTZ(6),
    "fechafin" TIMESTAMPTZ(6),
    "cantidadusos" INTEGER,
    "mincarga" DECIMAL,
    "maxcarga" DECIMAL,
    "vecesusadas" INTEGER,

    CONSTRAINT "promocion_pkey" PRIMARY KEY ("cuponid")
);

-- CreateTable
CREATE TABLE "tiempodesesion" (
    "tiempodesesionid" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "inicio" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fin" TIMESTAMPTZ(6),

    CONSTRAINT "tiempodejuego_pkey" PRIMARY KEY ("tiempodesesionid")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrador_usuarioid_key" ON "administrador"("usuarioid");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_usuarioid_key" ON "cliente"("usuarioid");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "idx_tickets_clienteid" ON "ticket"("clienteid");

-- CreateIndex
CREATE INDEX "idx_tickets_idadmin" ON "ticket"("adminid");

-- CreateIndex
CREATE INDEX "idx_tickets_resuelto" ON "ticket"("resuelto");

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "administrador_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amistad" ADD CONSTRAINT "amistad_usuario1_id_fkey" FOREIGN KEY ("usuario1_id") REFERENCES "usuario"("usuarioid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "amistad" ADD CONSTRAINT "amistad_usuario2_id_fkey" FOREIGN KEY ("usuario2_id") REFERENCES "usuario"("usuarioid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "egreso" ADD CONSTRAINT "egreso_clienteid_fkey" FOREIGN KEY ("clienteid") REFERENCES "cliente"("clienteid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ingreso" ADD CONSTRAINT "ingreso_clienteid_fkey" FOREIGN KEY ("clienteid") REFERENCES "cliente"("clienteid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "jugada" ADD CONSTRAINT "fk_juegoid" FOREIGN KEY ("juegoid") REFERENCES "juego"("juegoid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "jugada" ADD CONSTRAINT "jugada_clienteid_fkey" FOREIGN KEY ("clienteid") REFERENCES "cliente"("clienteid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "limitehorario" ADD CONSTRAINT "limitehorario_clienteid_fkey" FOREIGN KEY ("clienteid") REFERENCES "cliente"("clienteid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "limitemonetario" ADD CONSTRAINT "limitemonetario_clienteid_fkey" FOREIGN KEY ("clienteid") REFERENCES "cliente"("clienteid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "partida" ADD CONSTRAINT "partida_clienteid_fkey" FOREIGN KEY ("clienteid") REFERENCES "cliente"("clienteid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pausa" ADD CONSTRAINT "pausa_clienteid_fkey" FOREIGN KEY ("clienteid") REFERENCES "cliente"("clienteid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suspendidos" ADD CONSTRAINT "suspendidos_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitudesamistad" ADD CONSTRAINT "solicitudesamistad_id_receptor_fkey" FOREIGN KEY ("id_receptor") REFERENCES "usuario"("usuarioid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitudesamistad" ADD CONSTRAINT "solicitudesamistad_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "usuario"("usuarioid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "fk_ticket" FOREIGN KEY ("ticketid") REFERENCES "ticket"("ticketid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "fk_admin" FOREIGN KEY ("adminid") REFERENCES "administrador"("adminid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "fk_cliente" FOREIGN KEY ("clienteid") REFERENCES "cliente"("clienteid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tiempodesesion" ADD CONSTRAINT "tiempodejuego_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("usuarioid") ON DELETE CASCADE ON UPDATE CASCADE;
