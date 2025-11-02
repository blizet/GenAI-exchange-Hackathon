"""
Custom exceptions for InvestAI platform.
Provides structured error handling with specific error types and messages.
"""

from typing import Dict, Any, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class ErrorType(Enum):
    """Enumeration of error types for better categorization."""
    VALIDATION_ERROR = "validation_error"
    AUTHENTICATION_ERROR = "authentication_error"
    AUTHORIZATION_ERROR = "authorization_error"
    NOT_FOUND_ERROR = "not_found_error"
    CONFLICT_ERROR = "conflict_error"
    RATE_LIMIT_ERROR = "rate_limit_error"
    EXTERNAL_API_ERROR = "external_api_error"
    DATABASE_ERROR = "database_error"
    AGENT_ERROR = "agent_error"
    PROCESSING_ERROR = "processing_error"
    CONFIGURATION_ERROR = "configuration_error"
    INTERNAL_ERROR = "internal_error"

class InvestAIException(Exception):
    """Base exception class for InvestAI platform."""
    
    def __init__(
        self,
        message: str,
        error_type: ErrorType = ErrorType.INTERNAL_ERROR,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ):
        self.message = message
        self.error_type = error_type
        self.details = details or {}
        self.status_code = status_code
        super().__init__(self.message)
        
        # Log the error
        logger.error(f"{error_type.value}: {message}", extra={"details": self.details})
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for API responses."""
        return {
            "error": self.message,
            "error_type": self.error_type.value,
            "details": self.details,
            "status_code": self.status_code
        }

class ValidationError(InvestAIException):
    """Raised when input validation fails."""
    
    def __init__(self, message: str, field: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        merged_details = details or {}
        merged_details["field"] = field
        super().__init__(
            message=message,
            error_type=ErrorType.VALIDATION_ERROR,
            details=merged_details,
            status_code=400
        )

class AuthenticationError(InvestAIException):
    """Raised when authentication fails."""
    
    def __init__(self, message: str = "Authentication failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_type=ErrorType.AUTHENTICATION_ERROR,
            details=details,
            status_code=401
        )

class AuthorizationError(InvestAIException):
    """Raised when authorization fails."""
    
    def __init__(self, message: str = "Access denied", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_type=ErrorType.AUTHORIZATION_ERROR,
            details=details,
            status_code=403
        )

class NotFoundError(InvestAIException):
    """Raised when a resource is not found."""
    
    def __init__(self, resource: str, identifier: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        message = f"{resource} not found"
        if identifier:
            message += f" with identifier: {identifier}"
        
        merged_details = details or {}
        merged_details["resource"] = resource
        merged_details["identifier"] = identifier
        super().__init__(
            message=message,
            error_type=ErrorType.NOT_FOUND_ERROR,
            details=merged_details,
            status_code=404
        )

class ConflictError(InvestAIException):
    """Raised when there's a conflict with existing data."""
    
    def __init__(self, message: str, resource: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        merged_details = details or {}
        merged_details["resource"] = resource
        super().__init__(
            message=message,
            error_type=ErrorType.CONFLICT_ERROR,
            details=merged_details,
            status_code=409
        )

class RateLimitError(InvestAIException):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, message: str = "Rate limit exceeded", retry_after: Optional[int] = None, details: Optional[Dict[str, Any]] = None):
        merged_details = details or {}
        merged_details["retry_after"] = retry_after
        super().__init__(
            message=message,
            error_type=ErrorType.RATE_LIMIT_ERROR,
            details=merged_details,
            status_code=429
        )

class ExternalAPIError(InvestAIException):
    """Raised when external API calls fail."""
    
    def __init__(self, service: str, message: str, status_code: Optional[int] = None, details: Optional[Dict[str, Any]] = None):
        merged_details = details or {}
        merged_details["service"] = service
        merged_details["external_status_code"] = status_code
        super().__init__(
            message=f"External API error ({service}): {message}",
            error_type=ErrorType.EXTERNAL_API_ERROR,
            details=merged_details,
            status_code=502
        )

class DatabaseError(InvestAIException):
    """Raised when database operations fail."""
    
    def __init__(self, operation: str, message: str, details: Optional[Dict[str, Any]] = None):
        merged_details = details or {}
        merged_details["operation"] = operation
        super().__init__(
            message=f"Database error during {operation}: {message}",
            error_type=ErrorType.DATABASE_ERROR,
            details=merged_details,
            status_code=500
        )

class AgentError(InvestAIException):
    """Raised when AI agent operations fail."""
    
    def __init__(self, agent_name: str, message: str, error_type: str = "execution_error", details: Optional[Dict[str, Any]] = None):
        merged_details = details or {}
        merged_details["agent_name"] = agent_name
        merged_details["agent_error_type"] = error_type
        super().__init__(
            message=f"Agent error ({agent_name}): {message}",
            error_type=ErrorType.AGENT_ERROR,
            details=merged_details,
            status_code=500
        )

class ProcessingError(InvestAIException):
    """Raised when data processing fails."""
    
    def __init__(self, process: str, message: str, details: Optional[Dict[str, Any]] = None):
        merged_details = details or {}
        merged_details["process"] = process
        super().__init__(
            message=f"Processing error in {process}: {message}",
            error_type=ErrorType.PROCESSING_ERROR,
            details=merged_details,
            status_code=500
        )

class ConfigurationError(InvestAIException):
    """Raised when configuration is invalid or missing."""
    
    def __init__(self, setting: str, message: str, details: Optional[Dict[str, Any]] = None):
        merged_details = details or {}
        merged_details["setting"] = setting
        super().__init__(
            message=f"Configuration error for {setting}: {message}",
            error_type=ErrorType.CONFIGURATION_ERROR,
            details=merged_details,
            status_code=500
        )

# Error handler utilities
def handle_agent_error(agent_name: str, error: Exception) -> AgentError:
    """Convert generic exception to AgentError."""
    if isinstance(error, AgentError):
        return error
    
    return AgentError(
        agent_name=agent_name,
        message=str(error),
        error_type="execution_error",
        details={"original_error": type(error).__name__}
    )

def handle_database_error(operation: str, error: Exception) -> DatabaseError:
    """Convert database exception to DatabaseError."""
    if isinstance(error, DatabaseError):
        return error
    
    return DatabaseError(
        operation=operation,
        message=str(error),
        details={"original_error": type(error).__name__}
    )

def handle_external_api_error(service: str, error: Exception, status_code: Optional[int] = None) -> ExternalAPIError:
    """Convert external API exception to ExternalAPIError."""
    if isinstance(error, ExternalAPIError):
        return error
    
    return ExternalAPIError(
        service=service,
        message=str(error),
        status_code=status_code,
        details={"original_error": type(error).__name__}
    )
