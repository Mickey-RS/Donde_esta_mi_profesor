//Todo lo que tiene que ver con los profesores
const express = require("express");
const router = express.Router();
const db = require("../database");
const { isProfLoggedIn } = require("../lib/auth"); //Módulo para proteger las rutas de los usuarios tipo alumno
const { isNotLoggedIn } = require("../lib/auth"); //Módulo para proteger las rutas de los usuarios no registrados

router.get("/", isNotLoggedIn, isProfLoggedIn, (req, res) => {
    const prof = req.user;
    const query = db.prepare("SELECT id_asesoria, dia, hora_asesoria, nombre_mt, nombre_lugar FROM asesoria, materia_taller, lugar WHERE id_profesor = ? AND asesoria.id_mt=materia_taller.id_mt AND asesoria.id_lugar=lugar.id_lugar;")
    const result = query.all(prof.id_profesor);
    res.render("profesor/perfil", { result });
});

router.post("/actualizarHorario", isProfLoggedIn, (req, res) => {
    const { HoraEnt, HoraSal } = req.body;
    const { id_profesor } = req.user;
    const query = db.prepare("UPDATE profesor SET hora_ent = ?, hora_sal = ? WHERE id_profesor = ?;")
    query.run(HoraEnt, HoraSal, id_profesor);
    req.flash("success", "¡Horario actualizado correctamente!");
    res.redirect("/profesor");
});

router.post("/agregarAsesoria", isProfLoggedIn, (req, res) => {
    const { MatAsesoria, DiaAsesoria, HoraAsesoria, LugarAsesoria } = req.body;
    const prof = req.user;
    const queryIDs = db.prepare("SELECT id_mt, id_lugar FROM materia_taller, lugar WHERE nombre_mt = ? AND nombre_lugar = ?;");
    try {
        const ids = queryIDs.get(MatAsesoria, LugarAsesoria);
        const query = db.prepare("INSERT INTO asesoria (hora_asesoria, dia, id_mt, id_profesor, id_lugar) VALUES (?, ?, ?, ?, ?);");
        query.run(HoraAsesoria, DiaAsesoria, ids.id_mt, prof.id_profesor, ids.id_lugar);
        req.flash("success", "Asesoría agregada correctamente");
    } catch (error) {
        req.flash("message", "No se pudo agregar la asesoría, alguno de los campos es inválido");
    }
    res.redirect("/profesor");
});

router.get("/eliminarAsesoria/:id", isNotLoggedIn, isProfLoggedIn, (req, res) => {
    const { id } = req.params;
    const query = db.prepare("DELETE FROM asesoria WHERE id_asesoria = ?;")
    query.run(id);
    req.flash("success", "¡Asesoría eliminada correctamente!")
    res.redirect("/profesor");
});

module.exports = router;