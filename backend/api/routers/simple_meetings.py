"""
Simple Meeting Requests API
Handles basic meeting requests between investors and startups
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["simple-meetings"])

# Simple meeting request models
class MeetingRequest(BaseModel):
    investor_name: str = Field(..., description="Investor's name")
    investor_email: str = Field(..., description="Investor's email")
    startup_id: str = Field(..., description="Startup ID")
    message: str = Field(..., description="Meeting request message")
    preferred_date: Optional[str] = Field(None, description="Preferred meeting date")
    preferred_time: Optional[str] = Field(None, description="Preferred meeting time")
    meeting_type: str = Field("video_call", description="Type of meeting")

class MeetingResponse(BaseModel):
    investor_name: str
    investor_email: str
    startup_id: str
    message: str
    preferred_date: Optional[str]
    preferred_time: Optional[str]
    meeting_type: str
    status: str = "pending"  # pending, accepted, declined
    created_at: str
    meeting_id: str

# In-memory storage (replace with database in production)
meeting_requests_db = []

@router.post("/request", response_model=MeetingResponse)
async def create_meeting_request(request: MeetingRequest):
    """
    Create a simple meeting request from investor to startup
    """
    try:
        logger.info(f"Creating meeting request from {request.investor_email} to startup {request.startup_id}")
        
        # Generate meeting ID
        meeting_id = f"meet-{int(datetime.now().timestamp())}"
        
        # Create meeting request
        meeting_request = {
            "meeting_id": meeting_id,
            "investor_name": request.investor_name,
            "investor_email": request.investor_email,
            "startup_id": request.startup_id,
            "message": request.message,
            "preferred_date": request.preferred_date,
            "preferred_time": request.preferred_time,
            "meeting_type": request.meeting_type,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        
        # Store in database (in-memory for now)
        meeting_requests_db.append(meeting_request)
        
        # TODO: Send email notification to startup
        # TODO: Send email notification to investor
        
        return MeetingResponse(**meeting_request)
        
    except Exception as e:
        logger.error(f"Error creating meeting request: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/startup/{startup_id}", response_model=List[MeetingResponse])
async def get_startup_meeting_requests(startup_id: str):
    """
    Get all meeting requests for a specific startup
    """
    try:
        logger.info(f"Getting meeting requests for startup {startup_id}")
        
        # Filter requests for this startup
        startup_requests = [
            req for req in meeting_requests_db 
            if req["startup_id"] == startup_id
        ]
        
        return [MeetingResponse(**req) for req in startup_requests]
        
    except Exception as e:
        logger.error(f"Error getting startup meeting requests: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/investor/{investor_email}", response_model=List[MeetingResponse])
async def get_investor_meeting_requests(investor_email: str):
    """
    Get all meeting requests from a specific investor
    """
    try:
        logger.info(f"Getting meeting requests from investor {investor_email}")
        
        # Filter requests from this investor
        investor_requests = [
            req for req in meeting_requests_db 
            if req["investor_email"] == investor_email
        ]
        
        return [MeetingResponse(**req) for req in investor_requests]
        
    except Exception as e:
        logger.error(f"Error getting investor meeting requests: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/{meeting_id}/accept")
async def accept_meeting_request(meeting_id: str):
    """
    Accept a meeting request (startup accepts investor's request)
    """
    try:
        logger.info(f"Accepting meeting request {meeting_id}")
        
        # Find the meeting request
        meeting_request = None
        for req in meeting_requests_db:
            if req["meeting_id"] == meeting_id:
                meeting_request = req
                break
        
        if not meeting_request:
            raise HTTPException(
                status_code=404,
                detail="Meeting request not found"
            )
        
        # Update status
        meeting_request["status"] = "accepted"
        meeting_request["accepted_at"] = datetime.now().isoformat()
        
        # TODO: Send email notification to investor
        # TODO: Send email notification to startup
        
        return {
            "success": True,
            "meeting_id": meeting_id,
            "status": "accepted",
            "message": "Meeting request accepted successfully"
        }
        
    except Exception as e:
        logger.error(f"Error accepting meeting request: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/{meeting_id}/decline")
async def decline_meeting_request(meeting_id: str, reason: Optional[str] = None):
    """
    Decline a meeting request (startup declines investor's request)
    """
    try:
        logger.info(f"Declining meeting request {meeting_id}")
        
        # Find the meeting request
        meeting_request = None
        for req in meeting_requests_db:
            if req["meeting_id"] == meeting_id:
                meeting_request = req
                break
        
        if not meeting_request:
            raise HTTPException(
                status_code=404,
                detail="Meeting request not found"
            )
        
        # Update status
        meeting_request["status"] = "declined"
        meeting_request["declined_at"] = datetime.now().isoformat()
        if reason:
            meeting_request["decline_reason"] = reason
        
        # TODO: Send email notification to investor
        # TODO: Send email notification to startup
        
        return {
            "success": True,
            "meeting_id": meeting_id,
            "status": "declined",
            "message": "Meeting request declined",
            "reason": reason
        }
        
    except Exception as e:
        logger.error(f"Error declining meeting request: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting_request(meeting_id: str):
    """
    Get details of a specific meeting request
    """
    try:
        logger.info(f"Getting meeting request {meeting_id}")
        
        # Find the meeting request
        meeting_request = None
        for req in meeting_requests_db:
            if req["meeting_id"] == meeting_id:
                meeting_request = req
                break
        
        if not meeting_request:
            raise HTTPException(
                status_code=404,
                detail="Meeting request not found"
            )
        
        return MeetingResponse(**meeting_request)
        
    except Exception as e:
        logger.error(f"Error getting meeting request: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for simple meeting service
    """
    return {
        "status": "healthy",
        "service": "simple-meetings",
        "version": "1.0.0",
        "total_requests": len(meeting_requests_db),
        "features": [
            "Simple meeting requests",
            "Investor to startup communication",
            "Meeting status tracking",
            "Email notifications (planned)"
        ]
    }
