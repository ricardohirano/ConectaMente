const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/sobre', (req, res) => {
  res.render('sobre');
});

app.get('/equipe', (req, res) => {
  res.render('equipe');
});

app.get('/equipe', (req, res) => {
  res.render('equipe');
});

app.get('/game', (req, res) => {
  res.render('game/index');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});