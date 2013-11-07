zip -r *  app/*   -x\app/bower_components/* -x\node_modules/* -x\*.zip
mv app.zip "yoscrum-""$1"".zip"
