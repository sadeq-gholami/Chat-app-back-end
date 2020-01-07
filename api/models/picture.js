const mongoose = require('mongoose');
const pictureSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type:String, required:true},
    imgUrl: { type: String, required: true }
});

module.exports= mongoose.model('Picture', pictureSchema);