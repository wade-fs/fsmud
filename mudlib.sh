cat $(find domain/ -name '*.js' -not -name "mudlib.js" -not -name "app.js") > mudlib.txt
[ -f "domain/mudlib.js" ] && cat domain/mudlib.js >> mudlib.txt
echo "" >> mudlib.txt
echo "// golang" >> mudlib.txt
cat cmd/mud/*.go >> mudlib.txt
