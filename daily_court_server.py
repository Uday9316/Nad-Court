import asyncio
import websockets
import json
from datetime import datetime, timedelta
from typing import Dict, Set, Optional
import logging
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DailyCourtServer:
    """
    Nad Court - One case per day, real-time WebSocket broadcasts
    """
    
    def __init__(self):
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.current_case: Optional[Dict] = None
        self.case_state = {
            'status': 'waiting',  # waiting, active, ended
            'case_id': None,
            'case_time': None,
            'round': 1,
            'plaintiff_health': 100,
            'defendant_health': 100,
            'messages': [],
            'current_arg_index': 0,
            'verdict_shown': False,
            'next_case_time': None
        }
        self.is_case_running = False
        self.daily_case_time = 14, 0  # 2:00 PM UTC daily
        
        # Case schedule for the week
        self.upcoming_cases = [
            {
                'id': 'BEEF-2025-0212',
                'date': '2026-02-12',
                'time': '14:00 UTC',
                'plaintiff': 'Bitlover082',
                'defendant': '0xCoha',
                'type': 'Beef Resolution',
                'summary': 'Dispute over OG role assignment and engagement farming allegations'
            },
            {
                'id': 'ROLE-2025-0213',
                'date': '2026-02-13',
                'time': '14:00 UTC',
                'plaintiff': 'CryptoKing',
                'defendant': 'DeFiQueen',
                'type': 'Role Dispute',
                'summary': 'Conflict over moderator privileges and selective enforcement'
            },
            {
                'id': 'ART-2025-0214',
                'date': '2026-02-14',
                'time': '14:00 UTC',
                'plaintiff': 'ArtCollector',
                'defendant': 'MemeMaker',
                'type': 'Art Ownership',
                'summary': 'NFT ownership dispute and unauthorized derivative works'
            }
        ]
        
    def get_todays_case(self) -> Optional[Dict]:
        """Get today's scheduled case"""
        today = datetime.now().strftime('%Y-%m-%d')
        for case in self.upcoming_cases:
            if case['date'] == today:
                return case
        return self.upcoming_cases[0]  # Default to first case for demo
    
    def get_next_case_time(self) -> datetime:
        """Get next scheduled case time"""
        now = datetime.now()
        hour, minute = self.daily_case_time
        
        # Today's case time
        next_time = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        # If today's case already passed, schedule for tomorrow
        if next_time < now:
            next_time += timedelta(days=1)
            
        return next_time
    
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
    
    async def broadcast_countdown(self):
        """Broadcast countdown to next case"""
        while self.case_state['status'] == 'waiting':
            next_time = self.get_next_case_time()
            now = datetime.now()
            
            if now >= next_time:
                # Time to start case
                await self.start_daily_case()
                return
            
            # Calculate time remaining
            time_diff = next_time - now
            hours, remainder = divmod(time_diff.seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            
            countdown_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            
            await self.broadcast({
                'type': 'countdown',
                'data': {
                    'next_case_time': next_time.isoformat(),
                    'countdown': countdown_str,
                    'hours': hours,
                    'minutes': minutes,
                    'seconds': seconds
                }
            })
            
            await asyncio.sleep(1)
    
    async def start_daily_case(self):
        """Start today's scheduled case"""
        case = self.get_todays_case()
        if not case:
            logger.error("No case scheduled for today")
            return
        
        self.current_case = case
        self.case_state = {
            'status': 'active',
            'case_id': case['id'],
            'case_time': datetime.now().isoformat(),
            'round': 1,
            'plaintiff_health': 100,
            'defendant_health': 100,
            'messages': [{
                'id': 1,
                'author': 'COURT',
                'time': datetime.now().strftime('%H:%M'),
                'content': f"📅 DAILY CASE STARTED\nCase: {case['id']}\nType: {case['type']}\nPlaintiff: {case['plaintiff']} vs Defendant: {case['defendant']}\n\nSummary: {case['summary']}",
                'role': 'system',
                'type': 'round'
            }],
            'current_arg_index': 0,
            'verdict_shown': False,
            'next_case_time': None
        }
        
        logger.info(f"🚀 Starting daily case: {case['id']}")
        
        await self.broadcast({
            'type': 'case_started',
            'data': self.case_state
        })
        
        # Start the trial
        self.is_case_running = True
        asyncio.create_task(self.run_trial())
    
    async def run_trial(self):
        """Run the trial in real-time"""
        case = self.current_case
        if not case:
            return
        
        logger.info(f"⚖️ Trial started for {case['id']}")
        
        # Arguments - generated in real-time during the case
        arguments_data = [
            # Round 1 - Opening Arguments
            {'side': 'plaintiff', 'content': self.generate_argument(case, 'plaintiff', 1, 1), 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': self.generate_argument(case, 'defendant', 1, 1), 'author': 'NadCourt-Defender'},
            {'side': 'plaintiff', 'content': self.generate_argument(case, 'plaintiff', 1, 2), 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': self.generate_argument(case, 'defendant', 1, 2), 'author': 'NadCourt-Defender'},
            
            # Round 2 - Rebuttals
            {'side': 'plaintiff', 'content': self.generate_argument(case, 'plaintiff', 2, 1), 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': self.generate_argument(case, 'defendant', 2, 1), 'author': 'NadCourt-Defender'},
            {'side': 'plaintiff', 'content': self.generate_argument(case, 'plaintiff', 2, 2), 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': self.generate_argument(case, 'defendant', 2, 2), 'author': 'NadCourt-Defender'},
            
            # Round 3 - Closing Arguments
            {'side': 'plaintiff', 'content': self.generate_argument(case, 'plaintiff', 3, 1), 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': self.generate_argument(case, 'defendant', 3, 1), 'author': 'NadCourt-Defender'},
            {'side': 'plaintiff', 'content': self.generate_argument(case, 'plaintiff', 3, 2), 'author': 'NadCourt-Advocate'},
            {'side': 'defendant', 'content': self.generate_argument(case, 'defendant', 3, 2), 'author': 'NadCourt-Defender'},
        ]
        
        evaluations_data = [
            {'judge': 'PortDev', 'round': 1, 'reasoning': self.generate_evaluation('PortDev', case), 'p_score': random.randint(72, 88), 'd_score': random.randint(60, 78)},
            {'judge': 'MikeWeb', 'round': 1, 'reasoning': self.generate_evaluation('MikeWeb', case), 'p_score': random.randint(70, 85), 'd_score': random.randint(62, 80)},
            {'judge': 'Keone', 'round': 2, 'reasoning': self.generate_evaluation('Keone', case), 'p_score': random.randint(73, 87), 'd_score': random.randint(61, 79)},
            {'judge': 'James', 'round': 2, 'reasoning': self.generate_evaluation('James', case), 'p_score': random.randint(71, 86), 'd_score': random.randint(63, 81)},
            {'judge': 'Harpal', 'round': 3, 'reasoning': self.generate_evaluation('Harpal', case), 'p_score': random.randint(74, 89), 'd_score': random.randint(60, 77)},
            {'judge': 'Anago', 'round': 3, 'reasoning': self.generate_evaluation('Anago', case), 'p_score': random.randint(75, 90), 'd_score': random.randint(59, 76)},
        ]
        
        arg_index = 0
        eval_index = 0
        round_num = 1
        
        # Post arguments every 5 minutes (12 arguments = 60 minutes)
        ARG_INTERVAL = 300  # 5 minutes in seconds
        
        while self.case_state['status'] == 'active' and arg_index < len(arguments_data):
            # Check for round transition
            if arg_index > 0 and arg_index % 4 == 0:
                round_num += 1
                if round_num > 3:
                    break
                
                self.case_state['round'] = round_num
                await self.broadcast({
                    'type': 'round_change',
                    'data': {'round': round_num}
                })
                
                await self.add_message({
                    'author': 'COURT',
                    'content': f'═══════════════════ ROUND {round_num} ═══════════════════',
                    'role': 'system',
                    'type': 'round'
                })
                
                await asyncio.sleep(5)
            
            # Post argument
            arg = arguments_data[arg_index]
            await self.add_message({
                'author': arg['author'],
                'content': arg['content'],
                'role': arg['side'],
                'type': 'argument'
            })
            
            logger.info(f"Posted argument {arg_index + 1}/12 for {case['id']}")
            
            # Post on-chain confirmation
            await asyncio.sleep(2)
            tx_hash = self.generate_tx_hash()
            await self.add_message({
                'author': '⛓️ BLOCKCHAIN',
                'content': f'Argument recorded on Monad. TX: {tx_hash[:20]}...',
                'role': 'system',
                'type': 'chain'
            })
            
            # Update health
            if arg['side'] == 'plaintiff':
                self.case_state['plaintiff_health'] = min(100, self.case_state['plaintiff_health'] + random.randint(1, 3))
            else:
                self.case_state['defendant_health'] = min(100, self.case_state['defendant_health'] + random.randint(1, 3))
            
            await self.broadcast_health()
            
            arg_index += 1
            
            # Post judge evaluation every 2 arguments
            if arg_index % 2 == 0 and eval_index < len(evaluations_data):
                await asyncio.sleep(3)
                
                eval_data = evaluations_data[eval_index]
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
                            'logic': random.randint(65, 95),
                            'evidence': random.randint(65, 95),
                            'rebuttal': random.randint(65, 95),
                            'clarity': random.randint(65, 95),
                            'total': eval_data['p_score']
                        },
                        'defendant': {
                            'logic': random.randint(65, 95),
                            'evidence': random.randint(65, 95),
                            'rebuttal': random.randint(65, 95),
                            'clarity': random.randint(65, 95),
                            'total': eval_data['d_score']
                        }
                    }
                })
                
                await self.broadcast_health()
                eval_index += 1
            
            # Wait before next argument (5 minutes)
            await asyncio.sleep(ARG_INTERVAL)
        
        # End case with verdict
        await self.end_case()
    
    def generate_argument(self, case: Dict, side: str, round_num: int, arg_num: int) -> str:
        """Generate argument content based on case type"""
        templates = {
            'plaintiff': [
                f"Round {round_num}: My client presents irrefutable evidence of {random.randint(20, 80)} protocol violations by the defendant.",
                f"The defendant's on-chain activity shows {random.randint(10, 50)} suspicious transactions linked to banned addresses.",
                f"Community testimony from {random.randint(15, 40)} verified members supports our claims.",
                f"Blockchain forensics reveal {random.randint(5, 25)} instances of coordinated manipulation.",
                f"The economic damage amounts to {random.randint(500, 5000)} $JUSTICE tokens.",
                f"Pattern analysis confirms this is not the defendant's first violation."
            ],
            'defendant': [
                f"Round {round_num}: The plaintiff's allegations lack substance. {random.randint(100, 300)} community members vouch for my integrity.",
                f"All transactions were legitimate trades. Here's {random.randint(50, 150)} receipts proving proper conduct.",
                f"I've been an active contributor for {random.randint(12, 36)} months with zero prior violations.",
                f"The evidence presented is circumstantial. I have {random.randint(20, 50)} character witnesses.",
                f"This case mirrors precedent #{random.randint(1000, 9999)} where the defense prevailed.",
                f"My reputation score of {random.randint(85, 98)} speaks for itself."
            ]
        }
        return random.choice(templates[side])
    
    def generate_evaluation(self, judge: str, case: Dict) -> str:
        """Generate judge evaluation reasoning"""
        evaluations = {
            'PortDev': ['Technical evidence is compelling.', 'On-chain data shows clear patterns.', 'Code analysis supports this view.'],
            'MikeWeb': ['Community sentiment is divided.', 'Reputation metrics favor one side.', 'Historical context matters here.'],
            'Keone': ['Transaction analysis is revealing.', 'Data supports the plaintiff.', 'Blockchain evidence is strong.'],
            'James': ['Precedent suggests caution.', 'Rules are clear on this matter.', 'Historical cases guide this decision.'],
            'Harpal': ['Contribution quality is key.', 'Merit-based analysis complete.', 'Impact on community considered.'],
            'Anago': ['Protocol compliance verified.', 'Rules have been broken.', 'Standards must be upheld.']
        }
        return random.choice(evaluations.get(judge, ['Evidence reviewed.', 'Analysis complete.']))
    
    def generate_tx_hash(self) -> str:
        """Generate fake transaction hash for demo"""
        return '0x' + ''.join(random.choices('0123456789abcdef', k=64))
    
    async def add_message(self, message_data: dict):
        """Add message and broadcast"""
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
        """End case with OpenClaw verdict"""
        if self.case_state['verdict_shown']:
            return
        
        self.case_state['verdict_shown'] = True
        
        p_health = self.case_state['plaintiff_health']
        d_health = self.case_state['defendant_health']
        
        winner = 'Plaintiff' if p_health > d_health else 'Defendant'
        winner_name = self.current_case['plaintiff'] if winner == 'Plaintiff' else self.current_case['defendant']
        loser_name = self.current_case['defendant'] if winner == 'Plaintiff' else self.current_case['plaintiff']
        
        # Determine punishment
        if winner == 'Plaintiff':
            if p_health > 85:
                punishment = '🚫 BAN - 30 days'
            elif p_health > 70:
                punishment = '🔒 ISOLATION - 14 days'
            else:
                punishment = '⚠️ WARNING - Official notice'
        else:
            punishment = '✅ NO ACTION - Defendant cleared'
        
        # Final deliberation
        await self.add_message({
            'author': 'COURT',
            'content': '══════════════════ FINAL DELIBERATION ══════════════════',
            'role': 'system',
            'type': 'round'
        })
        
        await asyncio.sleep(5)
        
        # OpenClaw verdict
        await self.add_message({
            'author': '🧠 OpenClaw Judgment',
            'content': f'🏆 {winner.upper()} WINS! After analyzing 3 rounds of evidence and arguments, OpenClaw has delivered final judgment. {winner_name} has proven their case against {loser_name}.\n\nFinal Scores: Plaintiff {p_health} | Defendant {d_health}\n\nPunishment: {punishment}\n\nVerdict recorded on-chain at block #{random.randint(1000000, 9999999)}.',
            'role': 'system',
            'type': 'verdict'
        })
        
        self.case_state['status'] = 'ended'
        
        await self.broadcast({
            'type': 'case_ended',
            'data': {
                'winner': winner,
                'winner_name': winner_name,
                'punishment': punishment,
                'plaintiff_score': p_health,
                'defendant_score': d_health
            }
        })
        
        logger.info(f"Case ended. Winner: {winner}")
        
        # Schedule next case
        await self.schedule_next_case()
    
    async def schedule_next_case(self):
        """Schedule next day's case"""
        next_time = self.get_next_case_time()
        self.case_state['next_case_time'] = next_time.isoformat()
        
        logger.info(f"Next case scheduled for: {next_time}")
        
        # Wait until next case time
        await self.broadcast_countdown()
    
    async def handle_client(self, websocket: websockets.WebSocketServerProtocol, path: str):
        """Handle WebSocket client"""
        await self.register(websocket)
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    
                    if data.get('type') == 'ping':
                        await websocket.send(json.dumps({'type': 'pong'}))
                    
                    elif data.get('type') == 'get_upcoming':
                        await websocket.send(json.dumps({
                            'type': 'upcoming_cases',
                            'data': self.upcoming_cases
                        }))
                        
                except json.JSONDecodeError:
                    pass
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            await self.unregister(websocket)

# Global server
server = DailyCourtServer()

async def main():
    """Start WebSocket server"""
    logger.info("=" * 60)
    logger.info("NAD COURT - Daily Case Server")
    logger.info("One case per day, real-time WebSocket broadcasts")
    logger.info("=" * 60)
    logger.info("WebSocket: ws://localhost:8765")
    
    # Check if we should start case now or wait
    next_case = server.get_next_case_time()
    now = datetime.now()
    
    if now >= next_case:
        # Start case immediately
        logger.info("Starting case immediately...")
        asyncio.create_task(server.start_daily_case())
    else:
        # Wait for scheduled time
        logger.info(f"Next case at: {next_case}")
        asyncio.create_task(server.broadcast_countdown())
    
    async with websockets.serve(server.handle_client, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())