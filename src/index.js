const express = require("express");
const morgan = require("morgan");
const path = require("path");
const exphbs = require("express-handlebars");
const passport = require("passport");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const flash = require("connect-flash");

//Inicializacion
const app = express(); //app es mi servidor
require("./lib/passport"); //Archivo donde se encuentra lo referente a la atenticación

//Configuraciones
app.set("port", process.env.PORT || 3000); //Definir puerto de escucha
app.set("views", path.join(__dirname, "views")); //Carpeta de vistas
app.engine(".hbs", exphbs({ //Declaración del motor de plantillas a utilizar
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs"
}));
app.set("view engine", ".hbs"); // Activar motor de plantilas definido anteriormente

//Middlewares (Funciones que van a procesar algo antes de mandarlo al servidor)
app.use(session({ //Parámetros de express-session para guardar las sesiones en la base de datos
    secret: "MySecret",
    store: new SQLiteStore, // Almacenar en la base de datos
    resave: false,
    saveUninitialized: false
}));
app.use(morgan("dev"));
//Indica que solo aceptaremos datos sencillos más no imágenes u otro tipo de datos más complejo
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize()); //Inicializar passport
app.use(passport.session());
app.use(flash()); //Usar flash para enviar mensajes en las vistas

//Variables Globales
//Toma la info del usuario y lo que el servidor quiere responder, es para guardar variables gobales
app.use((req, res, next) => {
    app.locals.success = req.flash('success'); //Mensaje de éxito
    app.locals.message = req.flash('message'); //Mensaje de fallo
    app.locals.user = req.user; //Usuario actual, para poder usar sus datos en las vistas
    next();
});

//Rutas
app.use(require("./routes")); //Ruta principal de la aplicación
app.use(require("./routes/authentication")); //Rutas de autenticaciónn
// A cada ruta que tenga que ver con los usuarios le precederá un prefijo definido (/alumno ó /profesor)
app.use("/profesor", require("./routes/profesores")); //Rutas de profesores
app.use("/alumno", require("./routes/alumno"));

//Publico
app.use(express.static(path.join(__dirname, "public"))); //Indicar donde está la carpeta publica

//Inicio de servidor
app.listen(app.get("port"), () => {
    console.log("Servidor corriendo en el puerto: ", app.get("port"));
});