const mongoose = require('mongoose');

var citySchema = new mongoose.Schema({
    name : String 
});

var cityModel = mongoose.model('City', citySchema);

module.exports = cityModel;
