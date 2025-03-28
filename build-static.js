const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Display current directory and node version
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
console.log('Starting build process...');

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

  if (fs.existsSync('node_modules/.cache')) {
    fs.rmSync('node_modules/.cache', { recursive: true, force: true });
    console.log('Removed node_modules/.cache directory');
  }
} catch (error) {
  console.error('Error during cleanup:', error);
}

// Run the Next.js build
console.log('Running Next.js build...');
try {
  // Use environment variables to skip SWC compiler and increase memory limit
  const buildEnv = {
    ...process.env,
    NEXT_SKIP_SWC: '1',
    NODE_OPTIONS: '--max_old_space_size=4096',
    NEXT_TELEMETRY_DISABLED: '1'
  };
  
  execSync('npm run build', { 
    stdio: 'inherit',
    env: buildEnv
  });
  console.log('Next.js build completed successfully');
  
  // Run Next.js export
  execSync('npm run export', { 
    stdio: 'inherit',
    env: buildEnv
  });
  console.log('Next.js export completed successfully');
} catch (error) {
  console.error('Error during Next.js build:', error);
  process.exit(1);
}

console.log('Build completed successfully!'); 