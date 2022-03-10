var chinese = "DucDD打一顿"
var key = '{0}打一顿'


var text = key.replace('{0}', "([^,\\. ?]{1,10})")
console.log(text)

var rgx = new RegExp(text, 'i')
var match = rgx.exec(chinese);
console.log(match.length)
var num = 0;
while (match) {
    var value = match[1];
    if (key.startsWith("{0}")) {
        console.log(value)
        break
        console.log("asdasd")
    }
    num++;
    if (num > 1) {
        break;
    }
}
