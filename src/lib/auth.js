module.exports = {
    isLoggedIn(req, res, next) { //Se usará para redireccionar a los usuarios registrados a su respectivo menú inicial
        var usuario;
        var discriminante;
        try { //Si hay alguien autenticado
            usuario = req.user;
            discriminante = typeof usuario.id_alumno;
            if (discriminante == "number") { //Se trata de un alumno
                if (req.isAuthenticated()) {
                    return res.redirect("/alumno")
                }
            } else { //Se trata de un profesor
                if (req.isAuthenticated()) {
                    return res.redirect("/profesor")
                }
            }
        } catch (error) { //Nadie ha iniciado sesión
            return next();
        }
    },
    isProfLoggedIn(req, res, next) { //Evitar que los usuarios de tipo alumno puedan entrar en las rutas de profesores
        var usuario = req.user;
        var discriminante = typeof usuario.id_alumno;;
        if (discriminante == "number") { //Se trata de un alumno
            if (req.isAuthenticated()) {
                return res.redirect("/alumno");
            }
        } else { //Se trata de un profesor
            if (req.isAuthenticated()) {
                return next();
            }
        }
    },
    isAlumLoggedIn(req, res, next) { //Evitar que los usuarios de tipo profesor puedan entrar en las rutas de alumnos
        var usuario = req.user;
        var discriminante = typeof usuario.id_alumno;;
        if (discriminante == "number") { //Se trata de un alumno
            if (req.isAuthenticated()) {
                return next();
            }
        } else { //Se trata de un profesor
            if (req.isAuthenticated()) {
                return res.redirect("/profesor");
            }
        }
    },
    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return res.redirect("/");
        } else {
            return next();
        }
    }
};