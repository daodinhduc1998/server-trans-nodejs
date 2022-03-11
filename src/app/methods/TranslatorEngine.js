
var Dict = require('./Dictionary')
var CharRange = require('./CharRange')
const TransUtils = require('../utils/trans.utils')
const path = require('path');

class TranslatorEngine {

    CHINESE_LOOKUP_MAX_LENGTH = 20;
    dictionaryDirty = true;

    ignoredChinesePhraseList = []

    vietPhraseDictionary = new Dict.Dictionary()
    hanVietDictionary = new Dict.Dictionary()
    // thieuChuuDictionary = new Dict.Dictionary()
    // lacVietDictionary = new Dict.Dictionary()
    // cedictDictionary = new Dict.Dictionary()
    // chinesePhienAmEnglishDictionary = new Dict.Dictionary()
    vietPhraseOneMeaningDictionary = new Dict.Dictionary()
    onlyVietPhraseDictionary = new Dict.Dictionary()
    onlyNameDictionary = new Dict.Dictionary()
    onlyNameOneMeaningDictionary = new Dict.Dictionary()
    onlyNameChinhDictionary = new Dict.Dictionary()
    onlyNamePhuDictionary = new Dict.Dictionary()
    luatNhanDictionary = new Dict.Dictionary()
    pronounDictionary = new Dict.Dictionary()
    pronounOneMeaningDictionary = new Dict.Dictionary()
    nhanByDictionary = null
    nhanByOneMeaningDictionary = null

    thuatToanNhan = 2

