"""
Ping service to keep the backend active on Render.
Sends periodic health checks to prevent the service from going idle.
"""

import asyncio
import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Global variable to store the ping task
ping_task: Optional[asyncio.Task] = None

async def ping_backend(url: str, interval: int = 300) -> None:
    """
    Ping the backend service periodically to keep it active.
    
    Args:
        url: The backend URL to ping
        interval: Time interval between pings in seconds (default: 5 minutes)
    """
    await asyncio.sleep(15)  # Add a 15-second delay to allow the server to start

    while True:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{url}/health", timeout=10.0)
                if response.status_code == 200:
                    logger.info(f"✅ Ping successful: {url}/health")
                else:
                    logger.warning(f"⚠️ Ping returned status {response.status_code}: {url}/health")
        except httpx.RequestError:
            logger.error(f"❌ Ping failed for {url}/health:", exc_info=True)
        except Exception:
            logger.error("❌ An unexpected error occurred during ping:", exc_info=True)
        
        await asyncio.sleep(interval)

async def start_ping_service(url: str) -> None:
    """Start the ping service."""
    global ping_task
    if ping_task is None:
        ping_task = asyncio.create_task(ping_backend(url))
        logger.info("🚀 Ping service started")

def stop_ping_service() -> None:
    """Stop the ping service."""
    global ping_task
    if ping_task:
        ping_task.cancel()
        logger.info("🛑 Ping service stopped")
        ping_task = None
