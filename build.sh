#!/bin/bash

echo "Creating Next.js build structure..."

# Create necessary directories
mkdir -p out
mkdir -p out/_next/static/chunks/pages
mkdir -p out/_next/static/css
mkdir -p out/_next/static/media
mkdir -p out/_next/static/development

# Create required Next.js files
echo "{\"pages\":{\"/_app\":\"static/chunks/pages/_app.js\",\"/:\"static/chunks/pages/index.js\",\"/404\":\"static/chunks/pages/404.js\"},\"app\":{}}" > out/_next/build-manifest.json
echo "{\"version\":3,\"pages404\":true,\"basePath\":\"\",\"redirects\":[{\"source\":\"/:path+\",\"destination\":\"https://warningtest.oragewx.site/:path\",\"permanent\":true}],\"headers\":[],\"dynamicRoutes\":[],\"staticRoutes\":[],\"dataRoutes\":[],\"rewrites\":[]}" > out/_next/routes-manifest.json
echo "{}" > out/_next/required-server-files.json

# Create minimal JS files
echo "console.log('main')" > out/_next/static/chunks/main.js
echo "console.log('webpack')" > out/_next/static/chunks/webpack.js
echo "function MyApp(props){return props.children}" > out/_next/static/chunks/pages/_app.js
echo "export default function Home(){return null}" > out/_next/static/chunks/pages/index.js

# Create HTML files
cat > out/404.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>404 - Page Not Found</title>
  <meta http-equiv="refresh" content="0;url=https://warningtest.oragewx.site">
  <script>window.location.href="https://warningtest.oragewx.site";</script>
</head>
<body>Redirecting...</body>
</html>
EOF

cat > out/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weather Warning System</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0;url=https://warningtest.oragewx.site">
  <script src="/_next/static/chunks/main.js" defer></script>
  <script src="/_next/static/chunks/webpack.js" defer></script>
  <script src="/_next/static/chunks/pages/_app.js" defer></script>
  <script src="/_next/static/chunks/pages/index.js" defer></script>
  <style>
    body {font-family:sans-serif; text-align:center; padding:40px;}
    .container {max-width:600px; margin:0 auto;}
    h1 {color:#0070f3;}
  </style>
</head>
<body>
  <div class="container">
    <h1>Redirecting to Weather Warning System</h1>
    <p>If you are not redirected, <a href="https://warningtest.oragewx.site">click here</a></p>
  </div>
  <script>
    setTimeout(function(){window.location.href="https://warningtest.oragewx.site";}, 500);
  </script>
</body>
</html>
EOF

# Create Netlify-specific redirects
echo "/* https://warningtest.oragewx.site/:splat 301!" > out/_redirects

echo "Next.js structure created successfully!"
exit 0 