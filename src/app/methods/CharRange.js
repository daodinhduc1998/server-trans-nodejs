class CharRange {
    startIndex
    length
    constructor(startIndex, length) {
        this.startIndex = startIndex
        this.length = length
    }
    StartIndex() {
        get: () => { return startIndex }
        set: (value) => { startIndex = value }
    }
    Length() {
        get: () => { return length }
        set: (value) => { length = value }
    }
    IsInRange(index) {
        return Boolean(startIndex <= index && index <= startIndex + length - 1)
    }
    GetEndIndex() {
        return startIndex + length - 1;
    }

}

module.exports = new CharRange()