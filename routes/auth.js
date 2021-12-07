const express = require('express');
const router = express.Router();
const AuthController = require('../Controllers/auth');

router.post('/register', AuthController.register);
router.get('/logout', AuthController.logout);
router.post('/login', AuthController.login);
router.post('/createTournament', AuthController.createTournament);
router.post('/getgame', AuthController.getgames);
router.post('/participate', AuthController.participate);
router.post('/part', AuthController.part);
router.post('/tourn', AuthController.tourn);
router.post('/declare', AuthController.declare);
router.get('/profile', AuthController.profile);
router.get('/bgmi', AuthController.bgmi);
router.get('/codm', AuthController.codm);
router.get('/coc', AuthController.coc);
router.get('/warzone', AuthController.warzone);
router.get('/valorant', AuthController.valorant);
router.get('/csgo', AuthController.csgo);


module.exports = router;