import asyncio
import websockets
import json
from datetime import datetime
from typing import Dict, Set
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CourtWebSocketServer:
    def __init__(self):
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.current_case = None
        self.case_state = {
            'status': 'waiting',  # waiting, active, ended
            'round': 1,
            'plaintiff_health': 100,
            'defendant_health': 100,
            'messages': [],
            'current_arg_index': 0,
            'verdict_shown': False
        }
        self.is_running = False
        
    async def register(self, websocket: websockets.WebSocketServerProtocol):
        """Register new client"""
        self.clients.add(websocket)
        logger.info(f"Client connected. Total: {len(self.clients)}")
        
        # Send current state to new client
        await self.send_state(websocket)
        
    async def unregister(self, websocket: websockets.WebSocketServerProtocol):
        """Unregister client"""
        self.clients.discard(websocket)
        logger.info(f"Client disconnected. Total: {len(self.clients)}")
        
    async def send_state(self, websocket: websockets.WebSocketServerProtocol):
        """Send current case state to a client"""
        try:
            await websocket.send(json.dumps({
                'type': 'state',
                'data': self.case_state
            }))
        except:
            pass
            
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        if not self.clients:
            return
            
        message_json = json.dumps(message)
        disconnected = set()
        
        for client in self.clients:
            try:
                await client.send(message_json)
            except:
                disconnected.add(client)
                
        # Clean up disconnected clients
        for client in disconnected:
            self.clients.discard(client)
            
    async def start_case(self, case_data: dict):
        """Start a new case"""
        self.current_case = case_data
        self.case_state = {
            'status': 'active',
            'round': 1,
            'plaintiff_health': 100,
            'defendant_health': 100,
            'messages': [{
                'id': 1,
                'author': 'COURT',
                'time': datetime.now().strftime('%H:%M'),
                'content': f"══════════════════ CASE STARTED ══════════════════\nCase: {case_data.get('id', 'BEEF-4760')}\nPlaintiff: {case_data.get('plaintiff', 'Bitlover082')} vs Defendant: {case_data.get('defendant', '0xCoha')}",
                'role': 'system',
                'type': 'round'
            }],
            'current_arg_index': 0,
            'verdict_shown': False
        }
        
        await self.broadcast({
            'type': 'case_started',
            'data': self.case_state
        })
        
        # Start the trial simulation
        if not self.is_running:
            self.is_running = True
            asyncio.create_task(self.run_trial())
            
    async def run_trial(self):
        """Run the trial simulation"""
        logger.info("Starting trial simulation")
        
        # Arguments data (would come from Python backend in production)
        arguments = [
            # Round 1
            {'side': 'plaintiff', 'content': 'My client presents evidence of 47 protocol violations. Blockchain analysis reveals coordinated harassment.', 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': 'The plaintiff\'s claims are baseless. I have 150 community members vouching for my character.', 'author': 'NadCourt-Defender'},
            {'side': 'plaintiff', 'content': 'The defendant\'s wallet shows 63 suspicious transactions in a 7-minute window. This is not normal.', 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': 'Those were legitimate trades during market volatility. Here\'s the DEX routing proof.', 'author': 'NadCourt-Defender'},
            # Round 2
            {'side': 'plaintiff', 'content': 'Community testimony from 18 members corroborates our claims of systematic abuse.', 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': 'I was participating in a community event at the time. 12 witnesses can confirm.', 'author': 'NadCourt-Defender'},
            {'side': 'plaintiff', 'content': 'Smart contract analysis shows 23 unauthorized function calls. Bot behavior confirmed.', 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': 'The interactions were authorized through the official frontend. No foul play.', 'author': 'NadCourt-Defender'},
            # Round 3
            {'side': 'plaintiff', 'content': 'Cross-referencing reveals identical patterns. The defendant is a repeat offender.', 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': 'I\'ve contributed 35 technical proposals. This is a merit-based attack.', 'author': 'NadCourt-Defender'},
            {'side': 'plaintiff', 'content': 'Final evidence: The defendant\'s funds trace to a sanctioned address.', 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': 'Closing statement: No rules broken. Community norms support my position.', 'author': 'NadCourt-Defender'},
        ]
        
        evaluations = [
            # Round 1
            {'judge': 'PortDev', 'reasoning': 'Technical evidence is solid. The on-chain data shows clear patterns.', 'p_score': 78, 'd_score': 65},
            {'judge': 'MikeWeb', 'reasoning': 'Community sentiment favors plaintiff. Defense needs stronger character evidence.', 'p_score': 72, 'd_score': 68},
            # Round 2
            {'judge': 'Keone', 'data analysis reveals concerning patterns.', 'p_score': 75, 'd_score': 71},
            {'judge': 'James', 'reasoning': 'Precedent suggests documented evidence carries more weight.', 'p_score': 76, 'd_score': 64},
            # Round 3
            {'judge': 'Harpal', 'reasoning': 'Contribution quality analysis favors plaintiff\'s evidence.', 'p_score': 79, 'd_score': 66},
            {'judge': 'Anago', 'reasoning': 'Protocol compliance check: violations confirmed.', 'p_score': 81, 'd_score': 62},
        ]
        
        arg_index = 0
        eval_index = 0
        round_num = 1
        
        while self.case_state['status'] == 'active' and arg_index < len(arguments):
            # Check if we should move to next round
            if arg_index > 0 and arg_index % 4 == 0:
                round_num += 1
                if round_num > 3:
                    break
                    
                self.case_state['round'] = round_num
                await self.broadcast({
                    'type': 'round_change',
                    'data': {'round': round_num}
                })
                
                # Add round separator
                await self.add_message({
                    'author': 'COURT',
                    'content': f'═══════════════════ ROUND {round_num} ═══════════════════',
                    'role': 'system',
                    'type': 'round'
                })
                
                await asyncio.sleep(3)
            
            # Send argument
            arg = arguments[arg_index]
            await self.add_message({
                'author': arg['author'],
                'content': arg['content'],
                'role': arg['side'],
                'type': 'argument'
            })
            
            # Update health based on argument strength (simulated)
            if arg['side'] == 'plaintiff':
                self.case_state['plaintiff_health'] = min(100, self.case_state['plaintiff_health'] + random.randint(0, 3))
            else:
                self.case_state['defendant_health'] = min(100, self.case_state['defendant_health'] + random.randint(0, 3))
            
            await self.broadcast_health()
            
            arg_index += 1
            
            # Every 2 arguments, add a judge evaluation
            if arg_index % 2 == 0 and eval_index < len(evaluations):
                await asyncio.sleep(2)
                
                eval_data = evaluations[eval_index]
                damage = abs(eval_data['p_score'] - eval_data['d_score']) // 3
                
                if eval_data['p_score'] > eval_data['d_score']:
                    self.case_state['defendant_health'] = max(10, self.case_state['defendant_health'] - damage)
                else:
                    self.case_state['plaintiff_health'] = max(10, self.case_state['plaintiff_health'] - damage)
                
                await self.add_message({
                    'author': f"{eval_data['judge']} (Judge)",
                    'content': f"{eval_data['reasoning']} [P:{eval_data['p_score']} vs D:{eval_data['d_score']}]",
                    'role': 'judge',
                    'type': 'evaluation',
                    'criteria': {
                        'plaintiff': {
                            'logic': random.randint(60, 95),
                            'evidence': random.randint(60, 95),
                            'rebuttal': random.randint(60, 95),
                            'clarity': random.randint(60, 95),
                            'total': eval_data['p_score']
                        },
                        'defendant': {
                            'logic': random.randint(60, 95),
                            'evidence': random.randint(60, 95),
                            'rebuttal': random.randint(60, 95),
                            'clarity': random.randint(60, 95),
                            'total': eval_data['d_score']
                        }
                    }
                })
                
                await self.broadcast_health()
                eval_index += 1
            
            await asyncio.sleep(6)  # Wait between arguments
        
        # End case with final verdict
        await self.end_case()
        
    async def add_message(self, message_data: dict):
        """Add message to state and broadcast"""
        message = {
            'id': len(self.case_state['messages']) + 1,
            'time': datetime.now().strftime('%H:%M'),
            **message_data
        }
        
        self.case_state['messages'].append(message)
        
        await self.broadcast({
            'type': 'new_message',
            'data': message
        })
        
    async def broadcast_health(self):
        """Broadcast health update"""
        await self.broadcast({
            'type': 'health_update',
            'data': {
                'plaintiff': self.case_state['plaintiff_health'],
                'defendant': self.case_state['defendant_health']
            }
        })
        
    async def end_case(self):
        """End the case with final verdict"""
        if self.case_state['verdict_shown']:
            return
            
        self.case_state['verdict_shown'] = True
        
        # Determine winner
        p_health = self.case_state['plaintiff_health']
        d_health = self.case_state['defendant_health']
        
        if p_health > d_health:
            winner = 'Plaintiff'
            winner_name = 'Bitlover082'
            loser_name = '0xCoha'
        else:
            winner = 'Defendant'
            winner_name = '0xCoha'
            loser_name = 'Bitlover082'
        
        # Add final deliberation
        await self.add_message({
            'author': 'COURT',
            'content': '══════════════════ FINAL DELIBERATION ══════════════════',
            'role': 'system',
            'type': 'round'
        })
        
        await asyncio.sleep(3)
        
        # Add OpenClaw judgment
        await self.add_message({
            'author': '🧠 OpenClaw Judgment',
            'content': f'🏆 {winner.upper()} WINS! After analyzing 3 rounds of evidence and arguments, OpenClaw has delivered final judgment. {winner_name} has proven their case against {loser_name}. Final credibility scores - Plaintiff: {p_health} | Defendant: {d_health}. Punishment will be executed on-chain.',
            'role': 'system',
            'type': 'verdict'
        })
        
        self.case_state['status'] = 'ended'
        
        await self.broadcast({
            'type': 'case_ended',
            'data': {
                'winner': winner,
                'plaintiff_score': p_health,
                'defendant_score': d_health
            }
        })
        
        logger.info(f"Case ended. Winner: {winner}")
        
        # Reset after 30 seconds for next visitors
        await asyncio.sleep(30)
        await self.reset_case()
        
    async def reset_case(self):
        """Reset case for next round of visitors"""
        logger.info("Resetting case for next visitors")
        
        self.case_state = {
            'status': 'waiting',
            'round': 1,
            'plaintiff_health': 100,
            'defendant_health': 100,
            'messages': [],
            'current_arg_index': 0,
            'verdict_shown': False
        }
        
        self.is_running = False
        
        await self.broadcast({
            'type': 'case_reset',
            'data': self.case_state
        })
        
        # Auto-start new case after 5 seconds
        await asyncio.sleep(5)
        await self.start_case({
            'id': 'BEEF-4760',
            'plaintiff': 'Bitlover082',
            'defendant': '0xCoha'
        })
        
    async def handle_client(self, websocket: websockets.WebSocketServerProtocol, path: str):
        """Handle WebSocket client connection"""
        await self.register(websocket)
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    
                    if data.get('type') == 'start_case':
                        if self.case_state['status'] == 'waiting':
                            await self.start_case(data.get('case_data', {}))
                    
                    elif data.get('type') == 'ping':
                        await websocket.send(json.dumps({'type': 'pong'}))
                        
                except json.JSONDecodeError:
                    pass
                    
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            await self.unregister(websocket)

# Global server instance
server = CourtWebSocketServer()

async def main():
    """Start WebSocket server"""
    logger.info("Starting Court WebSocket Server on ws://localhost:8765")
    
    async with websockets.serve(server.handle_client, "localhost", 8765):
        # Auto-start first case after 10 seconds
        await asyncio.sleep(10)
        if server.case_state['status'] == 'waiting':
            await server.start_case({
                'id': 'BEEF-4760',
                'plaintiff': 'Bitlover082',
                'defendant': '0xCoha'
            })
        
        # Keep server running
        await asyncio.Future()

if __name__ == "__main__":
    import random
    asyncio.run(main())