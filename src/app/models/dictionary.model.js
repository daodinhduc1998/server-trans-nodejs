const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Dictionary = new Schema({
    name: { type: String, require: true },
    key: { type: String, require: true },
    value: { type: String },
    tag: [{ type: String }]
}, {
    timestamps: true
});


Dictionary.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true
});

module.exports = mongoose.model('Dictionary', Dictionary);