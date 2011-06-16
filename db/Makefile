all:
	curl -X DELETE "http://user:passwd@127.0.0.1:5984/chess_dev"
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev"

	# design docs
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/_design/list" -d @docs/list.json

	# sessions
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/s1" -d @docs/session1.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/s2" -d @docs/session2.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/s3" -d @docs/session3.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/s4" -d @docs/session4.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/s5" -d @docs/session5.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/s6" -d @docs/session6.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/s7" -d @docs/session7.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/s8" -d @docs/session8.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/ended" -d @docs/ended.json

	# players
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/sp1" -d @docs/session_player1.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/sp2" -d @docs/session_player2.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/sp3" -d @docs/session_player3.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/sp4" -d @docs/session_player4.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/sp5" -d @docs/session_player5.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/sp6" -d @docs/session_player6.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/sp7" -d @docs/session_player7.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/sp8" -d @docs/session_player8.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/sp9" -d @docs/session_player9.json
	curl -X PUT "http://user:passwd@127.0.0.1:5984/chess_dev/sp10" -d @docs/session_player10.json
