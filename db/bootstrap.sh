curl -X DELETE "http://127.0.0.1:5984/chess_test"
curl -X PUT "http://127.0.0.1:5984/chess_test"

# design docs
curl -X PUT "http://127.0.0.1:5984/chess_test/_design/list" -d @docs/list.json

# sessions
curl -X PUT "http://127.0.0.1:5984/chess_test/s1" -d @docs/session1.json
curl -X PUT "http://127.0.0.1:5984/chess_test/s2" -d @docs/session2.json
curl -X PUT "http://127.0.0.1:5984/chess_test/s3" -d @docs/session3.json
curl -X PUT "http://127.0.0.1:5984/chess_test/s4" -d @docs/session4.json
curl -X PUT "http://127.0.0.1:5984/chess_test/s5" -d @docs/session5.json
curl -X PUT "http://127.0.0.1:5984/chess_test/s6" -d @docs/session6.json
curl -X PUT "http://127.0.0.1:5984/chess_test/s7" -d @docs/session7.json
curl -X PUT "http://127.0.0.1:5984/chess_test/s8" -d @docs/session8.json

# players
curl -X PUT "http://127.0.0.1:5984/chess_test/sp1" -d @docs/session_player1.json
curl -X PUT "http://127.0.0.1:5984/chess_test/sp2" -d @docs/session_player2.json
curl -X PUT "http://127.0.0.1:5984/chess_test/sp3" -d @docs/session_player3.json
curl -X PUT "http://127.0.0.1:5984/chess_test/sp4" -d @docs/session_player4.json
curl -X PUT "http://127.0.0.1:5984/chess_test/sp5" -d @docs/session_player5.json
curl -X PUT "http://127.0.0.1:5984/chess_test/sp6" -d @docs/session_player6.json
curl -X PUT "http://127.0.0.1:5984/chess_test/sp7" -d @docs/session_player7.json
curl -X PUT "http://127.0.0.1:5984/chess_test/sp8" -d @docs/session_player8.json
curl -X PUT "http://127.0.0.1:5984/chess_test/sp9" -d @docs/session_player9.json
curl -X PUT "http://127.0.0.1:5984/chess_test/sp10" -d @docs/session_player10.json
