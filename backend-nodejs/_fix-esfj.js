const fs = require('fs');
let code = fs.readFileSync('server-minimal.js', 'utf8');

// Fix ESFJ line - replace broken quote characters
code = code.replace(
    "str:['出色的人际交往能力','热忱的服务态度','善于组织社交活动','团队的「润滑剂「和「暖心人「]']",
    "str:['出色的人际交往能力','热忱的服务态度','善于组织社交活动','团队的润滑剂和暖心人']"
);

fs.writeFileSync('server-minimal.js', code, 'utf8');
console.log('Fixed ESFJ line');

// Also fix ISFJ line if it has similar issues
const isfjFixed = code.includes("'粘合剂'");
if (isfjFixed) {
    code = code.replace(/'粘合剂'/g, "'粘合剂'");
    fs.writeFileSync('server-minimal.js', code, 'utf8');
    console.log('Fixed ISFJ line too');
}
