#!/bin/bash

# Create the output directory
echo "Creating static output directory..."
mkdir -p out
rm -rf out/*

# Generate a simple HTML file that redirects to the main site
echo "Generating simple static site..."
cat > out/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weather Warning System</title>
  <meta http-equiv="refresh" content="0;url=https://warningtest.oragewx.site">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      text-align: center;
      background-color: #f7f7f7;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 40px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #0070f3;
    }
    p {
      font-size: 18px;
      line-height: 1.5;
    }
    .button {
      display: inline-block;
      background-color: #0070f3;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Weather Warning System</h1>
    <p>You're being redirected to the main site.</p>
    <p>If you are not redirected automatically, please click the button below:</p>
    <a class="button" href="https://warningtest.oragewx.site">Go to Weather Warning System</a>
  </div>
  <script>
    setTimeout(function() {
      window.location.href = "https://warningtest.oragewx.site";
    }, 1500);
  </script>
</body>
</html>
EOF

# Create a netlify.redirects file as a backup redirection method
echo "/* https://warningtest.oragewx.site/:splat 301!" > out/_redirects

echo "Static site created successfully!"
exit 0 