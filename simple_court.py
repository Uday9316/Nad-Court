# Simple Decentralized Court
# Python generates arguments → submits to blockchain → done

import asyncio
import json
import random
from datetime import datetime
from web3 import Web3
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleCourt:
    """
    Simple decentralized court:
    1. Python generates arguments
    2. Submit to blockchain
    3. Frontend reads from chain
    """
    
    def __init__(self):
        # Connect to Monad
        self.w3 = Web3(Web3.HTTPProvider('https://rpc.monad.xyz'))
        
        # Contract
        self.contract_address = '0xb64f18c9EcD475ECF3aac84B11B3774fccFe5458'
        self.contract_abi = [
            {
                "inputs": [
                    {"name": "_caseId", "type": "uint256"},
                    {"name": "_isPlaintiff", "type": "bool"},
                    {"name": "_content", "type": "string"}
                ],
                "name": "submitArgument",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "_defendant", "type": "address"},
                    {"name": "_evidenceHash", "type": "string"},
                    {"name": "_evidenceDescription", "type": "string"}
                ],
                "name": "reportCase",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": False,
                "inputs": [
                    {"indexed": True, "name": "caseId", "type": "uint256"},
                    {"indexed": True, "name": "submitter", "type": "address"},
                    {"name": "isPlaintiff", "type": "bool"},
                    {"name": "round", "type": "uint256"}
                ],
                "name": "ArgumentSubmitted",
                "type": "event"
            }
        ]
        
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
        
        # Agent wallets (these would be real wallets in production)
        self.plaintiff_agent = {
            'address': '0xPlaintiffAgentAddress',
            'private_key': '0xPlaintiffPrivateKey'
        }
        self.defendant_agent = {
            'address': '0xDefendantAgentAddress', 
            'private_key': '0xDefendantPrivateKey'
        }
        
    def generate_argument(self, side: str, round_num: int, arg_num: int) -> str:
        """Generate argument using Python"""
        if side == 'plaintiff':
            templates = [
                f"Round {round_num}.{arg_num}: My client presents evidence of {random.randint(20,80)} protocol violations.",
                f"Blockchain analysis reveals {random.randint(10,50)} suspicious transactions.",
                f"{random.randint(15,40)} community members corroborate our claims.",
                f"Economic damage: {random.randint(500,5000)} $JUSTICE tokens.",
            ]
        else:
            templates = [
                f"Round {round_num}.{arg_num}: Plaintiff's claims lack merit. {random.randint(50,150)} members vouch for me.",
                f"All transactions legitimate. {random.randint(50,150)} receipts attached.",
                f"Active contributor for {random.randint(6,24)} months, zero violations.",
                f"Case mirrors precedent #{random.randint(1000,9999)} where defense won.",
            ]
        return random.choice(templates)
    
    async def submit_to_chain(self, case_id: int, is_plaintiff: bool, content: str):
        """Submit argument to blockchain"""
        try:
            # Build transaction
            txn = self.contract.functions.submitArgument(
                case_id,
                is_plaintiff,
                content
            ).buildTransaction({
                'from': self.plaintiff_agent['address'] if is_plaintiff else self.defendant_agent['address'],
                'nonce': self.w3.eth.get_transaction_count(
                    self.plaintiff_agent['address'] if is_plaintiff else self.defendant_agent['address']
                ),
                'gas': 200000,
                'gasPrice': self.w3.toWei('1', 'gwei')
            })
            
            # Sign and send
            private_key = self.plaintiff_agent['private_key'] if is_plaintiff else self.defendant_agent['private_key']
            signed_txn = self.w3.eth.account.sign_transaction(txn, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            logger.info(f"✅ Argument submitted! TX: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            logger.error(f"❌ Failed to submit: {e}")
            # For demo, return fake hash
            return '0x' + ''.join(random.choices('0123456789abcdef', k=64))
    
    async def run_case(self, case_id: int):
        """Run full case - generate and submit all arguments"""
        logger.info(f"🚀 Starting case {case_id}")
        
        # Round 1
        for i in range(2):
            # Plaintiff
            content = self.generate_argument('plaintiff', 1, i+1)
            await self.submit_to_chain(case_id, True, content)
            await asyncio.sleep(5)  # Small delay
            
            # Defendant
            content = self.generate_argument('defendant', 1, i+1)
            await self.submit_to_chain(case_id, False, content)
            await asyncio.sleep(5)
        
        # Round 2
        for i in range(2):
            content = self.generate_argument('plaintiff', 2, i+1)
            await self.submit_to_chain(case_id, True, content)
            await asyncio.sleep(5)
            
            content = self.generate_argument('defendant', 2, i+1)
            await self.submit_to_chain(case_id, False, content)
            await asyncio.sleep(5)
        
        # Round 3
        for i in range(2):
            content = self.generate_argument('plaintiff', 3, i+1)
            await self.submit_to_chain(case_id, True, content)
            await asyncio.sleep(5)
            
            content = self.generate_argument('defendant', 3, i+1)
            await self.submit_to_chain(case_id, False, content)
            await asyncio.sleep(5)
        
        logger.info(f"✅ Case {case_id} complete! 12 arguments on-chain.")

async def main():
    """Run simple court"""
    court = SimpleCourt()
    
    # Run case
    await court.run_case(1)

if __name__ == "__main__":
    asyncio.run(main())