const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../database");
const helpers = require("../lib/helpers");
var discriminante;

//Ingreso de profesores y alumnos

passport.use("local.ingresar", new LocalStrategy({
    usernameField: "mail",
    passwordField: "password",
    passReqToCallback: true
}, (req, mail, password, done) => {
    const query = db.prepare("SELECT * FROM alumno WHERE email = ?");
    const result = query.all(mail);
    if (result.length > 0) {
        const user = result[0];
        const validPassword = helpers.matchPassword(password, user.pass);
        if (validPassword) {
            done(null, user, req.flash("success", "Bienvenido " + user.nombre));
        } else {
            done(null, false, req.flash("message", "Contraseña Inorrecta"));
        }
    } else {
        return done(null, false, req.flash("message", "No existe ninguna cuenta de alumno asociada a este email"));
    }
}));

passport.use("ingreso.profesor", new LocalStrategy({
    usernameField: "mail",
    passwordField: "password",
    passReqToCallback: true
}, (req, mail, password, done) => {
    const query = db.prepare("SELECT * FROM profesor WHERE email = ?");
    const result = query.all(mail);
    if (result.length > 0) {
        const userProf = result[0];
        const validPassword = helpers.matchPassword(password, userProf.pass);
        if (validPassword) {
            done(null, userProf, req.flash("success", "Bienvenido " + userProf.nombre_prof));
        } else {
            done(null, false, req.flash("message", "Contraseña incorrecta"));
        }
    } else {
        return done(null, false, req.flash("message", "No existe ninguna cuenta de profesor asociada a este email"))
    }
}));

//Registro de profesores y alumnos

passport.use("local.registro", new LocalStrategy({ //Alumno
    usernameField: "mail",
    passwordField: "password",
    passReqToCallback: true
}, (req, mail, password, done) => {
    const { nombre } = req.body;
    const newUser = {
        mail,
        password,
        nombre
    }
    newUser.password = helpers.encryptPassword(password);
    const verifmail = db.prepare("SELECT * FROM alumno WHERE email = ?")
    const counter = verifmail.all(newUser.mail);
    if (counter.length == 0) { //Si no está registrado ese correo
        const query = db.prepare("INSERT INTO alumno (nombre, email, pass) VALUES (?, ?, ?);");
        const result = query.run(newUser.nombre, newUser.mail, newUser.password);
        req.flash("success", "Registro correcto");
        newUser.id_alumno = result.lastInsertRowid;
        return done(null, newUser);
    } else { //Ya existe ese correo
        return done(null, false, req.flash("message", "Ya existe una cuenta de alumno con ese correo"));
    }
}));

passport.use("registro.profesor", new LocalStrategy({
    usernameField: "mailProf",
    passwordField: "passwordProf",
    passReqToCallback: true
}, (req, mailProf, passwordProf, done) => {
    const { nombreProfRegistro } = req.body;
    const newUser = {
        mailProf,
        passwordProf,
        nombreProfRegistro
    }
    newUser.passwordProf = helpers.encryptPassword(passwordProf);
    const verifmail = db.prepare("SELECT * FROM profesor WHERE email = ?")
    const counter = verifmail.all(newUser.mailProf);
    if (counter.length == 0) {
        const query = db.prepare("UPDATE profesor SET email = ?, pass = ? WHERE nombre_prof = ?;");
        const result = query.run(newUser.mailProf, newUser.passwordProf, newUser.nombreProfRegistro);
        if (result.changes == 0) {
            return done(null, false, req.flash("message", "No se encuentra en la base de datos de profesores, contacte al administrador."));
        } else {
            const Q2 = db.prepare("SELECT id_profesor FROM profesor WHERE email = ?");
            const result = Q2.get(newUser.mailProf);
            newUser.id_profesor = result.id_profesor;
            req.flash("success", "Registro correcto");
            authProf = 1;
            return done(null, newUser);
        }
    } else {
        return done(null, false, req.flash("message", "Ya existe una cuenta de profesor con ese correo"));
    }
}));

passport.serializeUser((user, done) => {
    discriminante = typeof user.id_alumno; //Si devuelve tipo "number" significa que se trata de un alumno
    if (discriminante == "number") {
        done(null, user.id_alumno);
    } else { //Se trata de un profesor
        done(null, user.id_profesor);
    }
});

passport.deserializeUser((id, done) => {
    if (discriminante == "number") {
        const query = db.prepare("SELECT * FROM alumno WHERE id_alumno = ?");
        const row = query.all(id);
        done(null, row[0]);
    } else {
        const query = db.prepare("SELECT * FROM profesor WHERE id_profesor = ?");
        const row = query.all(id);
        done(null, row[0]);
    }
});