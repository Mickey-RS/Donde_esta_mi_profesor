//Archivo para almacenar las rutas principales de la aplicación
const express = require("express");
const router = express.Router();
const db = require("../database"); //Importa conexion a base de datos
const { isLoggedIn } = require("../lib/auth");

router.get("/", isLoggedIn, (req, res) => {
    res.render("index");
})

router.post("/", (req, res) => { //Método que recibirá los datos que el usuario envíe mediante el formulario
    const { profesorAsesoria, materiaAsesoria } = req.body;
    if (typeof profesorAsesoria == "undefined") { //Se están consultando clases
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
        const query = db.prepare("SELECT grupo.nombre_grupo, lugar.nombre_lugar, clase.hora_clase, clase.dia, materia_taller.nombre_mt, profesor.nombre_prof FROM lugar, clase, materia_taller, profesor, grupo WHERE profesor.id_profesor=clase.id_profesor AND lugar.id_lugar=clase.id_lugar AND materia_taller.id_mt=clase.id_mt AND profesor.id_profesor=clase.id_profesor AND clase.id_grupo=grupo.id_grupo AND profesor.nombre_prof LIKE ? AND materia_taller.nombre_mt LIKE ? AND clase.dia LIKE ? AND clase.hora_clase LIKE ? AND lugar.nombre_lugar LIKE ? AND grupo.nombre_grupo LIKE ? ORDER BY grupo.nombre_grupo;")
        const matches = query.all((nuevaConsulta.profesor += comodin), (nuevaConsulta.materia += comodin), (nuevaConsulta.dia += comodin), (nuevaConsulta.hora += comodin), (nuevaConsulta.lugar += comodin), (comodin += nuevaConsulta.grupo));
        let vacio = 0;
        let mode = 0; //Variable para indicarle a la vista que se han consultado clases
        if (matches.length == 0) {
            vacio = 1;
        }
        res.render("index", { vacio, matches, mode });
    } else { //Se están consultando asesorías
        const consulta = {
            profesorAsesoria,
            materiaAsesoria
        }
        comodin = "%";
        const query = db.prepare("SELECT nombre_mt, nombre_prof, hora_ent, hora_sal, dia, hora_asesoria, nombre_lugar FROM materia_taller, profesor, asesoria, lugar WHERE materia_taller.id_mt=asesoria.id_mt AND profesor.id_profesor=asesoria.id_profesor AND lugar.id_lugar=asesoria.id_lugar AND profesor.nombre_prof LIKE ? AND materia_taller.nombre_mt LIKE ?;");
        const asesorias = query.all(consulta.profesorAsesoria += comodin, consulta.materiaAsesoria += comodin);
        let vacio = 0;
        let mode = 1; //Variable para indicarle a la vista que se han consultado asesorias
        if (asesorias.length == 0) {
            vacio = 1;
        }
        res.render("index", { vacio, asesorias, mode });
    }
});

module.exports = router;