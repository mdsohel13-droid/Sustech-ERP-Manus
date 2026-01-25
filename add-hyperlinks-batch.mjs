#!/usr/bin/env node

/**
 * Batch script to add HyperlinkCell imports to all module files
 * This script adds the import statement at the top of each module file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const modules = [
  'client/src/pages/Sales.tsx',
  'client/src/pages/Products.tsx',
  'client/src/pages/Customers.tsx',
  'client/src/pages/Purchases.tsx',
  'client/src/pages/Inventory.tsx',
  'client/src/pages/Financial.tsx',
  'client/src/pages/IncomeExpenditure.tsx',
  'client/src/pages/Budget.tsx',
  'client/src/pages/TenderQuotation.tsx',
  'client/src/pages/CRM.tsx',
  'client/src/pages/ActionTracker.tsx',
  'client/src/pages/HR.tsx',
  'client/src/pages/ReportingAnalytics.tsx',
];

const hyperlinkImport = `import { HyperlinkCell, HyperlinkTableCell, HyperlinkCardCell, HyperlinkListItem } from "@/components/HyperlinkCell";\n`;

modules.forEach((modulePath) => {
  const fullPath = path.join(__dirname, modulePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    
    // Check if import already exists
    if (!content.includes('HyperlinkCell')) {
      // Find the last import statement
      const importRegex = /^import\s+.*?from\s+["'].*?["'];/gm;
      const matches = [...content.matchAll(importRegex)];
      
      if (matches.length > 0) {
        const lastImport = matches[matches.length - 1];
        const insertPosition = lastImport.index + lastImport[0].length;
        content = content.slice(0, insertPosition) + '\n' + hyperlinkImport + content.slice(insertPosition);
      } else {
        // No imports found, add at the beginning
        content = hyperlinkImport + content;
      }
      
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`✓ Added HyperlinkCell import to ${modulePath}`);
    } else {
      console.log(`✓ HyperlinkCell import already exists in ${modulePath}`);
    }
  } else {
    console.log(`✗ File not found: ${modulePath}`);
  }
});

console.log('\nBatch import addition complete!');
