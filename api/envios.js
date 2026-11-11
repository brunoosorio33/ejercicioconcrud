
import "dotenv/config";
import mongoose from "mongoose";
import Envio from "../models/Envio.js";

async function conectarDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
}

export default async function handler(req, res) {
    try {
        await conectarDB();

        if (req.method === "GET") {
            const filtros = {};

            if (req.query.estado) {
                filtros.estado = req.query.estado;
            }

            if (req.query.ciudad) {
                filtros.ciudadDestino = {
                    $regex: req.query.ciudad,
                    $options: "i"
                };
            }

            if (req.query.sinRepartidor === "true") {
                filtros.repartidor = {
                    $exists: false
                };
            }

            const envios = await Envio.find(filtros);

            return res.status(200).json(envios);
        }

        if (req.method === "POST") {
            const nuevoEnvio = await Envio.create(req.body);

            return res.status(201).json(nuevoEnvio);
        }

        if (req.method === "PATCH") {
            const { trackingCode } = req.query;

            if (!trackingCode) {
                return res.status(400).json({
                    error: "Debes indicar el trackingCode"
                });
            }

            const { estado, repartidor, sumarIntento, nuevaNota, quitarNota } = req.body;

            const actualizacion = {};

            if (estado !== undefined) {
                actualizacion.$set = {
                    ...actualizacion.$set,
                    estado
                };
            }

            if (repartidor !== undefined) {
                actualizacion.$set = {
                    ...actualizacion.$set,
                    repartidor
                };
            }

            if (sumarIntento === true) {
                actualizacion.$inc = {
                    intentosEntrega: 1
                };
            }

            if (nuevaNota !== undefined) {
                actualizacion.$push = {
                    notasRuta: nuevaNota
                };
            }

            if (quitarNota !== undefined) {
                actualizacion.$pull = {
                    notasRuta: quitarNota
                };
            }

            if (Object.keys(actualizacion).length === 0) {
                return res.status(400).json({
                    error: "No has indicado ningún dato para actualizar"
                });
            }

            const envioActualizado = await Envio.findOneAndUpdate(
                { trackingCode },
                actualizacion,
                {
                    returnDocument: "after",
                    runValidators: true
                }
            );

            if (!envioActualizado) {
                return res.status(404).json({
                    error: "No se ha encontrado el envío"
                });
            }

            return res.status(200).json(envioActualizado);
        }

        if (req.method === "DELETE") {
            const { trackingCode } = req.query;

            if (!trackingCode) {
                return res.status(400).json({
                    error: "Debes indicar el trackingCode"
                });
            }

            const envioEliminado = await Envio.findOneAndDelete({
                trackingCode
            });

            if (!envioEliminado) {
                return res.status(404).json({
                    error: "No se ha encontrado el envío"
                });
            }

            return res.status(200).json({
                mensaje: "Envío eliminado correctamente",
                envio: envioEliminado
            });
        }

        res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);

        return res.status(405).json({
            error: "Método HTTP no permitido"
        });

    } catch (error) {
        console.error("Error en la API:", error);

        return res.status(500).json({
            error: error.message
        });
    }
}
