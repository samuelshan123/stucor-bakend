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


app.post('/login',(req,res)=>{
  console.log(req.body)
  db.query("select * from students where registerno=? and dob=? ",[req.body.registerno,req.body.dob],(err,result)=>{
    if(err) throw err;

    res.send(result)
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