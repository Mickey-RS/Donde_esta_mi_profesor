//Archivo donde irá todo lo relacionado con el inicio de sesión de cada cliente
const express = require("express");
const router = express.Router();
const passport = require("passport");
const db = require("../database");
const { isLoggedIn } = require("../lib/auth");
const { isNotLoggedIn } = require("../lib/auth");

router.get("/registro", isLoggedIn, (req, res) => {
    res.render("auth/registro");
});

router.get("/registroProfesor", isLoggedIn, (req, res) => {
    res.render("auth/registroProf");
});

router.post("/registro", passport.authenticate("local.registro", {
    successRedirect: "/alumno",
    failureRedirect: "/registro",
    failureFlash: true
}));

router.post("/registroProfesor", passport.authenticate("registro.profesor", {
    successRedirect: "/profesor",
    failureRedirect: "/registroProfesor",
    failureFlash: true
}));

router.get("/ingresar", isLoggedIn, (req, res) => {
    res.render("auth/ingresar");
});

router.post("/ingresar", (req, res, next) => {
    const { TipoProf } = req.body;
    if (TipoProf == 'on') {
        passport.authenticate("ingreso.profesor", {
            successRedirect: "/profesor",
            failureRedirect: "/ingresar",
            failureFlash: true
        })(req, res, next);
    } else {
        passport.authenticate("local.ingresar", {
            successRedirect: "/alumno",
            failureRedirect: "/ingresar",
            failureFlash: true
        })(req, res, next);
    }
});

router.get("/cerrarSesion", isNotLoggedIn, (req, res) => {
    const usuarioActual = req.user;
    const discriminante = typeof usuarioActual.id_alumno;
    if (discriminante == "number") { //Se trata de un alumno
        const query = db.prepare("UPDATE alumno SET last_usage = datetime('now', 'localtime') WHERE id_alumno = ?");
        query.run(usuarioActual.id_alumno);
    } else { //Se trata de un profesor
        const query = db.prepare("UPDATE profesor SET last_usage = datetime('now', 'localtime') WHERE id_profesor = ?");
        query.run(usuarioActual.id_profesor);
    }
    req.logOut();
    res.redirect("/ingresar");
});

module.exports = router;