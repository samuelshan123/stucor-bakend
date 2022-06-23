const express = require('express')
const db=require('./db_connection')
const app = express()
const cors=require('cors')
const port = 3000
var bodyParser = require('body-parser');
// app.use(express.static("public"))
app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cors({
  origin: '*'
}));
// api calls -----------------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.send('Hello World!')
})

//login
app.post('/login',async (req,res)=>{
  console.log(req.body)

  if (req.body.role === 'student') {
    var sql_query = `SELECT * FROM students WHERE regno = ? AND dob = ?`
    var values = [req.body.formdata.regno, req.body.formdata.dob]
  } else if(req.body.role === 'staff') {
    var sql_query = `SELECT * FROM staffs WHERE email = ? AND password = ?`
    var values = [req.body.formdata.email, req.body.formdata.password] 
  }
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;

    if (result.length>0) {
      console.log(result);
      res.send({user:result,status:"success"})  
    } else {
      res.send({status:"failed"})
      
    }
  })
})

//request form

app.post('/request',async (req,res)=>{
  console.log(req.body);
  console.log(req.body.user_id)
  var sql_query = `INSERT INTO forms(user_id,description,status,form_type,requested_at) VALUES(?,?,?,?,?)`
  var values = [req.body.user_id,req.body.description,req.body.status,req.body.form_type,req.body.requested_at]
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    console.log(result);
    if (result.affectedRows>0) {
      res.send({status:"success"})

    } else {
      res.send({status:"failed"})
    }
  })
})

//get students for form

app.post('/getstudents',async (req,res)=>{
  await db.query(`SELECT id,name FROM students WHERE department = ? AND semester = ?`,[req.body.department,req.body.semester],(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({students:result,status:"success"})  
    } else {
      res.send({status:"failed"})
      
    }
  })
})

// new requests
app.post('/getrequests',async (req,res)=>{
  console.log(req.body);

  if (req.body.role === 'hod') {
    var sql_query = `SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id WHERE stucor.students.department=? and stucor.forms.status='AFI' order by stucor.forms.request_id desc`
    var values = [req.body.department]
  }
    
  else if(req.body.role === 'in-charge') {
    var sql_query=`SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id 
    where stucor.students.department=? and stucor.students.semester=? and stucor.forms.status='PFI' order by stucor.forms.request_id desc`
    var values = [req.body.department,req.body.semester]
  }
  else if(req.body.role === 'principal') {
    var sql_query=`SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id where stucor.forms.status='AFH' and stucor.forms.form_type ='gate pass' order by stucor.forms.request_id desc`
    values = null
  }

  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({requests:result,status:"success"})  
    } else {
      res.send({status:"failed"})
      
    }
  })
})

// Approve or enquire forms

app.post('/action',async (req,res)=>{
  console.log("body",req.body);
  var sql_query,values
  if (req.body.role=== 'in-charge') {
     sql_query = `UPDATE forms SET status=?,incharge_id=?,iactioned_at=? WHERE user_id=? and request_id=?`
     values = [req.body.status,req.body.incharge_id,req.body.iactioned_at,req.body.id,req.body.request_id]
  }
  else if(req.body.role === 'hod') {
     sql_query = `UPDATE forms SET status=?,hod_id=?,hactioned_at=? WHERE user_id=? and request_id=?`
     values = [req.body.status,req.body.hod_id,req.body.hactioned_at,req.body.id,req.body.request_id]
  }
  else if(req.body.role === 'principal') {
    console.log("body",req.body);

     sql_query = "UPDATE forms SET status=?,pactioned_at=? ,principal_id=? WHERE user_id=? and request_id=?"
     values = [req.body.status,req.body.pactioned_at,req.body.principal_id,req.body.id,req.body.request_id]
  }
 
  await db.query(sql_query,values,(err,result)=>{
    console.log("resr",result);
    if(err) throw err;
    if (result.affectedRows>0) {
      res.send({status:"success"})  
    } else {
      res.send({status:"failed"})
    }
  })
})



//notifications 

