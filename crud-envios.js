
import mongoose from "mongoose";
import dotenv from "dotenv";
import Envio from "./models/Envio.js";

dotenv.config();

async function ejecutarCrud() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Conectado a MongoDB Atlas\n");

        await Envio.deleteMany({});
        console.log("Colección de envíos limpiada\n");

        console.log("--- 1. Fase CREATE: Insertando envíos iniciales ---");

        const enviosCreados = await Envio.insertMany([
            {
                trackingCode: "ENV-9001",
                destinatario: "Carlos Pérez",
                ciudadDestino: "Madrid",
                estado: "En Almacén",
                prioridad: "Estándar",
                notasRuta: ["fragil", "asegurado", "llamar-antes"]
            },
            {
                trackingCode: "ENV-9002",
                destinatario: "Laura Gómez",
                ciudadDestino: "Valencia",
                estado: "En Reparto",
                prioridad: "Express",
                repartidor: "Miguel Torres",
                intentosEntrega: 1,
                notasRuta: ["entrega-urgente"]
            },
            {
                trackingCode: "ENV-9003",
                destinatario: "Ana Martínez",
                ciudadDestino: "Barcelona",
                estado: "Entregado",
                prioridad: "Estándar",
                repartidor: "Sergio Ruiz",
                intentosEntrega: 1,
                notasRuta: ["entrega-completada"]
            },
            {
                trackingCode: "ENV-9004",
                destinatario: "Pedro Sánchez",
                ciudadDestino: "Madrid",
                estado: "Incidencia",
                prioridad: "Urgente",
                intentosEntrega: 2,
                notasRuta: ["direccion-incorrecta"]
            },
            {
                trackingCode: "ENV-9005",
                destinatario: "Lucía Fernández",
                ciudadDestino: "Valencia",
                estado: "En Almacén",
                prioridad: "Express",
                repartidor: "David López",
                notasRuta: ["fragil"]
            }
        ]);

        console.log(`Se crearon ${enviosCreados.length} envíos:\n`);
        console.log(enviosCreados);

        console.log("\n--- 2. Fase READ: Consultas con operadores ---");

        const urgentesOIncidencias = await Envio.find({
            $or: [
                { prioridad: "Urgente" },
                { estado: "Incidencia" }
            ]
        }).select("trackingCode destinatario prioridad estado -_id");

        console.log("\n Envíos urgentes o con incidencia ($or):", urgentesOIncidencias);

        const sinRepartidor = await Envio.find({
            repartidor: { $exists: false }
        }).select("trackingCode destinatario ciudadDestino estado -_id");

        console.log("\n Envíos sin repartidor asignado ($exists: false):", sinRepartidor);

        const enviosValencia = await Envio.find({
            ciudadDestino: { $regex: "Valencia", $options: "i" }
        }).select("trackingCode destinatario ciudadDestino -_id");

        console.log("\n Envíos cuyo destino contiene 'valencia' ($regex):", enviosValencia);

        const enviosFragilesYAsegurados = await Envio.find({
            notasRuta: { $all: ["fragil", "asegurado"] }
        }).select("trackingCode notasRuta -_id");

        console.log("\n Envíos con las etiquetas fragil y asegurado ($all):", enviosFragilesYAsegurados);

        console.log("\n--- 3. Fase UPDATE: Actualizando envíos ---");

        const envioActualizado = await Envio.findOneAndUpdate(
            { trackingCode: "ENV-9001" },
            {$set: {repartidor: "Miguel Torres", estado: "En Reparto"},
                $inc: {intentosEntrega: 1},
                $push: {notasRuta: "Intento 1 realizado"}
            },
            {new: true, runValidators: true});

        console.log("\n Envío actualizado individualmente (findOneAndUpdate):", envioActualizado);

        const actualizacionMasiva = await Envio.updateMany(
            {repartidor: { $exists: false}
        },
            {$set: {repartidor: "Flota Central"}}
        );

        console.log("\n Actualización masiva (updateMany):");
        console.log("Envíos encontrados:", actualizacionMasiva.matchedCount);
        console.log("Envíos modificados:", actualizacionMasiva.modifiedCount);

    } catch (error) {
        console.error("Error en el laboratorio:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\nDesconectado de MongoDB Atlas");
    }
}

ejecutarCrud();
