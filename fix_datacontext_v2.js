const fs = require('fs');
const path = require('path');

// Hardcoded absolute path to avoid ambiguity
const filePath = 'c:/VINI anti/vini/src/context/DataContext.jsx';

console.log('Target file:', filePath);

try {
    if (!fs.existsSync(filePath)) {
        console.error('File does not exist!');
        process.exit(1);
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');

    console.log('Current line count:', lines.length);

    if (lines.length <= 2290) {
        console.log('File is already short enough. No action taken.');
    } else {
        const newLines = lines.slice(0, 2290);
        // Ensure the last line matches "};" to be sure we are cutting at the right place
        const lastLine = newLines[newLines.length - 1].trim();
        console.log('New last line content:', lastLine);

        if (lastLine !== '};') {
            console.warn('WARNING: The cut point does not look like the end of a component ("};"). Proceeding anyway but check file manually.');
        }

        const newContent = newLines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Successfully truncated file to 2290 lines.');
    }
} catch (err) {
    console.error('Error processing file:', err);
    process.exit(1);
}
