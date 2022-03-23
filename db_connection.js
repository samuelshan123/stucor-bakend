
var mysql = require('mysql');

module.exports = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database:"stucor"

});

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });