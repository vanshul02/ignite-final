const express = require('express');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ignitdb'
});

let ts = Date.now();

let date_ob = new Date(ts);
let date = date_ob.getDate();
let month = date_ob.getMonth() + 1;
let year = date_ob.getFullYear();
let currdate = year + "-" + month + "-" + date;

let check_flag = 0;
exports.logout = (req, res) => {
    check_flag = 0;
    return res.render('register');
};
exports.register = (req, res) => {
    check_flag = 0;
    console.log(req.body);
    const { username, name, email, dob, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            throw err;
        }
        if (results.length > 0) {
            console.log("Email already in use");
            return res.render('error', { message: "Email already exists" });
        }
        if (results.length == 0) {
            db.query('INSERT INTO users SET ?', { username: username, name: name, email: email, dob: dob, password: password }, (err, results) => {
                if (err) {
                    throw err;
                }
                else {
                    console.log(results);
                    return res.render('login');
                }
            });
        }
    });
};

let uname;
let uid;

exports.login = (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    uname = username;
    db.query('SELECT * FROM users WHERE username = ?', [uname], (err, results) => {

        if (results.length != 1) {
            return res.render('error', { message: "Invalid UserName" });
        }
        if (password == results[0].password) {
            uid = results[0].id;
            console.log(uid);
            check_flag = 1;
            return res.render('home', { uname: username });
        }
        else {
            return res.render('error', { message: "Invalid Password" });
        }
    });
};

exports.getgames = (req, res) => {
    // if (check_flag == 0) {
    //     return res.render('register');
    // }
    db.query('SELECT * FROM games', (err, results) => {
        res.render("withgames", { results: results });
    });
};

exports.createTournament = (req, res) => {
    if (check_flag == 0) {
        return res.render('register');
    }
    const { gid, date, maxplayer } = req.body;
    console.log(req.body);
    const win = -1;
    if (date < currdate) {
        return res.render('error', { message: "Date of Tournament must be after current date" });
    }
    db.query('SELECT * FROM games WHERE gameid = ?', [gid], (err, results) => {
        if (gid > 6 || gid < 1) {
            res.render('error', { message: "Invalid Game ID or GameID does not exists!" });;
        }
        else {
            db.query('INSERT INTO tournaments SET ?', { date: date, gid: gid, creatorid: uid, maxplayer: maxplayer, winner: win }, (err, results) => {

                if (err) {
                    throw err;
                }
                else {
                    console.log(results);
                    res.render('error', { message: "Tournament Successfully Created!" });;
                }
            });
        }
    });

};

exports.participate = (req, res) => {
    if (check_flag == 0) {
        return res.render('register');
    }
    const { pIN_tid } = req.body;
    console.log(req.body);
    let partplayers = 0;
    const dem = -1;
    db.query('SELECT * FROM tournaments WHERE tid = ?', [pIN_tid], (err, results) => {
        if (results.length == 0) {
            return res.render('error', { message: "Tournament ID does not exist!" });
        }
        if (results.length != 0) {
            if (results[0].date < currdate) {
                res.render('error', { message: "This is a past Tournament. You cannot participate in this!" });
            }
            if (results[0].winner != dem) {
                res.render('error', { message: "Winner of this Tournament has already been declared!" });
            }
            if (results[0].creatorid == uid) {
                res.render('error', { message: "You cannot participate in your own Tournament!" });
            }

            else {
                db.query('SELECT * FROM participating_in WHERE pIN_tid = ?', [pIN_tid], (err, results) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        for (ind in results) {
                            if (results[ind].pIN_userid == uid) {
                                return res.render('error', { message: "You are already a participant of this Tournament!" })
                            }
                            partplayers = partplayers + 1;
                        }
                        let maxp;
                        let gamid;
                        db.query('SELECT * FROM tournaments WHERE tid = ?', [pIN_tid], (err, results) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                maxp = results[0].maxplayer;
                                gamid = results[0].gid;
                                console.log(maxp, partplayers);
                                if (partplayers < maxp) {
                                    db.query('INSERT INTO participating_in SET ?', { pIN_tid: pIN_tid, pIN_userid: uid }, (err, results) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            db.query('INSERT INTO playing SET ?', { p_userid: uid, p_gameid: gamid }, (err, results) => {
                                                if (err) {
                                                    throw err;
                                                }
                                            });
                                            res.render('error', { message: "Participation Successful!" });
                                        }
                                    });
                                }
                                else {
                                    res.render('error', { message: "Maximum Players Reached! Please try in other tournaments" });
                                }
                            }
                        });
                    }
                });
            }
        }
    });
};

exports.tourn = (req, res) => {
    if (check_flag == 0) {
        return res.render('register');
    }
    db.query('SELECT * FROM games', (err, resl) => {
        if (err) {
            throw err;
        }
        db.query('SELECT * FROM tournaments WHERE creatorid = ?', [uid], (err, results) => {
            res.render('tournlist', { results: results, resl: resl });
        });
    });
};

exports.part = (req, res) => {
    if (check_flag == 0) {
        return res.render('register');
    }
    const { tournid } = req.body;
    console.log(req.body);
    db.query('SELECT pIN_userid FROM participating_in WHERE pIN_tid = ?', [tournid], (err, results) => {
        if (err) {
            throw err;
        }
        else {
            res.render('partlist', { results: results });
        }
    });
};

