const mongoose = require('mongoose');

// Skema data sesuai kebutuhan klinik
const appointmentSchema = new mongoose.Schema({
    namaPasien: { type: String, required: true },
    nik: { type: String, required: true },
    noHp: { type: String, required: true },
    poli: { type: String, required: true }, // Umum, Gigi, Ibu & Anak
    dokter: { type: String, required: true },
    tanggal: { type: Date, required: true },
    jam: { type: String, required: true },
    keluhan: String,
    status: { 
        type: String, 
        enum: ['Menunggu', 'Dikonfirmasi', 'Selesai', 'Dibatalkan'], 
        default: 'Menunggu' 
    },
    dibuatPada: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);