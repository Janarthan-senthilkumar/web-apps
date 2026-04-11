const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const outputFilePath = path.join(projectRoot, 'SourceCode_30Pages.txt');
// Prioritize the most important files first to ensure they make it into the 30 pages
const priorityFiles = [
    'backend/server.js',
    'backend/models/index.js',
    'backend/models/User.js',
    'backend/models/Inventory.js',
    'backend/models/DamageReport.js',
    'backend/routes/authRoutes.js',
    'backend/routes/inventoryRoutes.js',
    'backend/routes/damageRoutes.js',
    'frontend/src/App.jsx',
    'frontend/src/main.jsx',
    'frontend/src/pages/Dashboard.jsx',
    'frontend/src/pages/InventoryList.jsx',
    'frontend/src/pages/DamageList.jsx',
    'frontend/src/pages/DamageForm.jsx'
];

let finalContent = '# Critical Project Source Code (Shortened to ~30 Pages)\n\n';
let currentLines = 0;
const MAX_LINES = 1450;

for (const relPath of priorityFiles) {
    if (currentLines >= MAX_LINES) break;

    const fullPath = path.join(projectRoot, relPath);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        finalContent += `### File: ${relPath}\n\n`;
        finalContent += content + '\n\n------------------------------------------------------------\n\n';

        // Count lines added
        currentLines += (content.match(/\n/g) || []).length + 5;
    }
}

// Append a final note if truncated
if (currentLines >= MAX_LINES) {
    finalContent += '\n\n*** NOTE: Document truncated here to meet the ~30 page length requirement. ***';
}

fs.writeFileSync(outputFilePath, finalContent, 'utf8');
console.log(`Success! File written to: ${outputFilePath}`);
