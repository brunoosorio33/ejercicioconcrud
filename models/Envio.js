import mongoose from 'mongoose';

const envioSchema = new mongoose.Schema(
    {
        trackingCode: {
            type: String,
            required: [true, "El código de seguimiento es obligatorio"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        destinatario: {
            type: String,
            required: [true, "El destinatario es obligatorio"],
            trim: true,
            minlength: [3, "El destinatario debe tener al menos 3 caracteres"],
        },
        ciudadDestino: {
            type: String,
            required: [true, "La ciudad de destino es obligatoria"],
            trim: true,
        },
        estado: {
            type: String,
            required: true,
            enum: ["En Almacén", "En Reparto", "Entregado", "Incidencia"],
            default: "En Almacén",
        },
        prioridad: {
            type: String,
            required: true,
            enum: ["Estándar", "Express", "Urgente"],
            default: "Estándar",
        },
        repartidor: {
            type: String,
            trim: true,
        },
        intentosEntrega: {
            type: Number,
            default: 0,
            min: [0, "Los intentos de entrega no pueden ser negativos"],
            max: [3, "No se permiten más de 3 intentos de entrega"],
        },
        notasRuta: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Envio = mongoose.models.Envio || mongoose.model("Envio", envioSchema);

export default Envio;
