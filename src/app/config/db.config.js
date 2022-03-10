const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('[Server Translator] Connected !!!')
    } catch (error) {
        console.log('[Server Translator] Not Connected !!!\n' + error)
    }
}

module.exports = { connect };