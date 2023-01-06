const mongoose = require('mongoose');


const ipSchema = mongoose.Schema({
    guestIP:{
        type: String,
        required: true,
        unique: true
     },
    count:{
        type: Number,
        required: true,
        default:0
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
});


const ip = mongoose.model('ips', ipSchema);
module.exports = ip;