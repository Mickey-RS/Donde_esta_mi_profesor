//Archivo donde irá todo lo relacionado con el armado de horarios de cada usuario registrado
const express = require("express");
const router = express.Router();
const db = require("../database"); //Importa conexion a base de datos
const { isAlumLoggedIn } = require("../lib/auth"); //Proteger las rutas de alumno de de usuarios tipo profesor
const { isNotLoggedIn } = require("../lib/auth"); //Proteger las rutas de cualquiera que no esté registrado

router.get("/", isNotLoggedIn, isAlumLoggedIn, (req, res) => {
    const { id_alumno } = req.user;
    const query = db.prepare("SELECT horario.id_horario, materia_taller.nombre_mt, grupo.nombre_grupo, clase.dia, clase.hora_clase, profesor.nombre_prof, lugar.nombre_lugar FROM materia_taller, grupo, lugar, clase, horario, profesor WHERE clase.id_clase=horario.id_clase AND profesor.id_profesor=clase.id_profesor AND lugar.id_lugar=clase.id_lugar AND clase.id_mt=materia_taller.id_mt AND clase.id_grupo=grupo.id_grupo AND horario.id_alumno = ? ORDER BY nombre_mt;");
    const result = query.all(id_alumno);
    res.render("alumno/horarioPersonal", { result });
});

router.get("/agregar", isNotLoggedIn, isAlumLoggedIn, (req, res) => {
    res.render("alumno/agregarHorario"); //Mostrar la vista de búsqueda de materias
});

router.post("/agregar", (req, res) => { //Método que recibirá los datos que el usuario envíe mediante el formulario
    const { profesor, materia, grupo, dia, hora, lugar } = req.body;
    const nuevaConsulta = {
        profesor,
        materia,
        grupo,
        dia,
        hora,
        lugar
    }
    comodin = "%";
    const query = db.prepare("SELECT clase.id_clase, grupo.nombre_grupo, lugar.nombre_lugar, clase.hora_clase, clase.dia, materia_taller.nombre_mt, profesor.nombre_prof FROM lugar, clase, materia_taller, profesor, grupo WHERE profesor.id_profesor=clase.id_profesor AND lugar.id_lugar=clase.id_lugar AND materia_taller.id_mt=clase.id_mt AND profesor.id_profesor=clase.id_profesor AND clase.id_grupo=grupo.id_grupo AND profesor.nombre_prof LIKE ? AND materia_taller.nombre_mt LIKE ? AND clase.dia LIKE ? AND clase.hora_clase LIKE ? AND lugar.nombre_lugar LIKE ? AND grupo.nombre_grupo LIKE ? ORDER BY grupo.nombre_grupo;")
    const matches = query.all((nuevaConsulta.profesor += comodin), (nuevaConsulta.materia += comodin), (nuevaConsulta.dia += comodin), (nuevaConsulta.hora += comodin), (nuevaConsulta.lugar += comodin), (comodin += nuevaConsulta.grupo));
    let vacio = 0;
    if (matches.length == 0) {
        vacio = 1;
    }
    res.render("alumno/agregarHorario", { vacio, matches });
});

router.get("/agregar/Materia/:id", isNotLoggedIn, isAlumLoggedIn, (req, res) => {
    const { id } = req.params;
    const { id_alumno } = req.user;
    const query = db.prepare("INSERT INTO horario (id_clase, id_alumno) VALUES (?, ?)");
    query.run(id, id_alumno);
    req.flash("success", "¡Materia agregada correctamente!");
    res.redirect("/alumno/agregar");
});

router.get("/eliminarMateria/:id", isNotLoggedIn, isAlumLoggedIn, (req, res) => {
    const { id } = req.params;
    const query = db.prepare("DELETE FROM horario WHERE id_horario = ?");
    query.run(id);
    req.flash("success", "¡Materia eliminada correctamente!");
    res.redirect("/alumno");
});

module.exports = router;