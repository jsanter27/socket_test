const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleID: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    videos: {
        type: Array,
        required: true,
        default: []
    }
});

module.exports = mongoose.model('User', UserSchema);