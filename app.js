require('dotenv').config(); // Load kunci rahasia
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// --- KONEKSI DATABASE SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- MIDDLEWARE ---
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// --- ROUTES ---

// 1. Halaman Utama
app.get('/', (req, res) => {
    res.render('home');
});

// 2. Halaman Booking
app.get('/booking', (req, res) => {
    res.render('booking');
});

app.get('/informasi', (req, res) => {
    res.render('informasi', { 
        title: 'Informasi Klinik',
        user: req.session.user || null // Biar navbar tetap konsisten status loginnya
    });
});

// 3. Proses Simpan Booking (CREATE)
app.post('/booking', async (req, res) => {
    const { namaPasien, nik, noHp, poli, dokter, tanggal, jam, keluhan } = req.body;

    // Masukkan ke tabel 'appointments' (sesuai nama tabel di Supabase)
    const { data, error } = await supabase
        .from('appointments')
        .insert([
            { 
                nama_pasien: namaPasien, 
                nik: nik, 
                no_hp: noHp, 
                poli: poli, 
                dokter: dokter, 
                tanggal: tanggal, 
                jam: jam, 
                keluhan: keluhan,
                status: 'Menunggu'
            }
        ]);

    if (error) {
        console.log(error);
        return res.send("Gagal menyimpan data. Cek koneksi internet.");
    }
    
    res.redirect('/?pesan=sukses');
});

// 4. Login Admin (Hardcode)
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.redirect('/admin');
    } else {
        res.redirect('/login?error=true');
    }
});

// 5. Dashboard Admin (READ)
app.get('/admin', async (req, res) => {
    // Ambil semua data dari Supabase
    let { data: janji, error } = await supabase
        .from('appointments')
        .select('*')
        .order('tanggal', { ascending: false }); // Urutkan dari yg terbaru

    if (error) janji = []; // Jika error, anggap kosong agar tidak crash
    
    res.render('admin', { janji });
});

// 6. Update Status (UPDATE)
app.put('/admin/:id', async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const { error } = await supabase
        .from('appointments')
        .update({ status: status })
        .eq('id', id); // Update dimana ID cocok

    if (error) console.log(error);
    res.redirect('/admin');
});

// 7. Hapus Data (DELETE)
app.delete('/admin/:id', async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

    if (error) console.log(error);
    res.redirect('/admin');
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);

});

module.exports = app;
