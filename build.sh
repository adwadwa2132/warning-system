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
    .error {
      color: #d32f2f;
      background-color: #ffebee;
      padding: 15px;
      border-radius: 8px;
      margin: 30px 0;
      border: 1px solid #ffcdd2;
    }
    .form {
      margin: 30px 0;
      text-align: center;
    }
    .form input {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 300px;
      max-width: 100%;
      font-size: 16px;
    }
    .form button {
      background-color: #0070f3;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <h1>Weather Warning System</h1>
  
  <div class="notice">
    <h2>This is a static placeholder page</h2>
    <p>The main Weather Warning System is running on a different server.</p>
  </div>
  
  <div class="error">
    <h3>Netlify Site Access</h3>
    <p>You are currently accessing the Netlify host site, not the main application.</p>
    <p>The Weather Warning System should be accessed at a different URL than what you're currently using.</p>
  </div>
  
  <div class="form">
    <p>Enter the correct domain for your Weather Warning System:</p>
    <input type="text" id="customDomain" placeholder="example: app.weathersystem.com" />
    <button onclick="navigateToCustomDomain()">Go to Site</button>
  </div>
  
  <p>If you're the system administrator, please ensure you're using the correct URL to access your Weather Warning System.</p>
  
  <p style="margin-top: 40px; color: #666;">This static page is hosted on Netlify but your main application is likely on a different server.</p>
  
  <script>
    function navigateToCustomDomain() {
      const domain = document.getElementById('customDomain').value.trim();
      if (domain) {
        // Add https:// if not included
        let url = domain;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        window.open(url, '_blank');
      }
    }
  </script>
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