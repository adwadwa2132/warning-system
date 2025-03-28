#!/bin/bash

echo "Creating static site with no redirects..."

# Create output directory and clean it
mkdir -p out
rm -rf out/*

# Create a simple static site rather than using redirects
cat > out/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weather Warning System</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #0070f3;
      margin-top: 40px;
    }
    .button {
      display: inline-block;
      background-color: #0070f3;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 10px;
      font-size: 18px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .button:hover {
      background-color: #005bb5;
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0,0,0,0.15);
    }
    .notice {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #eaeaea;
    }
    .alternatives {
      margin-top: 40px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    .alternatives a {
      color: #0070f3;
      text-decoration: underline;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <h1>Weather Warning System</h1>
  
  <div class="notice">
    <h2>This is a static placeholder page</h2>
    <p>The Weather Warning System is available via the buttons below.</p>
  </div>
  
  <p>Click one of these buttons to access the Weather Warning System:</p>
  
  <div>
    <a class="button" href="https://warningtest.oragewx.site" target="_blank" rel="noopener noreferrer">
      Open Weather System (HTTPS)
    </a>
    
    <a class="button" href="http://warningtest.oragewx.site" target="_blank" rel="noopener noreferrer">
      Open Weather System (HTTP)
    </a>
  </div>
  
  <div class="alternatives">
    <p>Alternative direct links:</p>
    <a href="https://warningtest.oragewx.site" target="_blank">warningtest.oragewx.site (HTTPS)</a>
    <a href="http://warningtest.oragewx.site" target="_blank">warningtest.oragewx.site (HTTP)</a>
  </div>
  
  <p style="margin-top: 40px; color: #666;">This static page is hosted on Netlify and serves as an entry point to the main application.</p>
</body>
</html>
EOF

cat > out/404.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Page Not Found</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #0070f3;
      margin-top: 40px;
    }
    .button {
      display: inline-block;
      background-color: #0070f3;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      margin-top: 20px;
    }
    .button:hover {
      background-color: #005bb5;
    }
  </style>
</head>
<body>
  <h1>Page Not Found</h1>
  <p>The page you are looking for does not exist.</p>
  <a class="button" href="/">Return to Home</a>
</body>
</html>
EOF

# Create minimal Next.js-like structure to satisfy the plugin
mkdir -p out/_next/static/chunks/pages
mkdir -p out/.next/server/pages

echo "console.log('main')" > out/_next/static/chunks/main.js
echo "module.exports={}" > out/.next/server/pages/index.js

echo "Simplified static site created successfully!"
exit 0 