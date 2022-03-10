
var TransController = require('../controllers/translator.controller')
module.exports = function (app) {
    // var NameDict = new Dict.Dictionary();
    // NameDict.Add('keytest', 'valuetest')
    // NameDict.Add('keytest', 'valuetest3')
    // NameDict.Add('keytest2', 'valuetest2')
    // NameDict.Add('keytest3', 'valuetest31')

    // var NameDict1 = new Dict.Dictionary();
    // NameDict1.Add('keytest1', 'valuetest1')
    // console.log(NameDict.KeyValuePairs(), '\n', NameDict1, '\n', NameDict)

    app.post('/api/translate', TransController.Translate)
    //app.get('/api/test', TransController.Test)
    //app.get('/api/preload', TransController.LoadDictionnary)
}