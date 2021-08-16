var mysql = require('mysql');
var db_info = {
    host: '101.101.209.65',
    user: 'root',
    port: '3306',
    password: 'joyjoydbdb1886*',
    datebase: 'joyvolume'
}

module.exports = {
    init: function () {
        return mysql.createConnection(db_info);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql connection error : ' + err);
            else console.log('mysql is connected successfully!');
        });
    }
}