all:
	make templates;
	make js;

.PHONY: templates
templates:
	cd templates; \
	python build.py>bundle.js; \
	cd ../;

.PHONY: wallpapers
wallpapers:
	cd wallpapers; \
	node pack.js > wallpapers.js; \
	cd ../;

js:
	jsbuild manifest.json

deploy:
	cp -rf site/* ~/www/multiplayerchess.com/public/test/.
	cp ~/www/multiplayerchess.com/public/test/index-test.html ~/www/multiplayerchess.com/public/test/index.html

prod:
	cp -rf site/* ~/www/multiplayerchess.com/public/.
	cp ~/www/multiplayerchess.com/public/index-prod.html ~/www/multiplayerchess.com/public/index.html
