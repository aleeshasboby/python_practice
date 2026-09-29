"""
Hangman Web Server - Python HTTP Server & REST API
Zero external dependencies required. Runs directly with standard Python 3!
"""

import http.server
import json
import os
import socketserver
import sys
import urllib.parse
from typing import Any, Dict

from hangman_engine import CATEGORIES, HangmanGame

PORT = 8000
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

# Shared game session (or multi-session dictionary)
game_sessions: Dict[str, HangmanGame] = {}


def get_or_create_session(session_id: str = "default") -> HangmanGame:
    if session_id not in game_sessions:
        game = HangmanGame()
        game.new_game()
        game_sessions[session_id] = game
    return game_sessions[session_id]


class HangmanRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def _send_json(self, data: Any, status: int = 200):
        response_bytes = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Session-ID")
        self.end_headers()
        self.wfile.write(response_bytes)

    def _get_session_id(self) -> str:
        return self.headers.get("X-Session-ID", "default")

    def _read_json_body(self) -> Dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw_body = self.rfile.read(content_length).decode("utf-8")
            try:
                return json.loads(raw_body)
            except json.JSONDecodeError:
                return {}
        return {}

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Session-ID")
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)

        if parsed_url.path == "/api/categories":
            categories_info = {}
            for name, words in CATEGORIES.items():
                categories_info[name] = {
                    "count": len(words),
                    "sample": list(words.keys())[:3]
                }
            self._send_json({"categories": categories_info})
            return

        if parsed_url.path == "/api/state":
            session_id = self._get_session_id()
            game = get_or_create_session(session_id)
            self._send_json(game.get_state())
            return

        if parsed_url.path == "/api/hint":
            session_id = self._get_session_id()
            game = get_or_create_session(session_id)
            self._send_json(game.get_hint())
            return

        if parsed_url.path == "/api/new-game":
            session_id = self._get_session_id()
            game = get_or_create_session(session_id)
            self._send_json(game.new_game())
            return

        # Serve static assets (HTML, CSS, JS)
        super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        session_id = self._get_session_id()
        game = get_or_create_session(session_id)
        data = self._read_json_body()

        if parsed_url.path == "/api/new-game":
            category = data.get("category", "Original Cast")
            difficulty = data.get("difficulty", "medium")
            custom_word = data.get("custom_word", None)
            new_state = game.new_game(category=category, difficulty=difficulty, custom_word=custom_word)
            self._send_json(new_state)
            return

        if parsed_url.path == "/api/guess":
            letter = data.get("letter", "")
            state = game.guess(letter)
            self._send_json(state)
            return

        if parsed_url.path == "/api/hint":
            state = game.get_hint()
            self._send_json(state)
            return

        self._send_json({"error": "Endpoint not found"}, status=404)


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


def run_server(port: int = PORT):
    os.makedirs(STATIC_DIR, exist_ok=True)
    server_address = ("", port)
    
    # Try the given port or increment if busy
    for p in range(port, port + 20):
        try:
            httpd = ReusableTCPServer(("", p), HangmanRequestHandler)
            print(f"=====================================================")
            print(f"  Hangman Game Server is running!")
            print(f"  Play Hangman: http://localhost:{p}")
            print(f"  API Docs: http://localhost:{p}/api/categories")
            print(f"=====================================================")
            sys.stdout.flush()
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nShutting down server gracefully...")
                httpd.server_close()
            return
        except OSError as e:
            if "Address already in use" in str(e):
                continue
            raise e
    print(f"Could not bind to any port between {port} and {port+20}.")


if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else PORT
    run_server(port_arg)
