"""
WebSocket Server
Handles real-time client connections
"""

import asyncio
import json
import websockets
from websockets.server import WebSocketServerProtocol
from typing import Dict, Set
from datetime import datetime


class WebSocketServer:
    """WebSocket server for Nad Court"""
    
    def __init__(self, court):
        self.court = court
        self.clients: Dict[WebSocketServerProtocol, dict] = {}
        self.case_subscribers: Dict[str, Set[WebSocketServerProtocol]] = {}
        self.pending_arguments: Dict[str, asyncio.Queue] = {}
    
    async def start(self, host: str = "localhost", port: int = 8765):
        """Start WebSocket server"""
        async with websockets.serve(self.handle_client, host, port):
            print(f"🌐 WebSocket server started on ws://{host}:{port}")
            await asyncio.Future()  # Run forever
    
    async def handle_client(self, websocket: WebSocketServerProtocol, path: str):
        """Handle client connection"""
        client_id = id(websocket)
        self.clients[websocket] = {
            "id": client_id,
            "subscribed_cases": set(),
            "connected_at": datetime.utcnow().isoformat()
        }
        
        print(f"🔗 Client connected: {client_id}")
        
        try:
            async for message in websocket:
                await self.handle_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            await self.disconnect_client(websocket)
    
    async def handle_message(self, websocket: WebSocketServerProtocol, message: str):
        """Handle incoming message"""
        try:
            data = json.loads(message)
            action = data.get("action")
            
            if action == "join_case":
                await self.handle_join_case(websocket, data)
            elif action == "post_argument":
                await self.handle_post_argument(websocket, data)
            elif action == "request_transcript":
                await self.handle_request_transcript(websocket, data)
            else:
                await self.send_error(websocket, f"Unknown action: {action}")
                
        except json.JSONDecodeError:
            await self.send_error(websocket, "Invalid JSON")
    
    async def handle_join_case(self, websocket: WebSocketServerProtocol, data: dict):
        """Subscribe client to case updates"""
        case_id = data.get("case_id")
        
        # Add to subscribers
        if case_id not in self.case_subscribers:
            self.case_subscribers[case_id] = set()
        self.case_subscribers[case_id].add(websocket)
        
        self.clients[websocket]["subscribed_cases"].add(case_id)
        
        # Create pending arguments queue for this case
        if case_id not in self.pending_arguments:
            self.pending_arguments[case_id] = asyncio.Queue()
        
        # Send confirmation
        await self.send(websocket, {
            "event": "joined",
            "case_id": case_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        print(f"👤 Client subscribed to {case_id}")
    
    async def handle_post_argument(self, websocket: WebSocketServerProtocol, data: dict):
        """Receive argument from client/agent"""
        case_id = data.get("case_id")
        
        # Add to pending queue
        if case_id in self.pending_arguments:
            await self.pending_arguments[case_id].put(data)
            
            await self.send(websocket, {
                "event": "argument_queued",
                "case_id": case_id,
                "timestamp": datetime.utcnow().isoformat()
            })
    
    async def handle_request_transcript(self, websocket: WebSocketServerProtocol, data: dict):
        """Send case transcript to client"""
        case_id = data.get("case_id")
        case = self.court.cases.get(case_id)
        
        if case:
            await self.send(websocket, {
                "event": "transcript",
                "case_id": case_id,
                "arguments": case.arguments,
                "evaluations": case.evaluations
            })
    
    async def get_next_argument(self, case_id: str) -> dict:
        """Get next pending argument for a case"""
        if case_id in self.pending_arguments:
            try:
                return await asyncio.wait_for(
                    self.pending_arguments[case_id].get(),
                    timeout=30.0
                )
            except asyncio.TimeoutError:
                return None
        return None
    
    async def broadcast(self, case_id: str, message: dict):
        """Broadcast message to all subscribers of a case"""
        if case_id not in self.case_subscribers:
            return
        
        subscribers = list(self.case_subscribers[case_id])
        
        for websocket in subscribers:
            try:
                await self.send(websocket, message)
            except:
                # Client disconnected
                self.case_subscribers[case_id].discard(websocket)
    
    async def send(self, websocket: WebSocketServerProtocol, message: dict):
        """Send message to a client"""
        await websocket.send(json.dumps(message))
    
    async def send_error(self, websocket: WebSocketServerProtocol, error: str):
        """Send error message"""
        await self.send(websocket, {
            "event": "error",
            "error": error,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def disconnect_client(self, websocket: WebSocketServerProtocol):
        """Clean up disconnected client"""
        if websocket in self.clients:
            # Remove from all subscriptions
            for case_id in self.clients[websocket]["subscribed_cases"]:
                if case_id in self.case_subscribers:
                    self.case_subscribers[case_id].discard(websocket)
            
            del self.clients[websocket]
            print(f"👋 Client disconnected")
