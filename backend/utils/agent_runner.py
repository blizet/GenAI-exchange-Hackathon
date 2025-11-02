"""
Centralized agent runner utility for InvestAI platform.
Provides a unified interface for running AI agents with proper error handling and logging.
"""

import asyncio
import logging
from typing import Any, Dict, Optional, List
from langchain_google_genai import ChatGoogleGenerativeAI
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class AgentRunner:
    """Centralized agent runner with error handling and configuration management."""

    def __init__(self):
        # Initialise Gemini via LangChain wrapper (API key picked up from env var GOOGLE_API_KEY)
        try:
            self.model = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                temperature=0.7,
                max_output_tokens=1024,
                google_api_key=settings.google_api_key
            )
            self.safety_settings = [
                {"category": "HARM_CATEGORY_HATE_SPEECH",       "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            logger.info("ChatGoogleGenerativeAI model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ChatGoogleGenerativeAI model: {e}")
            raise
    
    async def run_agent_async(
        self,
        agent_name: str,
        prompt: str,
        input_data: Any = None,
        max_retries: int = 3,
        timeout: int = 300
    ) -> Dict[str, Any]:
        """
        Run an agent asynchronously with proper error handling and retries.
        
        Args:
            agent_name: Name of the agent for logging purposes
            prompt: The prompt to send to the agent
            input_data: Optional input data to include in the prompt
            max_retries: Maximum number of retry attempts
            timeout: Timeout in seconds
            
        Returns:
            Dictionary containing the agent response and metadata
            
        Raises:
            AgentError: If the agent fails after all retries
        """
        logger.info(f"Starting {agent_name} agent execution")
        
        for attempt in range(max_retries + 1):
            try:
                # Prepare the full prompt
                full_prompt = self._prepare_prompt(prompt, input_data)
                
                # Run the agent with timeout
                response = await asyncio.wait_for(
                    self._execute_agent(full_prompt),
                    timeout=timeout
                )
                
                logger.info(f"{agent_name} agent completed successfully")
                return {
                    "success": True,
                    "agent_name": agent_name,
                    "response": response,
                    "attempts": attempt + 1,
                    "error": None
                }
                
            except asyncio.TimeoutError:
                error_msg = f"{agent_name} agent timed out after {timeout} seconds"
                logger.warning(f"{error_msg} (attempt {attempt + 1}/{max_retries + 1})")
                
                if attempt == max_retries:
                    raise AgentError(error_msg, agent_name, "TIMEOUT")
                    
            except Exception as e:
                error_msg = f"{agent_name} agent failed: {str(e)}"
                logger.warning(f"{error_msg} (attempt {attempt + 1}/{max_retries + 1})")
                
                if attempt == max_retries:
                    raise AgentError(error_msg, agent_name, "EXECUTION_ERROR", str(e))
                
                # Wait before retry (exponential backoff)
                await asyncio.sleep(2 ** attempt)
        
        # This should never be reached, but just in case
        raise AgentError(f"{agent_name} agent failed after {max_retries + 1} attempts", agent_name, "MAX_RETRIES")
    
    async def _execute_agent(self, prompt: str) -> str:
        """Run the prompt through Gemini via LangChain and return the text response."""
        try:
            # Check if we have a valid API key
            if settings.google_api_key == "demo_key" or not settings.google_api_key or len(settings.google_api_key) < 10:
                logger.warning("Using demo mode - API key not valid, returning mock response")
                return self._get_demo_response(prompt)
            
            # Create a HumanMessage for the prompt
            from langchain_core.messages import HumanMessage
            messages = [HumanMessage(content=prompt)]
            
            logger.info(f"Executing agent with prompt length: {len(prompt)}")
            logger.info(f"Model type: {type(self.model)}")
            
            # Use ainvoke for simpler response handling
            response = await self.model.ainvoke(messages)
            
            logger.info(f"Response type: {type(response)}")
            logger.info(f"Response content: {response}")
            
            # Handle different response structures
            if hasattr(response, 'content'):
                return response.content
            elif hasattr(response, 'text'):
                return response.text
            else:
                return str(response)
                    
        except Exception as e:
            logger.error(f"Agent execution failed: {e}")
            logger.error(f"Exception type: {type(e)}")
            logger.error(f"Exception details: {str(e)}")
            
            # If API key is invalid, provide demo response
            if "API key not valid" in str(e) or "API_KEY_INVALID" in str(e):
                logger.warning("API key invalid, falling back to demo response")
                return self._get_demo_response(prompt)
            
            raise
    
    def _get_demo_response(self, prompt: str) -> str:
        """Generate a demo response when API key is not available."""
        # Extract the question from the prompt
        question = ""
        if "INVESTOR QUESTION:" in prompt:
            question = prompt.split("INVESTOR QUESTION:")[-1].split("INSTRUCTIONS:")[0].strip()
        elif "What is this startup about?" in prompt:
            question = "What is this startup about?"
        else:
            question = "What is this startup about?"
        
        # Provide contextual demo responses
        demo_responses = {
            "What is this startup about?": "This is a demo startup focused on AI-powered investment analysis. The platform provides comprehensive startup evaluation using advanced machine learning algorithms.",
            "What is the business model?": "The business model is SaaS-based with subscription tiers for different investor types, including freemium and enterprise plans.",
            "What problem does this startup solve?": "It solves the problem of time-consuming and inconsistent startup evaluation by providing automated, data-driven investment analysis.",
            "What is the target market size?": "The target market is the global venture capital and angel investment market, estimated at $300+ billion annually.",
            "Who are the main competitors?": "Key competitors include PitchBook, CB Insights, and other investment analysis platforms, but this startup offers more AI-driven insights.",
            "What are the main risks?": "Main risks include market competition, regulatory changes in investment analysis, and dependence on AI model accuracy.",
            "How does this startup compare to competitors?": "This startup offers superior AI-powered analysis with faster processing times and more comprehensive data integration compared to traditional platforms.",
            "What is the funding history?": "The startup is currently in seed stage with initial funding from angel investors and is seeking Series A funding."
        }
        
        # Find the best matching response
        for key, response in demo_responses.items():
            if key.lower() in question.lower() or question.lower() in key.lower():
                return response
        
        # Default response
        return "This is a demo response. The startup appears to be in the AI/technology sector with strong growth potential based on available data."
    
    def _prepare_prompt(self, prompt: str, input_data: Any = None) -> str:
        """Prepare the full prompt with input data if provided."""
        if input_data is None:
            return prompt
        
        if isinstance(input_data, str):
            return f"{prompt}\n\nInput Data:\n{input_data}"
        elif isinstance(input_data, dict):
            input_str = "\n".join([f"{k}: {v}" for k, v in input_data.items()])
            return f"{prompt}\n\nInput Data:\n{input_str}"
        else:
            return f"{prompt}\n\nInput Data:\n{str(input_data)}"
    
    async def run_multiple_agents(
        self,
        agent_configs: List[Dict[str, Any]],
        max_concurrent: int = 3
    ) -> Dict[str, Any]:
        """
        Run multiple agents concurrently with controlled concurrency.
        
        Args:
            agent_configs: List of agent configurations
            max_concurrent: Maximum number of concurrent agents
            
        Returns:
            Dictionary mapping agent names to their results
        """
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def run_single_agent(config):
            async with semaphore:
                return await self.run_agent_async(**config)
        
        tasks = [run_single_agent(config) for config in agent_configs]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        agent_results = {}
        for i, result in enumerate(results):
            agent_name = agent_configs[i].get("agent_name", f"agent_{i}")
            
            if isinstance(result, Exception):
                agent_results[agent_name] = {
                    "success": False,
                    "error": str(result),
                    "agent_name": agent_name
                }
            else:
                agent_results[agent_name] = result
        
        return agent_results

class AgentError(Exception):
    """Custom exception for agent-related errors."""
    
    def __init__(self, message: str, agent_name: str, error_type: str, details: str = None):
        self.message = message
        self.agent_name = agent_name
        self.error_type = error_type
        self.details = details
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for API responses."""
        return {
            "error": self.message,
            "agent_name": self.agent_name,
            "error_type": self.error_type,
            "details": self.details
        }

# Global agent runner instance
agent_runner = AgentRunner()

# Convenience functions
async def run_agent(agent_name: str, prompt: str, input_data: Any = None, **kwargs) -> Dict[str, Any]:
    """Convenience function to run a single agent."""
    return await agent_runner.run_agent_async(agent_name, prompt, input_data, **kwargs)

async def run_agents(agent_configs: List[Dict[str, Any]], **kwargs) -> Dict[str, Any]:
    """Convenience function to run multiple agents."""
    return await agent_runner.run_multiple_agents(agent_configs, **kwargs)
