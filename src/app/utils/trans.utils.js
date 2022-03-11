
const TranslatorEngine = require('../methods/TranslatorEngine')
var fs = require('fs');
const path = require('path');
function promiseAllP(items, block) {
    var promises = [];
    items.forEach(function (item, index) {
        promises.push(function (item, i) {
            return new Promise(function (resolve, reject) {
                return block.apply(this, [item, index, resolve, reject]);
            });
        }(item, index))
    });
    return Promise.all(promises);
} //promiseAll

class TransUtils {
    /**
     * read files
     * @param dirname string
     * @return Promise
     * @author Loreto Parisi (loretoparisi at gmail dot com)
     * @see http://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
     */
    readFiles(dirname) {
        return new Promise((resolve, reject) => {
            fs.readdir(dirname, function (err, filenames) {
                if (err) return reject(err);
                promiseAllP(filenames, (filename, index, resolve, reject) => {
                    fs.readFile(path.resolve(dirname, filename), 'utf-8', function (err, content) {
                        if (err) return reject(err);
                        return resolve({ filename: filename, contents: content });
                    });
                })
                    .then(results => {
                        return resolve(results);
                    })
                    .catch(error => {
                        return reject(error);
                    });
            });
        });
    }

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