    hgac = ['à', 'á', 'ả', 'ã', 'ạ', 'ă', 'ằ', 'ắ', 'ẳ', 'ẵ', 'ặ', 'â', 'ầ', 'ấ', 'ẩ', 'ẫ', 'ậ', 'đ', 'è', 'é', 'ẻ', 'ẽ', 'ẹ', 'ê', 'ề', 'ế', 'ể', 'ễ', 'ệ', 'ì', 'í', 'ỉ', 'ĩ', 'ị', 'ò', 'ó', 'ỏ', 'õ', 'ọ', 'ô', 'ồ', 'ố', 'ổ', 'ỗ', 'ộ', 'ơ', 'ờ', 'ớ', 'ở', 'ỡ', 'ợ', 'ù', 'ú', 'ủ', 'ũ', 'ụ', 'ư', 'ừ', 'ứ', 'ử', 'ữ', 'ự', 'ỳ', 'ý', 'ỷ', 'ỹ', 'ỵ', 'À', 'Á', 'Ả', 'Ã', 'Ạ', 'Ă', 'Ằ', 'Ắ', 'Ẳ', 'Ẵ', 'Ặ', 'Â', 'Ầ', 'Ấ', 'Ẩ', 'Ẫ', 'Ậ', 'Đ', 'È', 'É', 'Ẻ', 'Ẽ', 'Ẹ', 'Ê', 'Ề', 'Ế', 'Ể', 'Ễ', 'Ệ', 'Ì', 'Í', 'Ỉ', 'Ĩ', 'Ị', 'Ò', 'Ó', 'Ỏ', 'Õ', 'Ọ', 'Ô', 'Ồ', 'Ố', 'Ổ', 'Ỗ', 'Ộ', 'Ơ', 'Ờ', 'Ớ', 'Ở', 'Ỡ', 'Ợ', 'Ù', 'Ú', 'Ủ', 'Ũ', 'Ụ', 'Ư', 'Ừ', 'Ứ', 'Ử', 'Ữ', 'Ự', 'Ỳ', 'Ý', 'Ỷ', 'Ỹ', 'Ỵ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    daucau = ['.', ':', '?', '!', '(', '[', '\n', '\t'
    ]
    daucau2 = [".", ":", , "?", , "!", , "(", , "[", , "\n", , "\t"]
    trimCharsForAnalyzer = [' ', '\r', '\n', '\t']


    //=================
    LoadDictionaries(dataMongoDB) {
        var count = (dataMongoDB.length).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        console.log("#==========[Start loading dictionnary]==========#")

        var HanvietList = []
        var IgnoredChineseList = []
        var LuatnhanList = []
        var PronounList = []
        var VietPhraseList = []
        var NameList = []
        console.time('[Total time]')
        console.time('[Analytics Data]')
        dataMongoDB.forEach(value => {
            switch (value.name) {
                case "hanviet":
                    HanvietList.push(value)
                    break
                case "ignored":
                    IgnoredChineseList.push(value)
                    break
                case "luatnhan":
                    LuatnhanList.push(value)
                    break
                case "pronoun":
                    PronounList.push(value)
                    break
                case "vietphrase":
                    VietPhraseList.push(value)
                    break
                case "nameschinh":
                case "namesphu":
                    NameList.push(value)
                    break
            }
        })
        dataMongoDB.splice(0, dataMongoDB.length)
        console.timeEnd('[Analytics Data]')
        if (HanvietList.length > 0) {
            console.time('[Load HanvietDict]')
            this.loadHanVietDictionary(HanvietList)
            console.timeEnd('[Load HanvietDict]')
            console.log("Total: " + this.hanVietDictionary.KeyValuePairs().length + " (records)")
            HanvietList = []
        }
        if (IgnoredChineseList.length > 0) {
            console.time('[Load IgnoredChinese]')
            this.loadIgnoredChinesePhraseLists(IgnoredChineseList)
            console.timeEnd('[Load IgnoredChinese]')
            console.log("Total: " + this.ignoredChinesePhraseList.length + " (records)")
            IgnoredChineseList = []
        }
        if (NameList.length > 0) {
            console.time('[Load NameList]')
            this.loadOnlyNameDictionary(NameList)
            console.timeEnd('[Load NameList]')
            console.log("Total: " + this.onlyNameDictionary.KeyValuePairs().length + " (records)")
            NameList = []
        }
        if (VietPhraseList.length > 0) {
            console.time('[Load VietPhraseList]')
            this.loadOnlyVietPhraseDictionary(VietPhraseList)
            this.loadVietPhraseDictionary();
            this.vietPhraseDictionaryToVietPhraseOneMeaningDictionary();
            console.timeEnd('[Load VietPhraseList]')
            console.log("Total: " + this.vietPhraseDictionary.KeyValuePairs().length + " (records)")
            VietPhraseList = []
        }

        if (PronounList.length > 0) {
            console.time('[Load PronounList]')
            this.loadPronounDictionary(PronounList)
            this.pronounDictionaryToPronounOneMeaningDictionary();
            console.timeEnd('[Load PronounList]')
            console.log("Total: " + this.pronounDictionary.KeyValuePairs().length + " (records)")
            PronounList = []
        }
        if (LuatnhanList.length > 0) {
            console.time('[Load LuatnhanList]')
            this.loadLuatNhanDictionary(LuatnhanList)
            this.loadNhanByDictionary();
            this.loadNhanByOneMeaningDictionary();
            console.timeEnd('[Load LuatnhanList]')
            console.log("Total: " + this.luatNhanDictionary.KeyValuePairs().length + " (records)")
            LuatnhanList = []
        }
        console.timeEnd('[Total time]')
        console.log("[Done] : total " + count + "(records)")
        console.log("#=============[ Loading completed ]=============#")

    }
    LoadDictionariesFiles() {
        console.log("#==========[Start loading dictionnary folder]==========#")
        var HanvietList = []
        var IgnoredChineseList = []
        var LuatnhanList = []
        var PronounList = []
        var VietPhraseList = []
        var NameList = []
        console.time('[Total time]')
        console.time('[Analytics Data]')

        TransUtils.readFiles(path.join(__dirname, '../utils/Data'))
            .then(files => {
                files.forEach((item, index) => {
                    switch (item.filename) {
                        case "Vietphrase.txt":
                            item.contents.split(/\r?\n/).forEach(line => {
                                var arr = line.split('=')
                                if (arr.length == 2 && arr[0] != "") {
                                    VietPhraseList.push({ "name": 'vietphrase', "key": arr[0], "value": arr[1] })
                                }
                            });
                            delete item.contents
                            break
                        case "IgnoredChinesePhrases.txt":
                            item.contents.split(/\r?\n/).forEach(line => {
                                var arr = line.split('=')
                                if (arr.length == 2 && arr[0] != "") {
                                    HanvietList.push({ "name": 'ignored', "key": arr[0], "value": arr[1] })
                                }
                            });
                            break
                        case "LuatNhan.txt":
                            item.contents.split(/\r?\n/).forEach(line => {
                                var arr = line.split('=')
                                if (arr.length == 2 && arr[0] != "") {
                                    LuatnhanList.push({ "name": 'luatnhan', "key": arr[0], "value": arr[1] })
                                }
                            });
                            break
                        case "ChinesePhienAmWords.txt":
                            item.contents.split(/\r?\n/).forEach(line => {
                                var arr = line.split('=')
                                if (arr.length == 2 && arr[0] != "") {
                                    HanvietList.push({ "name": 'hanviet', "key": arr[0], "value": arr[1] })
                                }
                            });
                            break
                        case "Pronouns.txt":
                            item.contents.split(/\r?\n/).forEach(line => {
                                var arr = line.split('=')
                                if (arr.length == 2 && arr[0] != "") {
                                    PronounList.push({ "name": 'pronoun', "key": arr[0], "value": arr[1] })
                                }
                            });
                            break
                        case "Names.txt":
                        case "Names2.txt":
                            item.contents.split(/\r?\n/).forEach(line => {
                                var arr = line.split('=')
                                if (arr.length == 2 && arr[0] != "") {
                                    if (item.filename == "Names.txt") {
                                        NameList.push({ "name": 'nameschinh', "key": arr[0], "value": arr[1] })
                                    }
                                    if (item.filename == "Names2.txt") {
                                        NameList.push({ "name": 'namesphu', "key": arr[0], "value": arr[1] })
                                    }

                                }
                            });
                            break
                    }
                    delete item.contents
                });
                console.timeEnd('[Analytics Data]')
                if (HanvietList.length > 0) {
                    console.time('[Load HanvietDict]')
                    this.loadHanVietDictionary(HanvietList)
                    console.timeEnd('[Load HanvietDict]')
                    console.log("Total: " + this.hanVietDictionary.KeyValuePairs().length + " (records)")
                    HanvietList = []
                }
                if (IgnoredChineseList.length > 0) {
                    console.time('[Load IgnoredChinese]')
                    this.loadIgnoredChinesePhraseLists(IgnoredChineseList)
                    console.timeEnd('[Load IgnoredChinese]')
                    console.log("Total: " + this.ignoredChinesePhraseList.length + " (records)")
                    IgnoredChineseList = []
                }
                if (NameList.length > 0) {
                    console.time('[Load NameList]')
                    this.loadOnlyNameDictionary(NameList)
                    console.timeEnd('[Load NameList]')
                    console.log("Total: " + this.onlyNameDictionary.KeyValuePairs().length + " (records)")
                    NameList = []
                }
                if (VietPhraseList.length > 0) {
                    console.time('[Load VietPhraseList]')
                    this.loadOnlyVietPhraseDictionary(VietPhraseList)
                    this.loadVietPhraseDictionary();
                    this.vietPhraseDictionaryToVietPhraseOneMeaningDictionary();
                    console.timeEnd('[Load VietPhraseList]')
                    console.log("Total: " + this.vietPhraseDictionary.KeyValuePairs().length + " (records)")
                    VietPhraseList = []
                }

                if (PronounList.length > 0) {
                    console.time('[Load PronounList]')
                    this.loadPronounDictionary(PronounList)
                    this.pronounDictionaryToPronounOneMeaningDictionary();
                    console.timeEnd('[Load PronounList]')
                    console.log("Total: " + this.pronounDictionary.KeyValuePairs().length + " (records)")
                    PronounList = []
                }
                if (LuatnhanList.length > 0) {
                    console.time('[Load LuatnhanList]')
                    this.loadLuatNhanDictionary(LuatnhanList)
                    this.loadNhanByDictionary();
                    this.loadNhanByOneMeaningDictionary();
                    console.timeEnd('[Load LuatnhanList]')
                    console.log("Total: " + this.luatNhanDictionary.KeyValuePairs().length + " (records)")
                    LuatnhanList = []
                }
                console.timeEnd('[Total time]')
                console.log("#=============[ Loading completed ]=============#")

            })
            .catch(error => {
                console.log(error);
            });



    }

    Dich(sTQ, wrapType, translationAlgorithm, prioritizedName) {
        if (!sTQ) return
        var arr = TransUtils.skipTag(sTQ);
        for (var k = 0; k < arr.length; k++) {
            if (arr[k].length > 4) {
                sTQ = sTQ.replaceAll(arr[k].toString(), "</br>#img" + k + "#</br>");
            }
        }

        var c;
        if (prioritizedName == "0" || prioritizedName == 0 ||
            prioritizedName == false || prioritizedName == "false"
            || prioritizedName == '' || prioritizedName == null) c = false;
        else c = true;
        //sTQ = TranslatorEngine.TranslatorEngine.StandardizeInput(sTQ);
        sTQ = this.standardizeInputWithoutRemovingIgnoredChinesePhrases(sTQ);
        sTQ = !c ? this.ChineseToHanVietForBatch(sTQ) : this.ChineseToVietPhraseOneMeaningForBatch(sTQ, wrapType, translationAlgorithm, c);
        for (var k = 0; k < arr.length; k++) {
            if (arr[k].length > 4) {
                sTQ = sTQ.replaceAll("#img" + k + "#", arr[k].toString());
            }
        }

        return TransUtils.ChuanHoaResponse(sTQ, wrapType).trim();

    }

    //Load dict
    loadHanVietDictionary(dataMongoDB) {
        if (dataMongoDB.length) {
            dataMongoDB.forEach(element => {
                this.hanVietDictionary.Add(element.key, element.value);
            })
        }
    }

    loadOnlyVietPhraseDictionary(dataMongoDB) {
        if (dataMongoDB.length) {
            dataMongoDB.forEach(element => {
                this.onlyVietPhraseDictionary.Add(element.key, element.value)
            })
        }
    }

    //Chua toi uu voi tag name
    loadOnlyNameDictionary(dataMongoDB) {
        this.onlyNameDictionary.Clear();
        this.onlyNameOneMeaningDictionary.Clear();
        this.onlyNameChinhDictionary.Clear();
        this.onlyNamePhuDictionary.Clear();
        dataMongoDB.forEach(element => {
            if (element.name == "nameschinh") {
                if (element && !this.onlyNameDictionary.ContainsKey(element.key)) {
                    this.onlyNameDictionary.Add(element.key, element.value);
                    this.onlyNameChinhDictionary.Add(element.key, element.value.split(/[/|]/).filter(function (x) { return x != "" })[0])
                    this.onlyNameOneMeaningDictionary.Add(element.key, element.value);
                }
            }
            if (element.name == "namesphu") {
                if (element && !this.onlyNamePhuDictionary.ContainsKey(element.key)) {
                    if (this.onlyNameDictionary.ContainsKey(element.key)) {
                        this.onlyNameDictionary[element.key] = element.value
                        this.onlyNameOneMeaningDictionary[element.key] = element.value.split(/[/|]/).filter(function (x) { return x != "" })[0]
                    } else {
                        this.onlyNameDictionary.Add(element.key, element.value)
                        this.onlyNameOneMeaningDictionary.Add(element.key, element.value.split(/[/|]/).filter(function (x) { return x != "" })[0]);
                    }
                    this.onlyNamePhuDictionary.Add(element.key, element.value)

                }
            }
        })

    }

    loadLuatNhanDictionary(dataMongoDB) {
        var dictionary = new Dict.Dictionary()
        dataMongoDB.forEach(element => {
            if (!dictionary.ContainsKey(element.key)) {
                dictionary.Add(element.key, element.value);
            }
        })
        var temp = dictionary.KeyValuePairs().sort(function (a, b) {
            return b.Key.toString().length - a.Key.toString().length
        })
        this.luatNhanDictionary.Clear();
        temp.forEach(current => {
            this.luatNhanDictionary.Add(current.Key, current.Value);
        })
    }

    loadPronounDictionary(dataMongoDB) {
        this.pronounDictionary.Clear();
        dataMongoDB.forEach(element => {
            if (element && !this.pronounDictionary.ContainsKey(element.key)) {
                this.pronounDictionary.Add(element.key, element.value);
            }
        })
    }

    loadIgnoredChinesePhraseLists(dataMongoDB) {
        this.ignoredChinesePhraseList = []
        if (dataMongoDB.length) {
            var result = dataMongoDB.filter(function (x) { return x != "" })
            result.forEach(value => {
                var text2 = this._TrimCharList(this.standardizeInputWithoutRemovingIgnoredChinesePhrases(value), ['\n', '\t'])
                if (text2 && !this.ignoredChinesePhraseList.includes(text2)) {
                    this.ignoredChinesePhraseList.push(text2);
                }
            })
            this.ignoredChinesePhraseList.sort()
            this.ignoredChinesePhraseList.reverse()
        }

    }


    //==================================
    loadVietPhraseDictionary() {
        this.vietPhraseDictionary.Clear();
        this.onlyNameDictionary.KeyValuePairs().forEach(current => {
            if (!this.vietPhraseDictionary.ContainsKey(current.Key)) {
                this.vietPhraseDictionary.Add(current.Key, current.Value);
            }
        })
        this.onlyVietPhraseDictionary.KeyValuePairs().forEach(current2 => {
            if (!this.vietPhraseDictionary.ContainsKey(current2.Key)) {
                this.vietPhraseDictionary.Add(current2.Key, current2.Value);
            }
        })

    }

    vietPhraseDictionaryToVietPhraseOneMeaningDictionary() {
        this.vietPhraseOneMeaningDictionary.Clear();
        this.vietPhraseDictionary.KeyValuePairs().forEach(current => {
            this.vietPhraseOneMeaningDictionary.Add(current.Key, current.Value.includes("/") || current.Value.includes("|") ? current.Value.split(/[/|]/)[0] : current.Value);
        })
    }

    pronounDictionaryToPronounOneMeaningDictionary() {
        this.pronounOneMeaningDictionary.Clear();
        this.pronounDictionary.KeyValuePairs().forEach(current => {
            this.pronounOneMeaningDictionary.Add(current.Key, current.Value.includes("/") || current.Value.includes("|") ? current.Value.split(/[/|]/)[0] : current.Value);
        })
    }

    loadNhanByDictionary() {
        switch (this.thuatToanNhan) {
            //# Cách thiết lập thuật toán nhân
            case 1:
                //#   1: Nhân theo Pronouns
                this.nhanByDictionary = this.pronounDictionary;
                break;
            case 2:
                //#   2: Nhân theo Pronouns + Names   
                this.nhanByDictionary = Object.assign(new Dict.Dictionary(), this.pronounDictionary)
                this.onlyNameDictionary.KeyValuePairs().forEach(current => {
                    if (!this.nhanByDictionary.ContainsKey(current.Key)) {
                        this.nhanByDictionary.Add(current.Key, current.Value);
                    }
                });
                break;
            case 3:
                //#   3: Nhân theo Pronouns + Names + VietPhrase 
                this.nhanByDictionary = Object.assign(new Dict.Dictionary(), this.pronounDictionary)
                this.onlyNameDictionary.KeyValuePairs().forEach(current => {
                    if (!this.nhanByDictionary.ContainsKey(current.Key)) {
                        this.nhanByDictionary.Add(current.Key, current.Value);
                    }
                });
                this.vietPhraseDictionary.KeyValuePairs().forEach(current => {
                    if (!this.nhanByDictionary.ContainsKey(current.Key)) {
                        this.nhanByDictionary.Add(current.Key, current.Value);
                    }
                });
                break;
            default:
                //#   0: Không áp dụng
                this.nhanByDictionary = null;
                break;
        }

    }

    loadNhanByOneMeaningDictionary() {
        switch (this.thuatToanNhan) {
            //# Cách thiết lập thuật toán nhân
            case 1:
                //#   1: Nhân theo Pronouns
                this.nhanByOneMeaningDictionary = this.pronounOneMeaningDictionary;
                break;
            case 2:
                //#   2: Nhân theo Pronouns + Names   
                this.nhanByOneMeaningDictionary = Object.assign(new Dict.Dictionary(), this.pronounOneMeaningDictionary)
                this.onlyNameOneMeaningDictionary.KeyValuePairs().forEach(current => {
                    if (!this.nhanByOneMeaningDictionary.ContainsKey(current.Key)) {
                        this.nhanByOneMeaningDictionary.Add(current.Key, current.Value);
                    }
                });
                break;
            case 3:
                //#   3: Nhân theo Pronouns + Names + VietPhrase 
                this.nhanByOneMeaningDictionary = Object.assign(new Dict.Dictionary(), this.pronounOneMeaningDictionary)
                this.onlyNameOneMeaningDictionary.KeyValuePairs().forEach(current => {
                    if (!this.nhanByOneMeaningDictionary.ContainsKey(current.Key)) {
                        this.nhanByDictionary.Add(current.Key, current.Value);
                    }
                });
                this.vietPhraseOneMeaningDictionary.KeyValuePairs().forEach(current => {
                    if (!this.nhanByOneMeaningDictionary.ContainsKey(current.Key)) {
                        this.nhanByOneMeaningDictionary.Add(current.Key, current.Value);
                    }
                });
                break;
            default:
                //#   0: Không áp dụng
                this.nhanByOneMeaningDictionary = null;
                break;
        }
    }
    //=========================
    //Translator

    ChineseToHanVietForBatch(chinese) {
        var str = "";
        var stringBuilder = []
        var length = chinese.length;
        for (var i = 0; i < length; i++) {
            var c = chinese[i];
            var character = chinese[i + 1];
            if (this.isChinese(c)) {
                if (this.isChinese(character)) {
                    this.appendTranslatedWord(stringBuilder, this.ChineseToHanViet(c), str);
                    stringBuilder.push(" ");
                    str += " ";
                }
                else {
                    this.appendTranslatedWord(stringBuilder, this.ChineseToHanViet(c), str);
                }
            }
            else {
                stringBuilder.push(c);
                str += c.toString();
            }
        }
        if (this.isChinese(chinese[length - 1])) {
            this.appendTranslatedWord(stringBuilder, this.ChineseToHanViet(chinese[length - 1]), str);
        }
        else {
            stringBuilder.push(chinese[length - 1]);
            str += chinese[length - 1].toString();
        }
        return stringBuilder.join('');
    }

    ChineseToVietPhraseOneMeaningForBatch(chinese, wrapType, translationAlgorithm, prioritizedName) {
        var arg_05_0 = Date.now();
        var text = "";
        var stringBuilder = [];

        var num = chinese.length - 1;
        var i = 0;
        var num2 = -1;
        var num3 = -1;
        var num4 = -1;

        while (i <= num) {
            var flag = false;
            var flag2 = true;
            if (chinese[i] != '\n' && chinese[i] != '\t') {
                for (var j = 20; j > 0; j--) {
                    if (chinese.length >= i + j) {
                        if (this.vietPhraseOneMeaningDictionary.ContainsKey(this._Substring(chinese, i, j))) {
                            if ((!prioritizedName || !this.containsName(chinese, i, j)) &&
                                (translationAlgorithm != 0 && translationAlgorithm != 2 ||
                                    this.isLongestPhraseInSentence(chinese, i, j, this.vietPhraseOneMeaningDictionary, translationAlgorithm) ||
                                    prioritizedName && this.onlyNameDictionary.ContainsKey(this._Substring(chinese, i, j)))) {
                                if (this.vietPhraseOneMeaningDictionary[this._Substring(chinese, i, j)]) {
                                    if (wrapType == 0) {
                                        this.appendTranslatedWord(stringBuilder, this.vietPhraseOneMeaningDictionary[this._Substring(chinese, i, j)], text);
                                    }
                                    else {
                                        if (wrapType == 2) {
                                            this.appendTranslatedWord(stringBuilder, "<i h=\"" + this.ChineseToHanVietForAnalyzer(this._Substring(chinese, i, j)) + "\" t=\"" + this._Substring(chinese, i, j) + "\" v=\"" + this.vietPhraseDictionary[this._Substring(chinese, i, j)] + "\" >" + this.vietPhraseOneMeaningDictionary[this._Substring(chinese, i, j)] + "</i>", text);

                                        }
                                        else {
                                            this.appendTranslatedWord(stringBuilder, "[" + this.vietPhraseOneMeaningDictionary[this._Substring(chinese, i, j)] + "]", text);
                                        }
                                    }
                                    if (this.nextCharIsChinese(chinese, i + j - 1)) {
                                        stringBuilder.push(" ");
                                        text += " ";
                                    }
                                }
                                flag = true;
                                i += j;
                                break;
                            }
                        } else if (!this._Substring(chinese, i, j).includes("\n") &&
                            !this._Substring(chinese, i, j).includes("\t") && this.nhanByOneMeaningDictionary != null
                            && flag2 && 2 < j && num2 < i + j - 1 && this.IsAllChinese(this._Substring(chinese, i, j))) {
                            if (i < num3) {
                                if (num3 < i + j && j <= num4 - num3) {
                                    j = num3 - i + 1;
                                } else {
                                    var empty = "";
                                    var num5 = -1;
                                    var num6 = this.containsLuatNhan(this._Substring(chinese, i, j), this.nhanByOneMeaningDictionary, empty, num5);
                                    num3 = i + num6;
                                    num4 = num3 + num5;
                                    if (num6 == 0) {
                                        if (this.isLongestPhraseInSentence(chinese, i - 1, num5 - 1, this.vietPhraseOneMeaningDictionary, translationAlgorithm)) {
                                            j = num5;

                                            var text2 = this.ChineseToLuatNhan(this._Substring(chinese, i, j), this.nhanByOneMeaningDictionary);
                                            if (wrapType == 0) {
                                                this.appendTranslatedWord(stringBuilder, text2, text);
                                            }
                                            else {
                                                if (wrapType == 2) {
                                                    this.appendTranslatedWord(stringBuilder, "<i h=\"" + ChineseToHanVietForAnalyzer(this._Substring(chinese, i, j)) + "\" t=\"" + this._Substring(chinese, i, j) + "\" v=\"" + text2 + "\"  >" + text2 + "</i>", text);
                                                }
                                                else {
                                                    this.appendTranslatedWord(stringBuilder, "[" + text2 + "]", text);
                                                }

                                            }
                                            if (this.nextCharIsChinese(chinese, i + j - 1)) {
                                                stringBuilder.push(" ");
                                                text += " ";
                                            }
                                            flag = true;
                                            i += j;
                                            break;
                                        }
                                    }
                                    else if (0 >= num6) {
                                        num2 = i + j - 1;
                                        flag2 = false;
                                        var num7 = 100;
                                        while (i + num7 < chinese.length && this.isChinese(chinese[i + num7 - 1])) {
                                            num7++;
                                        }
                                        if (i + num7 <= chinese.length) {
                                            num6 = this.containsLuatNhan(this._Substring(chinese, i, num7), this.nhanByOneMeaningDictionary, empty, num5);
                                            if (num6 < 0) {
                                                num2 = i + num7 - 1;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (!flag) {
                if (this.isChinese(chinese[i])) {
                    if (wrapType == 2) {

                        this.appendTranslatedWord(stringBuilder, "<i h=\"" + this.ChineseToHanViet(chinese[i]) + "\" t=\"" + chinese[i] + "\"  >" + this.ChineseToHanViet(chinese[i]) + "</i>", text);
                    }
                    else {
                        this.appendTranslatedWord(stringBuilder, (wrapType != 1 ? "" : "[") + this.ChineseToHanViet(chinese[i]) + (wrapType != 1 ? "" : "]"), text);
                    }

                    if (this.nextCharIsChinese(chinese, i)) {
                        stringBuilder.push(" ");
                        text += " ";
                    }
                }
                else if ((chinese[i] == '"' || chinese[i] == '\'') && !text.endsWith(" ") &&
                    !text.endsWith(".") && !text.endsWith("?") && !text.endsWith("!") &&
                    !text.endsWith("\t") && i < chinese.length - 1 && chinese[i + 1] != ' ' && chinese[i + 1] != ',') {
                    stringBuilder.push(" ")
                    stringBuilder.push(chinese[i]);
                    text = text + " " + chinese[i].toString();
                }
                else {
                    stringBuilder.push(chinese[i]);
                    text += chinese[i].toString();
                }
                i++;
            }
        }
        return stringBuilder.join('');

    }


    //Edit input
    standardizeInputWithoutRemovingIgnoredChinesePhrases(original) {
        if (!original) return ""
        var text = this.ToSimplified(original);
        var array = ["，", "。", "：", "“", "”", "‘", "’", "？", "！", "「", "」", "．", "、", "\u3000", "…", null, "'", "（", "）"]
        var array2 = [", ", ".", ": ", "\"", "\" ", "'", "' ", "?", "!", "\"", "\" ", ".", ", ", " ", "...", "", "\"", " (", ") "]
        for (var i = 0; i < array.length; i++) {
            text = text.replaceAll(array[i], array2[i]);
        }
        text = text.replaceAll("  ", " ").replaceAll(" \r\n", "\n").replaceAll(" \n", "\n");
        text = this.ToNarrow(text);
        var length = text.length;
        var stringBuilder = []
        for (var j = 0; j < text.length - 1; j++) {
            var c = text[j];
            var c2 = text[j + 1];
            if (!this.IsControl(c) || c == '\t' || c == '\n' || c == '\r') {
                if (this.isChinese(c)) {
                    if (!this.isChinese(c2) && c2 != ',' && c2 != '.' && c2 != ':' && c2 != ';' && c2 != '"' && c2 != '\'' && c2 != '?' && c2 != ' ' && c2 != '!' && c2 != ')') {
                        stringBuilder.push(c)
                        stringBuilder.push(" ")
                    }
                    else {
                        stringBuilder.push(c);
                    }
                }
                else if (c == '\t' || c == ' ' || c == '"' || c == '\'' || c == '\n' || c == '(') {
                    stringBuilder.push(c);
                }
                else if (c == '!' || c == '.' || c == '?') {
                    if (c2 == '"' || c2 == ' ' || c2 == '\'') {
                        stringBuilder.push(c);
                    }
                    else {
                        stringBuilder.push(c)
                        stringBuilder.push(" ")
                    }
                }
                else if (this.isChinese(c2)) {
                    stringBuilder.push(c)
                    stringBuilder.push(" ")
                }
                else {
                    stringBuilder.push(c);
                }
            }
        }
        stringBuilder.push(text[length - 1]);
        text = this.indentAllLines(stringBuilder.join(""), true);
        //return text.Replace(". . . . . .", "...");
        return this.removeIgnoredChinesePhrases(text);

    }

    ChineseToHanVietForAnalyzer(chinese) {
        var stringBuilder = [];
        for (var i = 0; i < chinese.length; i++) {
            var c = chinese[i];
            if (this.hanVietDictionary.ContainsKey(c.toString())) {
                stringBuilder.push(this.hanVietDictionary[c.toString()] + " ");
            }
            else {
                stringBuilder.push(c + " ");
            }
        }
        return stringBuilder.join('').trim();
    }

    containsLuatNhan(chinese, dictionary, luatNhan, matchedLength) {
        var length = chinese.length;

        this.luatNhanDictionary.KeyValuePairs().forEach(current => {
            if (length >= current.Key.length - 2) {
                var text = current.Key.replaceAll("{0}", "([^,\\. ?]{1,10})");
                var rgx = new RegExp(text, 'i')
                var match = chinese.match(rgx);
                var num = 0;
                while (match) {
                    var value = match[1];
                    if (current.Key.startsWith("{0}")) {
                        for (var i = 0; i < value.length; i++) {
                            if (dictionary.ContainsKey(value.substring(i))) {
                                luatNhan = text;
                                matchedLength = value.length - i;
                                var result = chinese.indexOf(match[1]) + i;
                                return result;
                            }
                        }
                    }
                    else if (current.Key.endsWith("{0}")) {
                        var num2 = value.length;
                        while (0 < num2) {
                            if (dictionary.ContainsKey(this._Substring(value, 0, num2))) {
                                luatNhan = text;
                                matchedLength = value.length - (value.length - num2);
                                var result = chinese.indexOf(value);
                                return result;
                            }
                            num2--;
                        }
                    }
                    else if (dictionary.ContainsKey(value)) {
                        luatNhan = text;
                        matchedLength = value.length;
                        var result = chinese.indexOf(value);
                        return result;
                    }
                    num++;
                    if (num > 1) {
                        break;
                    }
                }
            }
        })
        luatNhan = "";
        matchedLength = -1;
        return -1;
    }

    appendTranslatedWord0(result, translatedText, lastTranslatedWord) {
        var num = 0;
        appendTranslatedWord(result, translatedText, lastTranslatedWord, num);
    }

    appendTranslatedWord(result, translatedText, lastTranslatedWord, startIndexOfNextTranslatedText) {
        if (lastTranslatedWord.endsWith("\n") || lastTranslatedWord.endsWith("\t") ||
            lastTranslatedWord.endsWith(". ") || lastTranslatedWord.endsWith("\"") ||
            lastTranslatedWord.endsWith("'") || lastTranslatedWord.endsWith("? ") ||
            lastTranslatedWord.endsWith("! ") || lastTranslatedWord.endsWith(".\" ") ||
            lastTranslatedWord.endsWith("?\" ") || lastTranslatedWord.endsWith("!\" ") ||
            lastTranslatedWord.endsWith(": ") || lastTranslatedWord.endsWith("<br> ") ||
            lastTranslatedWord.endsWith("<br>") || lastTranslatedWord.endsWith("<p> ") ||
            lastTranslatedWord.endsWith("<p>")) {
            lastTranslatedWord = this._ToUpperCase(translatedText);
        } else if (lastTranslatedWord.endsWith(" ") || lastTranslatedWord.endsWith("(")) {
            lastTranslatedWord = translatedText;
        }
        else {
            lastTranslatedWord = " " + translatedText;
        }
        if ((!translatedText || translatedText[0] == ',' || translatedText[0] == '.' ||
            translatedText[0] == '?' || translatedText[0] == '!') &&
            0 < result.length && result[result.length - 1] == ' ') {
            result = this._RemoveString(result, result.length - 1, 1);
            startIndexOfNextTranslatedText--;
        }
        result.push(lastTranslatedWord);
    }

    ChineseToHanViet(chinese) {
        if (chinese == ' ') {
            return "";
        }
        if (!this.hanVietDictionary.ContainsKey(chinese.toString())) {
            return this.ToNarrow(chinese.toString());
        }
        return this.hanVietDictionary[chinese.toString()];
    }

    ChineseToHanViet2(chinese, chineseHanVietMappingArray) {
        var LastTranslatedWord_HanViet = "";
        var list = []
        var stringBuilder = []
        var length = chinese.length;
        for (var i = 0; i < length; i++) {
            var length2 = stringBuilder.length;
            var c = chinese[i];
            var character = chinese[i + 1];
            if (this.isChinese(c)) {
                if (this.isChinese(character)) {
                    this.appendTranslatedWord0(stringBuilder, this.ChineseToHanViet(c), LastTranslatedWord_HanViet, length2);
                    stringBuilder.push(" ");
                    LastTranslatedWord_HanViet += " ";
                    list.push(new CharRange(length2, this.ChineseToHanViet(c).length));
                }
                else {
                    this.appendTranslatedWord0(stringBuilder, this.ChineseToHanViet(c), LastTranslatedWord_HanViet, length2);
                    list.push(new CharRange(length2, this.ChineseToHanViet(c).length));
                }
            }
            else {
                stringBuilder.push(c);
                LastTranslatedWord_HanViet += c.toString();
                list.push(new CharRange(length2, 1));
            }
        }
        if (this.isChinese(chinese[length - 1])) {
            this.appendTranslatedWord(stringBuilder, this.ChineseToHanViet(chinese[length - 1]), LastTranslatedWord_HanViet);
            list.push(new CharRange(stringBuilder.join('').length, this.ChineseToHanViet(chinese[length - 1]).length));
        }
        else {
            stringBuilder.push(chinese[length - 1]);
            LastTranslatedWord_HanViet += chinese[length - 1].toString();
            list.push(new CharRange(stringBuilder.join('').length, 1));
        }
        chineseHanVietMappingArray = [...list]
        LastTranslatedWord_HanViet = "";
        return stringBuilder.join('');
    }

    ChineseToLuatNhan(chinese, dictionary) {
        var empty = "";
        return this.ChineseToLuatNhan3(chinese, dictionary, empty);
    }

    ChineseToLuatNhan3(chinese, dictionary, luatNhan) {
        var arg_06_0 = chinese.length;

        this.luatNhanDictionary.KeyValuePairs().forEach(current => {
            var str = current.Key.replace("{0}", "(.+)");
            var rgx = new RegExp("^" + str + "$", 'i')
            var match = chinese.match(rgx);
            if (match && dictionary.ContainsKey(match[1])) {
                var array = dictionary[match[1]].split(/[/|]/);
                var stringBuilder = [];
                var array2 = [...array];
                for (var i = 0; i < array2.length; i++) {
                    var newValue = array2[i];
                    stringBuilder.push(current.Value.replace("{0}", newValue));
                    stringBuilder.push("/");
                }
                luatNhan = current.Key;
                return this._TrimCharList(stringBuilder.join(''), ['/']);
            }
        })


    }

    //function other
    ToSimplified(string) {
        return string.toString()
    }


    ToNarrow(str) {
        var length = str.length;
        var i;
        for (i = 0; i < length; i++) {
            var c = str[i];
            if (c >= '！' && c <= '～') {
                break;
            }
        }
        if (i >= length) {
            return str;
        }
        var stringBuilder = []
        for (i = 0; i < length; i++) {
            var c = str[i];
            if (c >= '！' && c <= '～') {
                stringBuilder.push(c - '！' + '!');
            }
            else {
                stringBuilder.push(c);
            }
        }
        return stringBuilder.join('');
    }
    isChinese(character) {
        return this.hanVietDictionary.ContainsKey(character.toString());
    }
    IsControl(ch) {
        var isControlRex = /[\u0000-\u001F\u007F-\u009F]/;
        return isControlRex.test(ch);
    }
    indentAllLines(text, insertBlankLine) {
        var array = text.split(/[\n\r]/).filter(function (x) { return x != ""; })
        var stringBuilder = []
        var array2 = [...array];
        for (var i = 0; i < array2.length; i++) {
            var text2 = array2[i];
            if (text2.trim()) {
                stringBuilder.push("\t" + text2.trim())
                //#Check error
                stringBuilder.push("\n")
                stringBuilder.push(insertBlankLine ? "\n" : "")
                //stringBuilder.push(insertBlankLine ? " " : "")
            }
        }
        return stringBuilder.join('');
    }
    removeIgnoredChinesePhrases(standardizedChinese) {
        if (!standardizedChinese) {
            return "";
        }
        var text = standardizedChinese;
        this.ignoredChinesePhraseList.forEach(current => {
            text = text.replaceAll(current, "");
        })
        return text.replace(/[\t\n\r]/, "").replaceAll('. . . . . .', "...");
    }

    _ToUpperCase(text) {
        if (!text) {
            return text;
        }
        if (text.startsWith("[") && 2 <= text.length) {
            return "[" + text[1].toUpperCase() + (text.length <= 2 ? "" : text.substring(2));
        }
        if (text.startsWith("<i") && 2 <= text.length) {
            //var arr = text.ToCharArray();
            var arr = text.split('')
            for (var i = 0; i < text.length; i++) {
                if (arr[i] == '>') {
                    var j = i;
                    while (!this.hgac.includes(arr[j]) && j < arr.length) {
                        j++;
                    }
                    arr[j] = arr[j].toUpperCase();
                    break;
                }
            }
            var result = arr.join('')
            return result;
        }
        return text[0].toUpperCase() + (text.length <= 1 ? "" : text.substring(1));
    }

    //C# String.Remove method
    _RemoveString(string, start, count) {
        //Check

        string = string.toString()
        if (start < string.length && count + start <= string.length && string) {
            var str1 = string.substr(0, start);
            var str2 = string.replace(str1, '').substr(count, string.length - 1)
            return str1 + str2
        } else {
            console.log("Error Remove string");
            return ""
        }


    }

    _Substring(string, start, length) {
        //Check
        if (start < string.length && length + start <= string.length && string) {
            return string.substring(start, start + length)
        } else {
            console.log("Error substring string");
            return ""
        }
    }

    _TrimCharList(string, charlist) {
        if (string) {
            charlist.forEach(value => {
                string.trimLeft(value).trimRight(value);
            })
        }

        return string
    }

    nextCharIsChinese(chinese, currentPhraseEndIndex) {
        return chinese.length - 1 > currentPhraseEndIndex && this.isChinese(chinese[currentPhraseEndIndex + 1]);
    }
    containsName(chinese, startIndex, phraseLength) {
        if (phraseLength < 2) {
            return false;
        }
        if (this.onlyNameDictionary.ContainsKey(this._Substring(chinese, startIndex, phraseLength))) {
            return false;
        }
        var num = startIndex + phraseLength - 1;
        var num2 = 2;
        for (var i = startIndex + 1; i <= num; i++) {
            for (var j = 20; j >= num2; j--) {
                if (chinese.length >= i + j && this.onlyNameDictionary.ContainsKey(this._Substring(chinese, i, j))) {
                    return true;
                }
            }
        }
        return false;
    }

    isLongestPhraseInSentence(chinese, startIndex, phraseLength, dictionary, translationAlgorithm) {
        if (phraseLength < 2) {
            return true;
        }
        var num = translationAlgorithm == 0 ? phraseLength : phraseLength < 3 ? 3 : phraseLength;
        var num2 = startIndex + phraseLength - 1;
        for (var i = startIndex + 1; i <= num2; i++) {
            for (var j = 20; j > num; j--) {
                if (chinese.length >= i + j && dictionary.ContainsKey(this._Substring(chinese, i, j))) {
                    return false;
                }
            }
        }
        return true;
    }

    IsAllChinese(text) {
        for (var i = 0; i < text.length; i++) {
            var character = text[i];
            if (!this.isChinese(character)) {
                return false;
            }
        }
        return true;
    }


}

module.exports = new TranslatorEngine()