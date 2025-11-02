"""
Meeting scheduling API router for InvestAI platform.
Handles meeting requests, scheduling, and notifications between startups and investors.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional, List
import logging
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from enum import Enum

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(tags=["meetings"])

# Enums
class MeetingStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class MeetingType(str, Enum):
    INVESTOR_TO_STARTUP = "investor_to_startup"
    STARTUP_TO_INVESTOR = "startup_to_investor"

# Pydantic models
class TimeSlot(BaseModel):
    start_time: datetime
    end_time: datetime
    timezone: str = "UTC"

class MeetingRequest(BaseModel):
    requester_id: str
    requester_type: str  # "startup" or "investor"
    recipient_id: str
    recipient_type: str  # "startup" or "investor"
    meeting_type: MeetingType
    preferred_time_slots: List[TimeSlot] = Field(..., min_items=1, max_items=3)
    message: Optional[str] = None
    meeting_duration: int = 30  # minutes

class MeetingResponse(BaseModel):
    meeting_id: str
    status: MeetingStatus
    requester_id: str
    recipient_id: str
    meeting_type: MeetingType
    preferred_time_slots: List[TimeSlot]
    selected_time_slot: Optional[TimeSlot] = None
    message: Optional[str] = None
    meeting_duration: int
    created_at: datetime
    updated_at: datetime

class MeetingUpdate(BaseModel):
    status: Optional[MeetingStatus] = None
    selected_time_slot: Optional[TimeSlot] = None
    message: Optional[str] = None

class MeetingListResponse(BaseModel):
    meetings: List[MeetingResponse]
    total: int
    page: int
    page_size: int

# In-memory storage (in production, use a database)
meetings_db = {}
meeting_counter = 0

@router.post("/request", response_model=MeetingResponse)
async def create_meeting_request(request: MeetingRequest):
    """
    Create a new meeting request.
    
    Args:
        request: Meeting request details
        
    Returns:
        Created meeting request with unique ID
    """
    try:
        global meeting_counter
        meeting_counter += 1
        meeting_id = f"meeting_{meeting_counter}_{int(datetime.now().timestamp())}"
        
        # Validate time slots
        for slot in request.preferred_time_slots:
            if slot.start_time >= slot.end_time:
                raise HTTPException(
                    status_code=400,
                    detail="Start time must be before end time"
                )
            if slot.start_time <= datetime.now():
                raise HTTPException(
                    status_code=400,
                    detail="Time slots must be in the future"
                )
        
        # Create meeting record
        meeting = MeetingResponse(
            meeting_id=meeting_id,
            status=MeetingStatus.PENDING,
            requester_id=request.requester_id,
            recipient_id=request.recipient_id,
            meeting_type=request.meeting_type,
            preferred_time_slots=request.preferred_time_slots,
            message=request.message,
            meeting_duration=request.meeting_duration,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Store in database
        meetings_db[meeting_id] = meeting.dict()
        
        logger.info(f"Meeting request created: {meeting_id}")
        
        return meeting
        
    except Exception as e:
        logger.error(f"Error creating meeting request: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create meeting request: {str(e)}"
        )

@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(meeting_id: str):
    """
    Get a specific meeting by ID.
    
    Args:
        meeting_id: Unique meeting identifier
        
    Returns:
        Meeting details
    """
    if meeting_id not in meetings_db:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )
    
    return MeetingResponse(**meetings_db[meeting_id])

@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(meeting_id: str, update: MeetingUpdate):
    """
    Update a meeting request (accept, reject, confirm time slot).
    
    Args:
        meeting_id: Unique meeting identifier
        update: Meeting update details
        
    Returns:
        Updated meeting details
    """
    if meeting_id not in meetings_db:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )
    
    meeting_data = meetings_db[meeting_id]
    
    # Update fields
    if update.status:
        meeting_data["status"] = update.status
    if update.selected_time_slot:
        meeting_data["selected_time_slot"] = update.selected_time_slot.dict()
    if update.message:
        meeting_data["message"] = update.message
    
    meeting_data["updated_at"] = datetime.now()
    
    # Store updated meeting
    meetings_db[meeting_id] = meeting_data
    
    logger.info(f"Meeting updated: {meeting_id}, status: {update.status}")
    
    return MeetingResponse(**meeting_data)

@router.get("/user/{user_id}", response_model=MeetingListResponse)
async def get_user_meetings(
    user_id: str,
    status: Optional[MeetingStatus] = None,
    page: int = 1,
    page_size: int = 20
):
    """
    Get all meetings for a specific user.
    
    Args:
        user_id: User identifier
        status: Filter by meeting status (optional)
        page: Page number for pagination
        page_size: Number of meetings per page
        
    Returns:
        List of meetings for the user
    """
    user_meetings = []
    
    for meeting_data in meetings_db.values():
        if (meeting_data["requester_id"] == user_id or 
            meeting_data["recipient_id"] == user_id):
            if not status or meeting_data["status"] == status:
                user_meetings.append(MeetingResponse(**meeting_data))
    
    # Sort by created_at (newest first)
    user_meetings.sort(key=lambda x: x.created_at, reverse=True)
    
    # Pagination
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_meetings = user_meetings[start_idx:end_idx]
    
    return MeetingListResponse(
        meetings=paginated_meetings,
        total=len(user_meetings),
        page=page,
        page_size=page_size
    )

@router.delete("/{meeting_id}")
async def cancel_meeting(meeting_id: str):
    """
    Cancel a meeting request.
    
    Args:
        meeting_id: Unique meeting identifier
        
    Returns:
        Success message
    """
    if meeting_id not in meetings_db:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )
    
    meeting_data = meetings_db[meeting_id]
    meeting_data["status"] = MeetingStatus.CANCELLED
    meeting_data["updated_at"] = datetime.now()
    
    meetings_db[meeting_id] = meeting_data
    
    logger.info(f"Meeting cancelled: {meeting_id}")
    
    return {"message": "Meeting cancelled successfully"}

@router.get("/stats/{user_id}")
async def get_meeting_stats(user_id: str):
    """
    Get meeting statistics for a user.
    
    Args:
        user_id: User identifier
        
    Returns:
        Meeting statistics
    """
    stats = {
        "total_meetings": 0,
        "pending_requests": 0,
        "accepted_meetings": 0,
        "confirmed_meetings": 0,
        "completed_meetings": 0,
        "cancelled_meetings": 0
    }
    
    for meeting_data in meetings_db.values():
        if (meeting_data["requester_id"] == user_id or 
            meeting_data["recipient_id"] == user_id):
            stats["total_meetings"] += 1
            status = meeting_data["status"]
            
            if status == MeetingStatus.PENDING:
                stats["pending_requests"] += 1
            elif status == MeetingStatus.ACCEPTED:
                stats["accepted_meetings"] += 1
            elif status == MeetingStatus.CONFIRMED:
                stats["confirmed_meetings"] += 1
            elif status == MeetingStatus.COMPLETED:
                stats["completed_meetings"] += 1
            elif status == MeetingStatus.CANCELLED:
                stats["cancelled_meetings"] += 1
    
    return stats

@router.get("/health")
async def health_check():
    """Health check endpoint for meeting service."""
    return {
        "status": "healthy",
        "service": "meetings",
        "version": "1.0.0",
        "total_meetings": len(meetings_db)
    }
