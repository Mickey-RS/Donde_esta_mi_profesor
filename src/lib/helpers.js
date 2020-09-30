//Dentro de éste archivo es donde declararemos algunas funciones útiles, como los helpers, ya que no podemos ejecutar una funcióndentro de handlebars
//Métodos para procesar determinados datos
const bcrypt = require("bcryptjs");
const helpers = {}

helpers.encryptPassword = (password) => {
    try {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        return hash;
    } catch (error) {
        console.log(error.message);
    }
};

helpers.matchPassword = (password, savedPassword) => {
    try {
        return bcrypt.compareSync(password, savedPassword);
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = helpers;