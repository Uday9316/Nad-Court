#!/usr/bin/env python3
import http.server
import socketserver
import json
import traceback

PORT = 3002

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[REQUEST] {format % args}")
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        try:
            if self.path == '/api/health':
                self.send_json({'status': 'ok', 'service': 'Agent Court'})
            elif self.path == '/api/judges':
                self.send_json({'judges': [
                    {'name': 'PortDev', 'catchphrase': 'Code does not lie.'},
                    {'name': 'MikeWeb', 'catchphrase': 'Community vibe check.'},
                    {'name': 'Keone', 'catchphrase': 'Show me the transactions.'},
                    {'name': 'James', 'catchphrase': 'Precedent matters here.'},
                    {'name': 'Harpal', 'catchphrase': 'Contribution quality over quantity.'},
                    {'name': 'Anago', 'catchphrase': 'Protocol adherence is clear.'}
                ]})
            else:
                self.send_error(404)
        except Exception as e:
            print(f"GET Error: {e}")
            self.send_error(500)
    
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body)
            except:
                self.send_error(400, 'Invalid JSON')
                return
            
            if self.path == '/api/generate-argument':
                role = data.get('role', 'plaintiff')
                round_num = data.get('round', 1)
                
                args = [
                    'My opponent claims independent discovery but blockchain proves my client was first. Seventeen witnesses confirm. This is not coincidence—it is theft.',
                    'The defense says their timestamps are verified—from a node THEY control. My opponent accessed my private repo before going public. They are lying to this Court.',
                    'My opponent attacks my character? Classic deflection. I have three years of contributions; they have five ownership disputes. This is their pattern.'
                ]
                
                self.send_json({
                    'success': True,
                    'agent': 'JusticeBot-Alpha' if role == 'plaintiff' else 'GuardianBot-Omega',
                    'role': role,
                    'argument': args[min(round_num-1, 2)],
                    'round': round_num,
                    'source': 'mock'
                })
            elif self.path == '/api/judge-evaluation':
                self.send_json({
                    'success': True,
                    'judge': data.get('judge', 'Judge'),
                    'evaluation': {
                        'plaintiff': {'logic': 85, 'evidence': 90, 'rebuttal': 80, 'clarity': 88},
                        'defendant': {'logic': 70, 'evidence': 65, 'rebuttal': 75, 'clarity': 72},
                        'winner': 'plaintiff'
                    }
                })
            else:
                self.send_error(404)
        except Exception as e:
            print(f"POST Error: {e}")
            traceback.print_exc()
            self.send_json({'success': False, 'error': str(e)}, 500)
    
    def send_json(self, data, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

if __name__ == '__main__':
    print(f'Starting server on port {PORT}')
    with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
        print(f'Server running on port {PORT}')
        httpd.serve_forever()
