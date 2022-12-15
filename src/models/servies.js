const mongoose=require('mongoose');

const ServiceSchema=new mongoose.Schema({
    serviceName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    type:{
        type: String,
        required:true
    },
    description:{
        type:String,
        // required:true
    },
    startTime:{
        type:Date
    },
    endTime:Date,
    deleted:{
        type:Boolean,
        default:false
    }
});

module.exports=mongoose.model('service', ServiceSchema);