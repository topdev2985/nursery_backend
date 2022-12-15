const mongoose = require('mongoose');
const AttendanceSchema = new mongoose.Schema({
    entryTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    holdingFee: Boolean,
    meal: Boolean,
    holdingFee_type: String,
    holdingFee_name: String,
    holdingFee_desc: String,
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'children',
        required: true
    },
    parentName: {
        type: String,
        default: ''
    },
    serviceName: {
        type: String,
        default: ''
    },
    serviceType: {
        type: String,
        default: ''
    },
    servicePrice: {
        type: Number,
        default: 0
    },
    serviceAmount:{
        type:Number,
        default:0
    },
    discount:{
        type:Number,
        default:0
    },
    childName:{
        type:String,
        default:''
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('attendance', AttendanceSchema);