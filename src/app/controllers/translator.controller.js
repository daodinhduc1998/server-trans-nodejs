const TranslatorEngine = require('../methods/TranslatorEngine')
const Dict = require('../models/dictionary.model')
const TransUtils = require('../utils/trans.utils')
const dict = require('../methods/Dictionary')

class TransController {
    //POST /api/translate
    async Translate(req, res, next) {
        //translationAlgorithm:
        /*	0:ưu tiên cụm vp dài
         *	1: dịch từ tría sang phải
         *	2: ưu tiên cum vp dài >=4
         *	prioritizedName
         *  true/false: ưu tiên cụm Names hơn VP
        */
        var result
        if (req.body) {
            result = TranslatorEngine.Dich(req.body.chinese, parseInt(req.body.wrapType), parseInt(req.body.translationAlgorithm), req.body.prioritizedName);
        }
        if (result) {
            res.status(200).send(result)
        }
        else {
            res.status(404).json({ 'msg': 'failed', 'content': '#1' })
        }
    }

    async Test(req, res, next) {
        var param = {
            "chinese": "优等生不需要超能力(全本)",
            "wrapType": 0,
            "translationAlgorithm": 2,
            "prioritizedName": 1
        }
        var a = TranslatorEngine.Dich(`<p> 《五等分的花嫁》+《我们学不来 <br>《就算变态也会喜欢》</p>`, 0, 2, 0)
        //var result = await this.Dich(param.chinese, param.wrapType, param.translationAlgorithm, param.prioritizedName)
        res.status(200).json({ 'msg': a })

    }



    async LoadDictionary() {
        Dict.find({}).then(data => {
            TranslatorEngine.LoadDictionaries(data)
        })
    }

    async LoadDictionaryFolder() {
        TranslatorEngine.LoadDictionariesFiles()
    }


}

module.exports = new TransController()