exports.declare = (req, res) => {
    if (check_flag == 0) {
        return res.render('register');
    }
    const { tournid, winid } = req.body;
    console.log(req.body);
    db.query('SELECT * FROM tournaments WHERE tid = ?', [tournid], (err, results) => {
        let temp = 0;
        console.log(results);
        for (var i in results) {
            if (results[i].tid == tournid) {
                temp = 1;
            }
        }
        console.log(temp);
        if (temp == 0) {
            res.render('error', { message: "Invalid Tournament ID" })
        }
        else {
            let flag = 0;
            if (results[0].creatorid != uid) {
                res.render('error', { message: "You are not the creator of this tournament" });
            }
            if (results[0].creatorid == uid) {
                db.query('SELECT * FROM participating_in WHERE pIN_tid = ?', [tournid], (err, result) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        for (var ind in result) {
                            if (result[ind].pIN_userid == winid) {
                                flag = 1;
                            }
                        }
                        const dem = -1;
                        if (flag == 0) {
                            res.render('error', { message: "Specified Player is not in Participant List" });
                        }
                        else {
                            if (results[0].winner != dem) {
                                res.render('error', { message: "Winner of this Tournament has already been declared!" });
                            }
                            else {
                                db.query('UPDATE tournaments SET ? WHERE tid = ?', [{ winner: winid }, tournid], (err, result1) => {
                                    res.render('error', { message: "Winner Declared!" });
                                });
                            }
                        }
                    }
                });
            }
        }
    });
};

exports.profile = (req, res) => {
    if (check_flag == 0) {
        return res.render('register');
    }
    db.query('SELECT * from users WHERE id = ?', [uid], (err, results) => {
        const dob = results[0].dob;
        let totaltourn;
        let totalpart;
        let totalwon;
        let name = results[0].name;
        db.query('SELECT count(*) as total FROM tournaments WHERE creatorid = ?', [uid], (err, result) => {
            totaltourn = result[0].total;
        });
        db.query('SELECT count(*) as total FROM tournaments WHERE winner = ?', [uid], (err, result) => {
            totalwon = result[0].total;
        });
        db.query('SELECT count(*) as total FROM participating_in WHERE pIN_userid = ?', [uid], (err, result) => {
            totalpart = result[0].total;
            console.log(dob, totaltourn, totalpart, totalwon);
            res.render('profile', { totaltourn: totaltourn, totalwon: totalwon, totalpart: totalpart, dob: dob, uname: uname, uid: uid, name: name });
        });

    });
};

exports.bgmi = (req, res) => {
    // if (check_flag == 0) {
    //     return res.render('register');
    // }
    let gid = 1;
    db.query('SELECT count(*) as total FROM tournaments WHERE gid = ?', [gid], (err, results) => {
        const tourn1 = results[0].total;
        db.query('SELECT count(*) as tot FROM playing WHERE p_gameid = ?', [gid], (err, resul) => {
            const play1 = resul[0].tot;
            console.log(gid, tourn1, play1);
            res.render('bgmi', { tourn: tourn1, play: play1 });
        });
    });
};
exports.codm = (req, res) => {
    // if (check_flag == 0) {
    //     return res.render('register');
    // }
    let gid = 2;
    db.query('SELECT count(*) as total FROM tournaments WHERE gid = ?', [gid], (err, results) => {
        const tourn1 = results[0].total;
        db.query('SELECT count(*) as tot FROM playing WHERE p_gameid = ?', [gid], (err, resul) => {
            const play1 = resul[0].tot;
            console.log(gid, tourn1, play1);
            res.render('codm', { tourn: tourn1, play: play1 });
        });
    });
};
exports.coc = (req, res) => {
    // if (check_flag == 0) {
    //     return res.render('register');
    // }
    let gid = 3;
    db.query('SELECT count(*) as total FROM tournaments WHERE gid = ?', [gid], (err, results) => {
        const tourn1 = results[0].total;
        db.query('SELECT count(*) as tot FROM playing WHERE p_gameid = ?', [gid], (err, resul) => {
            const play1 = resul[0].tot;
            console.log(gid, tourn1, play1);
            res.render('coc', { tourn: tourn1, play: play1 });
        });
    });
};
exports.warzone = (req, res) => {
    // if (check_flag == 0) {
    //     return res.render('register');
    // }
    let gid = 4;
    db.query('SELECT count(*) as total FROM tournaments WHERE gid = ?', [gid], (err, results) => {
        const tourn1 = results[0].total;
        db.query('SELECT count(*) as tot FROM playing WHERE p_gameid = ?', [gid], (err, resul) => {
            const play1 = resul[0].tot;
            console.log(gid, tourn1, play1);
            res.render('warzone', { tourn: tourn1, play: play1 });
        });
    });
};
exports.csgo = (req, res) => {
    // if (check_flag == 0) {
    //     return res.render('register');
    // }
    let gid = 5;
    db.query('SELECT count(*) as total FROM tournaments WHERE gid = ?', [gid], (err, results) => {
        const tourn1 = results[0].total;
        db.query('SELECT count(*) as tot FROM playing WHERE p_gameid = ?', [gid], (err, resul) => {
            const play1 = resul[0].tot;
            console.log(gid, tourn1, play1);
            res.render('csgo', { tourn: tourn1, play: play1 });
        });
    });
};
exports.valorant = (req, res) => {
    // if (check_flag == 0) {
    //     return res.render('register');
    // }
    let gid = 6;
    db.query('SELECT count(*) as total FROM tournaments WHERE gid = ?', [gid], (err, results) => {
        const tourn1 = results[0].total;
        db.query('SELECT count(*) as tot FROM playing WHERE p_gameid = ?', [gid], (err, resul) => {
            const play1 = resul[0].tot;
            console.log(gid, tourn1, play1);
            res.render('valorant', { tourn: tourn1, play: play1 });
        });
    });
};