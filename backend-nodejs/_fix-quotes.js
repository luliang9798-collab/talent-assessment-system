const fs = require('fs');
let code = fs.readFileSync('server-minimal.js', 'utf8');

// Fix: replace double quotes inside single-quoted strings with Chinese brackets
let fixed = 0;
code = code.replace(/'([^']*)'/g, function(match, content) {
    if (content.indexOf('"') >= 0) {
        fixed++;
        var newContent = content.replace(/"/g, '\u300c'); // use 「
        return "'" + newContent + "'";
    }
    return match;
});

fs.writeFileSync('server-minimal.js', code, 'utf8');
console.log('Fixed ' + fixed + ' strings with internal double quotes');
