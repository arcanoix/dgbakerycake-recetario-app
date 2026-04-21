const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapeo de colores problemáticos a colores legibles
const colorReplacements = [
  // Textos grises claros -> oscuros
  { from: /text-gray-400/g, to: 'text-gray-700' },
  { from: /text-gray-500/g, to: 'text-gray-700' },
  { from: /text-muted-foreground/g, to: 'text-gray-700' },
  
  // Bordes grises claros -> más definidos
  { from: /border-gray-100/g, to: 'border-gray-200' },
  { from: /border-gray-200(?!\s)/g, to: 'border-gray-300' },
  
  // Backgrounds grises muy claros -> más visibles
  { from: /bg-gray-50(?!\s)/g, to: 'bg-gray-100' },
];

// Patrones a eliminar (referencias a dark mode)
const darkModePatterns = [
  /\s+dark:text-[\w-]+/g,
  /\s+dark:bg-[\w-]+/g,
  /\s+dark:border-[\w-]+/g,
  /\s+dark:hover:[\w-]+/g,
  /\s+dark:focus:[\w-]+/g,
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Aplicar reemplazos de colores
  colorReplacements.forEach(({ from, to }) => {
    if (content.match(from)) {
      content = content.replace(from, to);
      modified = true;
    }
  });
  
  // Eliminar clases dark mode
  darkModePatterns.forEach(pattern => {
    if (content.match(pattern)) {
      content = content.replace(pattern, '');
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Buscar todos los archivos TSX y JSX
const files = [
  ...glob.sync('app/**/*.{tsx,jsx}', { cwd: process.cwd() }),
  ...glob.sync('components/**/*.{tsx,jsx}', { cwd: process.cwd() }),
];

console.log(`Found ${files.length} files to process...\n`);

let fixedCount = 0;
files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (processFile(fullPath)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
