prod:
	cp * ~/www/multiplayerchess.com/api/.
	cp config-prod.js ~/www/multiplayerchess.com/api/config.js
	cd ~/www/multiplayerchess.com/api; \
	make restart
	sleep 0.5
	make test

make test:
	curl -X PUT http://multiplayerchess.com/api/session/init -d "{}"

restart:
	make stop
	make run

stop:
	echo "[stop]">>logs
	kill `cat .pid`
	rm .pid

run:
	echo "[start]">>logs
	node service.js>>logs &

.PHONY: logs
logs:
	tail -f ./logs
