require('./config/config');

const express = require('express');
const app = express();
const http = require('http')
const _ =require('lodash')
const userinfo = require('./Models/userinfo') 
var md5 = require('md5');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const sequalize = require('./config/database');
const {validateEmail,alphabetstring,Numbers,PasswordValidate} = require('./validation') 
const port = process.env.PORT;
 
app.use(bodyParser.json());
app.use(express.static('public'));
app.post('/newUser',  async function (req, res) {

    try {
        var body = _.pick(req.body ,'username','mobileNumber','email','password');

        if (!body.username) {
            res.status(500);
            res.send({ "message": "please enter username" });
        }
        else if (!body.mobileNumber) {
            res.status(500);
            res.send({ "message": "please enter MobileNumber" });
        }
        else if (!body.email) {
            res.status(500);
            res.send({ "message": "please enter emailid" });
        }
        else if (!body.password) {
            res.status(500);
            res.send({ "message": "please enter password" });
        }
        else if (!alphabetstring(body.username)) {
            res.status(500);
            res.send({ "message": "UserName Should Contain only Alphabets" });
        }
        else if ((body.username).length <=2) {
            res.status(500);
            res.send({ "message": "UserName Should Contain Mininum 3 Character" });
        }
        else if (!Numbers(body.mobileNumber)) {
            res.status(500);
            res.send({ "message": "MobileNumber Should Contain only Numbers" });
        }
        else if (!((body.mobileNumber).length >=7 ||(body.mobileNumber).length <=13)) {
            res.status(500);
            res.send({ "message": "Kinldy provide Valid Mobile Number" });
        }
        else if (!validateEmail(body.email)) {
            res.status(500);
            res.send({ "message": "Please Provide Valid Mail ID" });
        }
        else if (!PasswordValidate(body.password)) {
            res.status(500);
            res.send({ "message": "Password Should Contain Minimum 7 characters includues at least one numeric and a special character.Please try again!!!" });
        }

        else{
            sequalize.query(`select Count(userName)As count from userinfo where userName = '${body.username}' and  emailid = '${body.email}' `, {type: Sequelize.QueryTypes.SELECT})
            .then(r =>{
                if(r[0].count>= 1)
                {
                    res.status(500);
                    res.send({ "message": "Username and mail id already exists" });
                }
                else{
            const a = new userinfo(body);
            a.userName = body.username;
            a.mobile = body.mobileNumber;
            a.emailId = body.email;
            a.password = md5(body.password)
            
           a.save().then(rs => {
               res.status(200).json({"message": "User Created successfully"});
               });
            }
        })
    }
      
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});


app.get('/getUsers', async function (req, res) {

    try {
      var data = []
     userinfo.findAll()
.then(element=>{ 
    element.forEach(e=>{
    const userlist = {
        name: e.userName,
        mobile:e.mobile
 }
  data.push(userlist)
})
res.send(data);
     
})

} catch (err) {
    console.log(err);
    res.status(500).json(err);
}
});




app.delete('/deleteUser',  async function (req, res) {

    try {
        var body = _.pick(req.body ,'username');
        if (!body.username) {
            res.status(500);
            res.send({ "message": "please enter username" });
        }

        sequalize.query(`select Count(userName)As count from userinfo where userName = '${body.username}'`, {type: Sequelize.QueryTypes.SELECT})
        .then(r =>{
            if(r[0].count == 0)
            {
                res.status(500);
                res.send({ "message": "User not Found in the Record" });
            }
            else{
                userinfo.destroy({
                    where: {
                        userName: body.username
                    }
                }).then(rs => {
                    res.status(200).json({"message": "User Deleted successfully"});
                    });
                
            }

            
         }
         );
    


} catch (err) {
    console.log(err);
    res.status(500).json(err);
}
});









app.listen(port, () => {
    console.log(`listining on port ${port}`);
      
});