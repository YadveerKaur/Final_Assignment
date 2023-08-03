const mongoose=require('mongoose')
var Schema=mongoose.Schema;
const bcrypt = require('bcryptjs');
var userSchema=new Schema({
"userName":{
    type: String,
    unique: true
},
"password":String,
"email": String,
"loginHistory":[
    {
        "dateTime": Date,
        "userAgent": String

    }
]
});
let User;//XavfTbJeYZAYXuJy
//mongodb+srv://yadveer-kaur5:XavfTbJeYZAYXuJy@senecaweb.4rnow52.mongodb.net/web322_week8/?retryWrites=true&w=majority
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {

    let db = mongoose.createConnection("mongodb+srv://yadveer-kaur5:XavfTbJeYZAYXuJy@senecaweb.4rnow52.mongodb.net/web322_week8/?retryWrites=true&w=majority");
    db.on('error', (err)=>{
        reject(err); // reject the promise with the provided error
    });
    db.once('open', ()=>{
        User = db.model("users", userSchema);
        resolve();});
    });
};
function registerUser(userData){
    return new Promise((resolve,reject)=>{
        if(userData.password !== userData.password2){
reject("Passwords do not match");
        }
        else{
            bcrypt.hash(userData.password,12).then(hash=>{
                userData.password=hash;
                let newUser= new User(userData);
                newUser.save().then(()=>{
                    resolve();
                }).catch((err)=>{
                    if(err.code===11000){
                        reject("User Name already taken");
                    }
                    else{
                        reject("There was an error creating the user: err");
                    }
                })
            }).catch(err=>{
                reject("Encryption failed");
            })
           
        }
    })

}

function checkUser(userData){
    return new Promise((resolve,reject)=>{
        User.find({"userName":userData.userName}).exec()
        .then((users)=>{
           if(users.length==0){
            reject("User does not exist"+ userData.userName);
           }else{
            bcrypt.compare(userData.password, users[0].password.then((res)=>{
                if(res==true){
                    users[0].loginHistory.push({dateTime:(new Date()).toString(),userAgent: userData.userAgent});
                    User.updateOne({userName: users[0].userName},
                        {$set:{loginHistory: users[0].loginHistory}}
                        ).exec()
                        .then(()=>{
                        resolve(users[0]);})
                        .catch((err)=>{
                            reject("Problem varyfying the user"+ err);
                        });
                }else{
                    reject("Wrong Password");
                }
            }))
           }
        }).catch((err)=>{
            reject("Unable to find userName"+ userData.userName);
        })
    });
}