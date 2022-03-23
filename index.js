const express = require('express')
const db=require('./db_connection')
const app = express()
const port = 3000
var bodyParser = require('body-parser');
app.use(express.static("public"))
app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({
  extended: true
}));

// api calls -----------------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.get('/forms',(req,res)=>{
  db.query("select * from forms",(err,result)=>{
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