app.post('/notifications',async (req,res)=>{
  console.log(req.body);
  var sql_query = `SELECT stucor.staffs.name,stucor.forms.request_id,stucor.forms.status,stucor.forms.iactioned_at,stucor.forms.description,stucor.forms.form_type,stucor.forms.requested_at FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id left join stucor.staffs on stucor.forms.incharge_id= stucor.staffs.id WHERE stucor.students.id=? and stucor.forms.status='AFI' order by stucor.forms.request_id desc`
  var values = [req.body.id]
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({data:result,status:"success"})  
    } else {
      res.send({status:"failed"})
    }
  })
})

// principal notifications

app.post('/principalApproved',async (req,res)=>{
  console.log(req.body);
  var sql_query = `SELECT stucor.staffs.name,stucor.forms.request_id,stucor.forms.status,stucor.forms.pactioned_at,stucor.forms.description,stucor.forms.form_type,stucor.forms.requested_at FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id left join stucor.staffs on stucor.forms.principal_id= stucor.staffs.id WHERE stucor.students.id=? and stucor.forms.status='completed' order by stucor.forms.request_id desc`
  var values = [req.body.id]
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({data:result,status:"success"})  
    } else {
      res.send({status:"failed"})
    }
  })
})

// get AfH forms
app.post('/hodApproved',async (req,res)=>{
  console.log(req.body);
  var sql_query = `SELECT stucor.staffs.name,stucor.forms.status,stucor.forms.hactioned_at,stucor.forms.description,stucor.forms.form_type,stucor.forms.requested_at FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id left join stucor.staffs on stucor.forms.hod_id= stucor.staffs.id WHERE stucor.students.id=? and stucor.forms.status='AFH' order by stucor.forms.request_id desc`
  var values = [req.body.id]
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({data:result,status:"success"})  
    } else {
      res.send({status:"failed"})
    }
  })
})


// completed forms

app.post('/completed',async (req,res)=>{
  console.log(req.body);
  if (req.body.role==='student') {
    var sql_query = `SELECT stucor.staffs.name,stucor.forms.status,stucor.forms.hactioned_at,stucor.forms.description,stucor.forms.form_type,stucor.forms.requested_at FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id left join stucor.staffs on stucor.forms.hod_id= stucor.staffs.id WHERE stucor.students.id=? and stucor.forms.status='AFH' and stucor.forms.form_type ='leave form' order by stucor.forms.request_id desc`
  var values = [req.body.id] 
  }
  else if(req.body.role==='hod') {
    var sql_query = `SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id WHERE stucor.students.department=? and stucor.forms.status='AFH' order by stucor.forms.request_id desc`
    var values = [req.body.department]
  }
  else if(req.body.role==='in-charge') {
    var sql_query = `SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id WHERE stucor.students.department=? and stucor.students.semester=? and stucor.forms.status='AFH' order by stucor.forms.request_id desc`
    var values = [req.body.department,req.body.semester]
  }
 
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({data:result,status:"success"})  
    } else {
      res.send({status:"failed"})
    }
  })  
})

// need enquire forms

app.post('/inchargeInquiry',async (req,res)=>{
  console.log(req.body);
  var sql_query = `SELECT stucor.staffs.name,stucor.forms.status,stucor.forms.iactioned_at,stucor.forms.description,stucor.forms.form_type,stucor.forms.requested_at FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id left join stucor.staffs on stucor.forms.incharge_id= stucor.staffs.id WHERE stucor.students.id=? and stucor.forms.status='EFI' order by stucor.forms.request_id desc`

  var values = [req.body.id]
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({data:result,status:"success"})  
    } else {
      res.send({status:"failed"})
    }
  })  
})

// hod enquiry 

app.post('/hodInquiry',async (req,res)=>{
  console.log(req.body);
  var sql_query = `SELECT stucor.staffs.name,stucor.forms.status,stucor.forms.hactioned_at,stucor.forms.description,stucor.forms.form_type,stucor.forms.requested_at FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id left join stucor.staffs on stucor.forms.hod_id= stucor.staffs.id WHERE stucor.students.id=? and stucor.forms.status='EFH' order by stucor.forms.request_id desc`
  var values = [req.body.id]
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({data:result,status:"success"})  
    } else {
      res.send({status:"failed"})
    }
  })  
})

