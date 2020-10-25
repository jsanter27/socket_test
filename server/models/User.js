const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleID: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    videos: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);