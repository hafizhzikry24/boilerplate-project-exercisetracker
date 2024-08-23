const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })); // Untuk menangani form data
app.use(express.json());

let users = []; // Menyimpan data user sementara
let exercises = []; // Menyimpan data exercise sementara

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Endpoint untuk membuat user baru
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = {
    _id: (users.length + 1).toString(), // Menggunakan string untuk ID
    username,
  };
  users.push(newUser);
  res.json(newUser);
});

// Endpoint untuk mendapatkan daftar semua pengguna
app.get('/api/users', (req, res) => {
  res.json(users.map(user => ({ username: user.username, _id: user._id })));
});

// Endpoint untuk menambahkan exercise ke user tertentu
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(user => user._id === _id);
  if (!user) return res.status(400).json({ error: 'User not found' });

  const newExercise = {
    userId: user._id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  exercises.push(newExercise);
  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id
  });
});

// Endpoint untuk mendapatkan log exercise dari user
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === _id);
  if (!user) return res.status(400).json({ error: 'User not found' });

  let log = exercises.filter(ex => ex.userId === user._id);

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(ex => new Date(ex.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    log = log.filter(ex => new Date(ex.date) <= toDate);
  }
  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(({ description, duration, date }) => ({
      description, duration, date
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
