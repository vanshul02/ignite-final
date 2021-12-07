const express = require('express');
const router = express.Router();

router.get('/createTournament', (req, res) => {
    res.render('createTournament.ejs');
});
router.get('/declareWinner', (req, res) => {
    res.render('declareWinner.ejs');
});
router.get('/withgames', (req, res) => {
    res.render('withgames.ejs');
});
router.get('/login', (req, res) => {
    res.render('login.ejs');
});
router.get('/', (req, res) => {
    res.render('register.ejs');
});
router.get('/participate', (req, res) => {
    res.render('participate.ejs');
});
router.get('/home', (req, res) => {
    res.render('home.ejs');
});
router.get('/error', (req, res) => {
    res.render('error.ejs');
});

module.exports = router;