from fastapi import WebSocket
from typing import Dict, List
import json


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.machine_subscribers: Dict[str, List[str]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"Client {client_id} connected. Total: {len(self.active_connections)}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        # Remove from machine subscriptions
        for machine_id, subscribers in self.machine_subscribers.items():
            if client_id in subscribers:
                subscribers.remove(client_id)
        print(f"Client {client_id} disconnected. Total: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

    async def send_json_message(self, data: dict, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(data)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

    async def broadcast_json(self, data: dict):
        message = json.dumps(data)
        for connection in self.active_connections.values():
            await connection.send_text(message)

    def subscribe_to_machine(self, client_id: str, machine_id: str):
        if machine_id not in self.machine_subscribers:
            self.machine_subscribers[machine_id] = []
        if client_id not in self.machine_subscribers[machine_id]:
            self.machine_subscribers[machine_id].append(client_id)

    def unsubscribe_from_machine(self, client_id: str, machine_id: str):
        if machine_id in self.machine_subscribers and client_id in self.machine_subscribers[machine_id]:
            self.machine_subscribers[machine_id].remove(client_id)

    async def send_to_machine_subscribers(self, machine_id: str, data: dict):
        if machine_id in self.machine_subscribers:
            for client_id in self.machine_subscribers[machine_id]:
                await self.send_json_message(data, client_id)
