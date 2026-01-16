const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/context/DataContext.jsx');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');

    // We want to keep up to line 2290. 
    // view_file is 1-indexed. Array is 0-indexed.
    // So we want indices 0 to 2289.
    // Line 2290 content is "};".
    // 2290 lines total.

    if (lines.length <= 2290) {
        console.log('File is already short enough (' + lines.length + ' lines). No action taken.');
    } else {
        const newLines = lines.slice(0, 2290);
        const newContent = newLines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Successfully truncated file to 2290 lines.');
    }
} catch (err) {
    console.error('Error processing file:', err);
}