//actions required
app.post('/actionsRequired',async (req,res)=>{
  console.log(req.body);

  if (req.body.role==='in-charge') {
    var sql_query = `SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id 
  where stucor.students.department=? and stucor.students.semester=? and stucor.forms.status='EFI' order by stucor.forms.request_id desc`
  var values = [req.body.department,req.body.semester] 
  }
  else if(req.body.role==='hod'){
    var sql_query = `SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id 
  where stucor.students.department=?  and stucor.forms.status='EFH' order by stucor.forms.request_id desc`
  var values = [req.body.department,req.body.semester] 
  }
 
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({requests:result,status:"success"})  
    } else {
      res.send({status:"failed"})
    }
  })  
})


// student IAction
 app.post('/studentIaction',async (req,res)=>{
  console.log(req.body);
  var sql_query=`SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id 
  where stucor.students.department=? and stucor.students.semester=? and stucor.forms.status='EFI'order by stucor.forms.request_id desc`
  var values = [req.body.department,req.body.semester]

  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({requests:result,status:"success"})  
    } else {
      res.send({status:"failed"})
    }
  })

}
)

// student HAction
app.post('/studentHaction',async (req,res)=>{
  console.log(req.body);
  var sql_query=`SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id 
  where stucor.students.department=? and stucor.students.semester=? and stucor.forms.status='EFH' order by stucor.forms.request_id desc`
  var values = [req.body.department,req.body.semester]
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({requests:result,status:"success"})  
    } else {
      res.send({status:"failed"})
    }
  })

}
)
// check form already checked
app.post('/verifycheckForm',async (req,res)=>{
console.log('hitted');
  var sql_query=`SELECT * FROM stucor.forms where forms.request_id=?`
  var values = [req.body.request_id]
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    console.log(result);
    if (result.length>0 && result[0].status==='completed') {
      console.log('hello');
      console.log(result);
      res.send({data:result,status:"success"})  
    }
    // else if(){}
     else {
      res.send({status:"failed"})
    }
  })

})

//check out form {}
app.post('/checkoutForm',async (req,res)=>{
  console.log(req.body);  
  var sql_query = `UPDATE stucor.forms SET forms.status='CO', forms.security_id=? ,forms.checked_at=? WHERE forms.request_id=?`
  var values = [req.body.security_id,req.body.checked_at,req.body.request_id]
  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.affectedRows>0) {
      console.log(result);
      res.send({status:"success",data:result})  
    } else {
      res.send({status:"failed"})
    }
  })  
})

//checked out form
app.post('/checkedOutForm',async (req,res)=>{
  console.log(req.body);
  if (req.body.role==='in-charge') {
    var sql_query = `SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id where  stucor.forms.status='CO'and stucor.students.department=? and stucor.students.semester=? order by stucor.forms.request_id desc`
    var values = [req.body.department,req.body.semester]

  }
  else if(req.body.role==='hod'){
    var sql_query = `SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id where  stucor.forms.status='CO' and stucor.students.department=? order by stucor.forms.request_id desc`
    var values = [req.body.department]

  }
  else if(req.body.role==='student'){
    var sql_query = `SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id where  stucor.forms.status='CO' and stucor.students.id=? order by stucor.forms.request_id desc`
    var values = [req.body.id]
  }
  else{
    var sql_query=`SELECT * FROM stucor.forms left join stucor.students on stucor.students.id =stucor.forms.user_id 
    where     stucor.forms.status='CO' order by stucor.forms.request_id desc`
    var values = null
  }
  

  await db.query(sql_query,values,(err,result)=>{
    if(err) throw err;
    if (result.length>0) {
      console.log(result);
      res.send({requests:result,status:"success"})  
    } else {
      res.send({status:"failed"})
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