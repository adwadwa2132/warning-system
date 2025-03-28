#!/bin/bash

echo "Creating Next.js build structure..."

# Create output directory and clean it
mkdir -p out
rm -rf out/*

# Create required Next.js runtime files (required by plugin)
mkdir -p out/_next/static/chunks/pages
mkdir -p out/_next/static/css
mkdir -p out/_next/static/media
mkdir -p out/_next/static/images
mkdir -p out/_next/server/pages
mkdir -p out/_next/server/chunks
mkdir -p out/_next/data
mkdir -p out/.next

# Create a build ID as expected by Netlify Next.js plugin
BUILD_ID=$(date +%s)
echo $BUILD_ID > out/_next/BUILD_ID
echo $BUILD_ID > out/.next/BUILD_ID

# Create more detailed required Next.js files
echo "{\"version\":3,\"pages404\":true,\"basePath\":\"\",\"redirects\":[{\"source\":\"/:path+\",\"destination\":\"https://warningtest.oragewx.site/:path\",\"permanent\":true}],\"headers\":[],\"dynamicRoutes\":[],\"staticRoutes\":[{\"page\":\"/\",\"regex\":\"^\\/(?:\\/)?$\",\"routeKeys\":{},\"namedRegex\":\"^\\/(?:\\/)?$\"},{\"page\":\"/404\",\"regex\":\"^\\/404(?:\\/)?$\",\"routeKeys\":{},\"namedRegex\":\"^\\/404(?:\\/)?$\"}],\"dataRoutes\":[],\"rewrites\":[]}" > out/_next/routes-manifest.json
echo "{\"pages\":{\"/_app\":\"static/chunks/pages/_app.js\",\"/:\":\"static/chunks/pages/index.js\",\"/404\":\"static/chunks/pages/404.js\"},\"app\":{},\"buildId\":\"$BUILD_ID\",\"assetPrefix\":\"\",\"nextConfigOutput\":\"export\"}" > out/_next/build-manifest.json
echo "{\"middleware\":{\"rewrites\":[]},\"version\":1}" > out/_next/required-server-files.json

# Create a .next/prerender-manifest.json file which the plugin checks for
echo "{\"version\":4,\"routes\":{},\"dynamicRoutes\":{},\"preview\":{\"previewModeId\":\"previewModeId\",\"previewModeSigningKey\":\"previewModeSigningKey\",\"previewModeEncryptionKey\":\"previewModeEncryptionKey\"}}" > out/.next/prerender-manifest.json

# Create minimal JS files
echo "console.log('main chunk')" > out/_next/static/chunks/main.js
echo "console.log('webpack chunk')" > out/_next/static/chunks/webpack.js
echo "function MyApp(props){return props.children}" > out/_next/static/chunks/pages/_app.js
echo "export default function Home(){return null}" > out/_next/static/chunks/pages/index.js
echo "export default function Custom404(){return null}" > out/_next/static/chunks/pages/404.js

# Copy the files to .next directory too for redundancy
cp -r out/_next/static out/.next/
mkdir -p out/.next/server/pages
echo "module.exports={}" > out/.next/server/pages/index.js
echo "module.exports={}" > out/.next/server/pages/404.js
echo "module.exports={}" > out/.next/server/pages/_app.js

# Create HTML files
cat > out/404.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>404 - Page Not Found</title>
  <meta http-equiv="refresh" content="0;url=https://warningtest.oragewx.site">
  <script src="/_next/static/chunks/main.js" defer></script>
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

# List contents for debugging
echo "Created files in out directory:"
find out -type f | sort

echo "Next.js structure created successfully!"
exit 0 