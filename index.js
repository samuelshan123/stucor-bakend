const express = require('express')
const db=require('./db_connection')
const app = express()
const port = 3000
var bodyParser = require('body-parser');
// app.use(express.static("public"))
app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({
  extended: true
}));

// api calls -----------------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/login',async (req,res)=>{
  console.log(req.body)

  if (req.body.role === 'student') {
    var sql_query = `SELECT * FROM students WHERE regno = ? AND dob = ?`
    var values = [req.body.formdata.regno, req.body.formdata.dob]
  } else {

    var sql_query = `SELECT * FROM staffs WHERE email = ? AND password = ?`
    var values = [req.body.formdata.email, req.body.formdata.password]
    
  }
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;

    if (result.length>0) {
      console.log(result);
      res.send(result)  
    } else {
      res.send("invalid")
      
    }
  })
})


// checks server ststus-----------------------------------------------------------------------------------------

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})