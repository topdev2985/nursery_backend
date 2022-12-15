const mongoose= require('mongoose');

const testSchema=new mongoose.Schema({
    name:String,
    email:{
        type: String,
        lowercase:true,
        match: /[a-z0–9!#$%&’*+/=?^_`{|}~-]+(?:\.[a-z0–9!#$%&’*+/=?^_`{|}~-]+)*@(?:[a-z0–9](?:[a-z0–9-]*[a-z0–9])?\.)+[a-z0–9](?:[a-z0–  9-]*[a-z0–9])?/,
    }
});

module.exports=mongoose.model("Test", testSchema);

