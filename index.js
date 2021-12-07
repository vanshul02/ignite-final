const express = require('express');
const path = require('path');
const mysql = require('mysql');

const app = express();
const port = 8000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ignitdb'
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

db.connect((err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Connected");
    }
});

app.use('/tournaments', (req, res) => {
    db.query('SELECT * FROM games', (err, resl) => {
        if (err) {
            throw err;
        }
        db.query('SELECT * FROM tournaments', (err, results) => {
            res.render('tournlist', { results: results, resl: resl });
        });
    });
});
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(port);