

var Dictionary = (function () {
    function Dictionary() {
        if (!(this instanceof Dictionary))
            return new Dictionary();
    }

    Dictionary.prototype.Count = function () {
        var key,
            count = 0;

        for (key in this) {
            if (this.hasOwnProperty(key))
                count += 1;
        }
        return count;
    };

    Dictionary.prototype.Keys = function () {
        var key,
            keys = [];

        for (key in this) {
            if (this.hasOwnProperty(key))
                keys.push(key);
        }
        return keys;
    };

    Dictionary.prototype.Values = function () {
        var key,
            values = [];

        for (key in this) {
            if (this.hasOwnProperty(key))
                values.push(this[key]);
        }
        return values;
    };

    Dictionary.prototype.KeyValuePairs = function () {
        var key,
            keyValuePairs = [];

        for (key in this) {
            if (this.hasOwnProperty(key))
                keyValuePairs.push({
                    Key: key,
                    Value: this[key]
                });
        }
        return keyValuePairs;
    };

    Dictionary.prototype.Add = function (key, value) {
        this[key] = value;
    }

    Dictionary.prototype.Clear = function () {
        var key,
            dummy;

        for (key in this) {
            if (this.hasOwnProperty(key))
                dummy = delete this[key];
        }
    }

    Dictionary.prototype.ContainsKey = function (key) {
        return this.hasOwnProperty(key);
    }

    Dictionary.prototype.ContainsValue = function (value) {
        var key;

        for (key in this) {
            if (this.hasOwnProperty(key) && this[key] === value)
                return true;
        }
        return false;
    }

    Dictionary.prototype.Remove = function (key) {
        var dummy;

        if (this.hasOwnProperty(key)) {
            dummy = delete this[key];
            return true;
        } else
            return false;
    }

    return Dictionary;
}());

module.exports = { Dictionary }