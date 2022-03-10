
const TranslatorEngine = require('../methods/TranslatorEngine')

class TransUtils {
    skipTag(text) {
        var tempText = text;
        var stringBuilder = [];
        var index = 0;
        this.findtag(tempText, stringBuilder, index);
        var result = stringBuilder.join('').split('\n');
        return result;
    }

    findtag(text, arr, index) {
        if (text.includes("<img")) {
            index = text.indexOf("<img");
            for (var i = index; i < text.length; i++) {
                if (text[i] == '>') {
                    arr.push(TranslatorEngine._Substring(text, index, i - index + 1) + "\n");
                    var a = text.replaceAll(TranslatorEngine._Substring(text, index, i - index + 1), "");
                    this.findtag(a, arr, index);
                    break;
                }
            }
        }
    }
    ChuanHoaResponse(sTQ, wrapType) {
        if (sTQ.includes("<p>") || sTQ.includes("<br>")) sTQ = "<p>" + sTQ;
        sTQ = sTQ.replaceAll("<br><br>", "<p>").replaceAll("<p><br>", "<p>").replaceAll("<br>", "<p>");
        return sTQ;
    }
}

module.exports = new TransUtils()

