all: 
	cd templates; python build.py>bundle.js cd ../;
	jsbuild manifest.json

deploy:
	cp -rf site/* ~/www/multiplayerchess.com/public/test/.
	cp ~/www/multiplayerchess.com/public/test/index.html.bak ~/www/multiplayerchess.com/public/test/index.html
