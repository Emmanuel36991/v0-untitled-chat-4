const fs = require('fs');

const rawIcons = fs.readFileSync('tmp_icons.tsx', 'utf8');
const systemIconsFile = 'components/icons/system-icons.tsx';
let content = fs.readFileSync(systemIconsFile, 'utf8');

// Parse rawIcons and extract each function
const iconRegex = /export\s+function\s+([A-Za-z0-9_]+)\s*\([^\{]*\{[\s\S]*?(?=\nexport\s+function|$)/g;
let match;
while ((match = iconRegex.exec(rawIcons)) !== null) {
    const iconName = match[1];
    const newImpl = match[0].trim();

    // replace in the original file
    const searchRegex = new RegExp("export\\s+function\\s+" + iconName + "\\s*\\([^\\{]*\\{[\\s\\S]*?(?=\\nexport\\s+function|\\nexport\\s+const|\\nexport\\s+default|\\n$|$)", "g");

    if (searchRegex.test(content)) {
        content = content.replace(searchRegex, newImpl);
        console.log("Replaced " + iconName);
    } else {
        content += "\n" + newImpl;
        console.log("Appended " + iconName);
    }
}

fs.writeFileSync(systemIconsFile, content, 'utf8');
console.log('Update complete.');
