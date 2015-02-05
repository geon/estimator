
mkdir temp-client

cd public
grunt jade
grunt less
grunt autoprefixer

mv index.html css/style.css css/markdown.css ../temp-client

cd ..
