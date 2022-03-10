var TransController = require('../controllers/translator.controller')

class Initial {
    async index() {
        //Translator
        console.log('[#1] Waiting for load dictionaries ...')
        await TransController.LoadDictionnary()

    }
}

module.exports = new Initial()