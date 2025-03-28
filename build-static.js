const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Display current directory and node version
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
console.log('Starting custom build process...');

// Clean previous build files
console.log('Cleaning previous build files...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('Removed .next directory');
  }
  
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
    console.log('Removed out directory');
  }
} catch (error) {
  console.error('Error during cleanup:', error);
}

// Run the Next.js build
console.log('Running Next.js build...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('Next.js build completed successfully');
} catch (error) {
  console.error('Error during Next.js build:', error);
  process.exit(1);
}

// Create the out directory if it doesn't exist
console.log('Creating output directory...');
try {
  if (!fs.existsSync('out')) {
    fs.mkdirSync('out', { recursive: true });
  }
} catch (error) {
  console.error('Error creating out directory:', error);
}

// Copy static files from .next/static to out/static
console.log('Copying static files...');
try {
  if (fs.existsSync('.next/static')) {
    fs.mkdirSync('out/_next/static', { recursive: true });
    const copyFolderSync = (from, to) => {
      fs.mkdirSync(to, { recursive: true });
      fs.readdirSync(from).forEach(element => {
        if (fs.lstatSync(path.join(from, element)).isFile()) {
          fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else {
          copyFolderSync(path.join(from, element), path.join(to, element));
        }
      });
    };
    copyFolderSync('.next/static', 'out/_next/static');
    console.log('Static files copied successfully');
  }
} catch (error) {
  console.error('Error copying static files:', error);
}

// Create a simple index.html file
console.log('Creating index.html...');
const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weather Warning System</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { 
      font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    .container { margin-top: 40px; }
    h1 { color: #0070f3; }
    .btn {
      display: inline-block;
      background-color: #0070f3;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Weather Warning System</h1>
    <p>The application has been successfully built and deployed.</p>
    <p>This is a static placeholder page. The full application requires server-side functionality.</p>
    <a class="btn" href="/admin">Access Admin Panel</a>
  </div>
</body>
</html>
`;

try {
  fs.writeFileSync('out/index.html', indexHtml);
  console.log('Created index.html file');
} catch (error) {
  console.error('Error creating index.html:', error);
}

// Create a simple 404 page
console.log('Creating 404.html...');
const notFoundHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Page Not Found | Weather Warning System</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { 
      font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    .container { margin-top: 40px; }
    h1 { color: #0070f3; }
    .btn {
      display: inline-block;
      background-color: #0070f3;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Page Not Found</h1>
    <p>The page you are looking for doesn't exist.</p>
    <a class="btn" href="/">Return to Home</a>
  </div>
</body>
</html>
`;

try {
  fs.writeFileSync('out/404.html', notFoundHtml);
  console.log('Created 404.html file');
} catch (error) {
  console.error('Error creating 404.html:', error);
}

console.log('Build completed successfully!'); 