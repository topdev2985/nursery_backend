const mongoose = require('mongoose');

const ChildrenSchema = new mongoose.Schema({
    profile: String,
    parentName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        default: '',
        required: true
    },
    surName: {
        type: String,
        default: '',
    },
    birthday: {
        type: String,
        required: true
    },
    funded: Boolean,
    holdingFee: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    deleted:{
        type:Boolean,
        default:false
    }

});

module.exports = mongoose.model('children', ChildrenSchema);