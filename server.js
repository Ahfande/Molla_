const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Request body:", req.body);
  next();
});

// Data users untuk login
let users = [
  {
    npm: "2022195",
    password: "password123",
    name: "Vincent",
  },
  {
    npm: "2023109",
    password: "password456",
    name: "Molla",
  },
];

// Data kartu RFID mahasiswa
const kartuMahasiswa = [
  {
    cardId: '36450a87',
    nama: 'Ahfan Naofal',
    nim: '22310730012'
  },
  {
    cardId: '4379ad30',
    nama: 'Ardani Lintang P.',
    nim: '22310730019'
  },
  {
    cardId: '0651c587',
    nama: 'Yoga Pebri A.',
    nim: '22310730018'
  },
  {
    cardId: '36163487',
    nama: 'M. Riyandana',
    nim: '22310730014'
  },
  {
    cardId: '76b54687',
    nama: 'M. Fajar',
    nim: '22310730002'
  },
];

// Data mata kuliah per semester
const mataKuliah = {  
  semester1: [  
    { sks: 1, nama: "Matematika", jamMasuk: "08:00", jamKeluar: "10:00" },  
    { sks: 2, nama: "Fisika", jamMasuk: "10:00", jamKeluar: "12:00" },  
  ],  
  semester2: [  
    { sks: 3, nama: "Kimia", jamMasuk: "08:00", jamKeluar: "10:00" },  
    { sks: 4, nama: "Biologi", jamMasuk: "10:00", jamKeluar: "12:00" },  
  ],  
  semester3: [  
    { sks: 3, nama: "Matematika 2", jamMasuk: "08:00", jamKeluar: "10:00" },  
    { sks: 2, nama: "Kimia", jamMasuk: "10:00", jamKeluar: "12:00" },  
  ],  
  semester4: [  
    { sks: 3, nama: "Rangkaian Analog", jamMasuk: "07:30", jamKeluar: "10:00" },  
    { sks: 3, nama: "Bahasa Indonesia", jamMasuk: "10:10", jamKeluar: "13:10" },  
  ],  
  semester5: [  
    { sks: 3, nama: "Programmable Logic Controller", jamMasuk: "12:50", jamKeluar: "15:20" },  
    { sks: 3, nama: "Pengolahan Sinyal Digital", jamMasuk: "15:20", jamKeluar: "17:50" },  
    { sks: 3, nama: "Kecerdasan Buatan", jamMasuk: "12:50", jamKeluar: "15:20" },  
    { sks: 3, nama: "Statistika", jamMasuk: "15:20", jamKeluar: "17:50" },  
    { sks: 2, nama: "Agama Islam 3", jamMasuk: "14:30", jamKeluar: "16:10" },  
    { sks: 3, nama: "Internet of Things", jamMasuk: "13:10", jamKeluar: "15:20" },  
    { sks: 3, nama: "Mikroprosessor 2", jamMasuk: "13:10", jamKeluar: "15:20" },  
  ],  
  semester6: [  
    { sks: 1, nama: "Kimia 2", jamMasuk: "09:00", jamKeluar: "10:00" },  
    { sks: 2, nama: "Biologi 2", jamMasuk: "10:10", jamKeluar: "12:30" },  
  ],  
  semester7: [  
    { sks: 1, nama: "Agama Islam 5", jamMasuk: "12:50", jamKeluar: "13:40" },  
    { sks: 2, nama: "Bahasa Inggris 1", jamMasuk: "14:30", jamKeluar: "16:10" },  
  ],  
};

// Data jadwal mingguan untuk RFID
const jadwalKuliah = [
  {
    hari: 1, // Senin
    mataKuliah: 'PLC',
    jamMulai: '12:50',
    jamSelesai: '15:20'
  },
  {
    hari: 2, // Selasa
    mataKuliah: 'Kecerdasan Buatan',
    jamMulai: '12:50',
    jamSelesai: '15:20'
  },
  {
    hari: 3, // Rabu
    mataKuliah: 'Agama Islam 3',
    jamMulai: '14:30',
    jamSelesai: '16.10'
  },
  {
    hari: 5, // Jumat
    mataKuliah: 'Mikroprosessor',
    jamMulai: '12:50',
    jamSelesai: '15.20'
  },
];

