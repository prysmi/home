// inline-css.js
const fs = require('fs');
const path = require('path');

try {
  const distPath = path.join(__dirname, 'dist');
  const cssPath = path.join(distPath, 'style.css');
  const htmlPath = path.join(distPath, 'index.html');

  console.log('Starting CSS inlining process...');
  
  // 1. Read the generated CSS content
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  console.log(`Successfully read ${cssContent.length} bytes from style.css`);

  // 2. Read the generated HTML content
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  console.log(`Successfully read index.html`);
  
  // 3. Define the link tag we want to replace
  const placeholder = '<link href="style.css" rel="stylesheet">';

  // 4. Create the replacement <style> tag
  const inlineStyle = `<style>${cssContent}</style>`;

  // 5. Replace the placeholder in the HTML
  htmlContent = htmlContent.replace(placeholder, inlineStyle);
  console.log('Replaced stylesheet link with inline styles.');

  // 6. Write the modified HTML back to the file
  fs.writeFileSync(htmlPath, htmlContent);
  console.log('Successfully inlined CSS into dist/index.html!');

} catch (error) {
  console.error('Error during CSS inlining:', error);
  process.exit(1); // Exit with an error code
}
