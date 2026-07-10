const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const dir = path.join(__dirname, 'frontend/src');

walk(dir, function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace Tailwind arbitrary values
        content = content.replace(/text-\[\#C0987A\]/g, 'text-primary');
        content = content.replace(/bg-\[\#C0987A\]/g, 'bg-primary');
        content = content.replace(/border-\[\#C0987A\]/g, 'border-primary');
        content = content.replace(/ring-\[\#C0987A\]/g, 'ring-primary');
        content = content.replace(/accent-\[\#C0987A\]/g, 'accent-primary');
        content = content.replace(/shadow-\[\#C0987A\]/g, 'shadow-primary');
        content = content.replace(/from-\[\#C0987A\]/g, 'from-primary');
        content = content.replace(/to-\[\#D9A05B\]/g, 'to-primary/80');

        // Replace inline constants
        content = content.replace(/const PRIMARY = "\#C0987A";\n?/g, '');
        content = content.replace(/PRIMARY/g, '"var(--theme-primary, #C0987A)"');

        // Also clean up any direct hex usage in inline styles or strings
        content = content.replace(/"\#C0987A"/g, '"var(--theme-primary, #C0987A)"');

        fs.writeFileSync(filePath, content, 'utf8');
    }
});

// Update index.css
const cssPath = path.join(__dirname, 'frontend/src/styles/index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent = cssContent.replace(/--primary: #C0987A;/g, '--primary: var(--theme-primary, #C0987A);');
cssContent = cssContent.replace(/--ring: #C0987A;/g, '--ring: var(--theme-primary, #C0987A);');
cssContent = cssContent.replace(/--chart-1: #C0987A;/g, '--chart-1: var(--theme-primary, #C0987A);');
cssContent = cssContent.replace(/--sidebar-primary: #C0987A;/g, '--sidebar-primary: var(--theme-primary, #C0987A);');
cssContent = cssContent.replace(/--sidebar-ring: #C0987A;/g, '--sidebar-ring: var(--theme-primary, #C0987A);');

// The .dark block uses oklch, we can leave it or replace it. The user wants persistent color changes across both themes.
// If we want the accent color to apply in dark mode too, we should replace it there as well.
cssContent = cssContent.replace(/--primary: oklch\(0\.7 0\.08 55\);/g, '--primary: var(--theme-primary, #C0987A);');
cssContent = cssContent.replace(/--ring: oklch\(0\.7 0\.08 55\);/g, '--ring: var(--theme-primary, #C0987A);');
cssContent = cssContent.replace(/--chart-1: oklch\(0\.7 0\.08 55\);/g, '--chart-1: var(--theme-primary, #C0987A);');
cssContent = cssContent.replace(/--sidebar-primary: oklch\(0\.7 0\.08 55\);/g, '--sidebar-primary: var(--theme-primary, #C0987A);');
cssContent = cssContent.replace(/--sidebar-ring: oklch\(0\.7 0\.08 55\);/g, '--sidebar-ring: var(--theme-primary, #C0987A);');


fs.writeFileSync(cssPath, cssContent, 'utf8');

console.log('Colors updated successfully.');
