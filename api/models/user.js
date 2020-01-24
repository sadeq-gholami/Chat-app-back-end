const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId:{type:String, unique:true, required:true},
    username: {type:String, required:true},
    password: { type: String, required: true },
    avatarURL:{type: String, required: true}
});

module.exports= mongoose.model('User', userSchema);