const mysql = require('mysql');
const UserSchema = new mysql.Schema({

    userName: String,
    password: String

})

module.exports = mysql.model('user', UserSchema);