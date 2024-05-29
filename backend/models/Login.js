const mongoose = require("mongoose") ;
 // const {Schema} = mongoose ;

const LoSchema = new mongoose.Schema({ 
    name : {
        type : String ,
        required : true 
        // title : String 
    },
    email_id : {
        type : String ,
        required : true ,
        unique :  true 
    },
    password : { 
        type : String ,
        required : true 
    },
    hash_password : {
        type : String ,
        required : true 
    }

})


module.exports = mongoose.model('login' , LoSchema)  ;