// Array untuk menyimpan data absensi
const absensi = [];

// Endpoint login
app.post("/login", (req, res) => {
  const { npm, password } = req.body;
  const user = users.find((u) => u.npm === npm && u.password === password);

  if (user) {
    res.json({
      status: "success",
      name: user.name,
      message: "Login berhasil",
    });
  } else {
    res.json({
      status: "error",
      message: "ID atau Password salah",
    });
  }
});

// Endpoint untuk mendapatkan mata kuliah berdasarkan semester
app.get("/mata-kuliah/:semester", (req, res) => {  
  const semester = req.params.semester;  
  if (mataKuliah[semester]) {  
    res.json({  
      status: "success",  
      mataKuliah: mataKuliah[semester],  
    });  
  } else {  
    res.status(404).json({  
      status: "error",  
      message: "Semester tidak ditemukan",  
    });  
  }  
});

// Endpoint untuk mencatat absensi RFID
app.post('/attendance', (req, res) => {
  const { card_id, time } = req.body;
  console.log("Received attendance request:", { card_id, time });

  const [jam, menit] = time.split(':');
  const waktuScan = `${jam}:${menit}`;
  
  const hariIni = new Date().getDay();
  const jadwalHariIni = jadwalKuliah.find(jadwal => jadwal.hari === hariIni);
  
  if (!jadwalHariIni) {
    console.log("Tidak ada jadwal hari ini");
    return res.json({
      status: 'error',
      message: 'Tidak ada jadwal kuliah hari ini'
    });
  }
  
  const mahasiswa = kartuMahasiswa.find(m => m.cardId === card_id);
  
  if (!mahasiswa) {
    console.log("Kartu tidak terdaftar:", card_id);
    return res.json({
      status: 'error',
      message: 'Kartu tidak terdaftar'
    });
  }
  
  const jamMulai = jadwalHariIni.jamMulai.split(':')[0];
  const menitMulai = jadwalHariIni.jamMulai.split(':')[1];
  
  let status;
  if (parseInt(jam) < parseInt(jamMulai) || 
      (parseInt(jam) === parseInt(jamMulai) && parseInt(menit) <= parseInt(menitMulai))) {
    status = 'HADIR';
  } else if (parseInt(jam) === parseInt(jamMulai) && 
             parseInt(menit) <= parseInt(menitMulai) + 15) {
    status = 'TERLAMBAT';
  } else {
    status = 'TIDAK HADIR';
  }
  
  const dataAbsensi = {
    waktu: waktuScan,
    mahasiswa: mahasiswa.nama,
    nim: mahasiswa.nim,
    mataKuliah: jadwalHariIni.mataKuliah,
    status: status,
    tanggal: new Date().toISOString().split('T')[0]
  };
  
  absensi.push(dataAbsensi);
  console.log("Absensi berhasil dicatat:", dataAbsensi);
  
  res.json({
    status: 'success',
    message: `Absensi berhasil: ${mahasiswa.nama} - ${status}`,
    data: dataAbsensi
  });
});

// Endpoint untuk melihat semua data absensi
app.get('/attendance', (req, res) => {
  res.json(absensi);
});

// Endpoint untuk melihat absensi per mahasiswa
app.get('/attendance/:nim', (req, res) => {
  const nim = req.params.nim;
  const riwayat = absensi.filter(a => a.nim === nim);
  
  if (riwayat.length > 0) {
    res.json({
      status: 'success',
      riwayat
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: 'Riwayat absensi tidak ditemukan'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server'
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  console.log("Registered users:", users);
  console.log("Registered RFID cards:", kartuMahasiswa);
});