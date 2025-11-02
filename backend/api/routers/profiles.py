"""
Profiles API router for InvestAI platform.
Handles user profile management for startups and investors.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, Optional, List
import logging
from pydantic import BaseModel, EmailStr

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(tags=["profiles"])

# Pydantic models
class StartupProfile(BaseModel):
    company_name: str
    industry: str
    stage: str
    description: str
    business_model: str
    target_market: str
    team_size: str
    funding_history: str
    revenue: str
    website: str
    email: EmailStr
    phone: str
    location: str
    founded_year: str
    key_members: List[Dict[str, str]] = []
    technology_stack: str
    competitive_advantage: str
    market_size: str
    customer_segments: str
    value_proposition: str
    revenue_model: str
    growth_strategy: str
    challenges: str
    goals: str

class InvestorProfile(BaseModel):
    name: str
    email: EmailStr
    company: str
    investment_focus: List[str]
    investment_stage: List[str]
    typical_investment_size: str
    portfolio_companies: List[str] = []
    investment_criteria: str
    location: str
    phone: str
    website: str
    linkedin: str
    bio: str
    years_experience: int
    previous_companies: List[str] = []

class ProfileResponse(BaseModel):
    success: bool
    profile: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/startup", response_model=ProfileResponse)
async def create_startup_profile(profile: StartupProfile, user_id: str):
    """
    Create or update a startup profile.
    
    Args:
        profile: Startup profile data
        user_id: Firebase user ID
        
    Returns:
        Success status and profile data
    """
    try:
        logger.info(f"Creating startup profile for user: {user_id}")
        
        # TODO: Implement database storage
        # For now, return success with mock data
        profile_data = profile.dict()
        profile_data["user_id"] = user_id
        profile_data["profile_type"] = "startup"
        
        return ProfileResponse(
            success=True,
            profile=profile_data
        )
        
    except Exception as e:
        logger.error(f"Error creating startup profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create startup profile"
        )

@router.post("/investor", response_model=ProfileResponse)
async def create_investor_profile(profile: InvestorProfile, user_id: str):
    """
    Create or update an investor profile.
    
    Args:
        profile: Investor profile data
        user_id: Firebase user ID
        
    Returns:
        Success status and profile data
    """
    try:
        logger.info(f"Creating investor profile for user: {user_id}")
        
        # TODO: Implement database storage
        profile_data = profile.dict()
        profile_data["user_id"] = user_id
        profile_data["profile_type"] = "investor"
        
        return ProfileResponse(
            success=True,
            profile=profile_data
        )
        
    except Exception as e:
        logger.error(f"Error creating investor profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create investor profile"
        )

@router.get("/startup/{user_id}", response_model=ProfileResponse)
async def get_startup_profile(user_id: str):
    """
    Get startup profile by user ID.
    
    Args:
        user_id: Firebase user ID
        
    Returns:
        Startup profile data
    """
    try:
        logger.info(f"Fetching startup profile for user: {user_id}")
        
        # TODO: Implement database retrieval
        # For now, return mock data
        return ProfileResponse(
            success=True,
            profile={"user_id": user_id, "profile_type": "startup"}
        )
        
    except Exception as e:
        logger.error(f"Error fetching startup profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch startup profile"
        )

@router.get("/investor/{user_id}", response_model=ProfileResponse)
async def get_investor_profile(user_id: str):
    """
    Get investor profile by user ID.
    
    Args:
        user_id: Firebase user ID
        
    Returns:
        Investor profile data
    """
    try:
        logger.info(f"Fetching investor profile for user: {user_id}")
        
        # TODO: Implement database retrieval
        return ProfileResponse(
            success=True,
            profile={"user_id": user_id, "profile_type": "investor"}
        )
        
    except Exception as e:
        logger.error(f"Error fetching investor profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch investor profile"
        )

@router.get("/startups", response_model=List[Dict[str, Any]])
async def list_startup_profiles(
    skip: int = 0,
    limit: int = 100,
    industry: Optional[str] = None,
    stage: Optional[str] = None
):
    """
    List all startup profiles with optional filtering.
    
    Args:
        skip: Number of profiles to skip
        limit: Maximum number of profiles to return
        industry: Filter by industry
        stage: Filter by stage
        
    Returns:
        List of startup profiles
    """
    try:
        logger.info("Fetching startup profiles list")
        
        # TODO: Implement database query with filtering
        # For now, return empty list
        return []
        
    except Exception as e:
        logger.error(f"Error fetching startup profiles: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch startup profiles"
        )

@router.get("/investors", response_model=List[Dict[str, Any]])
async def list_investor_profiles(
    skip: int = 0,
    limit: int = 100,
    focus: Optional[str] = None
):
    """
    List all investor profiles with optional filtering.
    
    Args:
        skip: Number of profiles to skip
        limit: Maximum number of profiles to return
        focus: Filter by investment focus
        
    Returns:
        List of investor profiles
    """
    try:
        logger.info("Fetching investor profiles list")
        
        # TODO: Implement database query with filtering
        return []
        
    except Exception as e:
        logger.error(f"Error fetching investor profiles: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch investor profiles"
        )

# Discovery and Matching Endpoints
@router.get("/startups/discover")
async def discover_startups(
    industry: Optional[str] = Query(None, description="Filter by industry"),
    stage: Optional[str] = Query(None, description="Filter by stage"),
    location: Optional[str] = Query(None, description="Filter by location"),
    search: Optional[str] = Query(None, description="Search term"),
    limit: int = Query(50, description="Number of results to return"),
    offset: int = Query(0, description="Number of results to skip")
):
    """
    Discover startups with optional filtering.
    
    Args:
        industry: Filter by industry (e.g., "Technology", "Healthcare")
        stage: Filter by stage (e.g., "Seed", "Series A")
        location: Filter by location (e.g., "San Francisco", "New York")
        search: Search term for company name or description
        limit: Maximum number of results to return
        offset: Number of results to skip for pagination
        
    Returns:
        List of startup profiles matching the criteria
    """
    try:
        print(f"🔍 [DISCOVERY] Discovering startups with filters:")
        print(f"   Industry: {industry}")
        print(f"   Stage: {stage}")
        print(f"   Location: {location}")
        print(f"   Search: {search}")
        print(f"   Limit: {limit}, Offset: {offset}")
        
        # Mock data for now - replace with actual database query
        mock_startups = [
            {
                "id": "startup_1",
                "company_name": "TechCorp AI",
                "industry": "Technology",
                "stage": "Series A",
                "location": "San Francisco, CA",
                "description": "AI-powered business automation platform",
                "funding_raised": "$2.5M",
                "team_size": "15-20",
                "founded_year": "2022",
                "website": "https://techcorp.ai",
                "logo_url": "https://via.placeholder.com/100x100?text=TC",
                "tags": ["AI", "Automation", "B2B"]
            },
            {
                "id": "startup_2", 
                "company_name": "HealthTech Solutions",
                "industry": "Healthcare",
                "stage": "Seed",
                "location": "New York, NY",
                "description": "Digital health monitoring and analytics",
                "funding_raised": "$500K",
                "team_size": "5-10",
                "founded_year": "2023",
                "website": "https://healthtech.com",
                "logo_url": "https://via.placeholder.com/100x100?text=HT",
                "tags": ["Healthcare", "IoT", "Analytics"]
            },
            {
                "id": "startup_3",
                "company_name": "GreenEnergy Co",
                "industry": "Clean Energy",
                "stage": "Series B",
                "location": "Austin, TX",
                "description": "Renewable energy storage solutions",
                "funding_raised": "$10M",
                "team_size": "25-30",
                "founded_year": "2021",
                "website": "https://greenenergy.co",
                "logo_url": "https://via.placeholder.com/100x100?text=GE",
                "tags": ["Clean Energy", "Storage", "Sustainability"]
            }
        ]
        
        # Apply filters
        filtered_startups = mock_startups
        
        if industry:
            filtered_startups = [s for s in filtered_startups if s["industry"].lower() == industry.lower()]
        
        if stage:
            filtered_startups = [s for s in filtered_startups if s["stage"].lower() == stage.lower()]
            
        if location:
            filtered_startups = [s for s in filtered_startups if location.lower() in s["location"].lower()]
            
        if search:
            search_lower = search.lower()
            filtered_startups = [s for s in filtered_startups if 
                               search_lower in s["company_name"].lower() or 
                               search_lower in s["description"].lower()]
        
        # Apply pagination
        paginated_startups = filtered_startups[offset:offset + limit]
        
        print(f"✅ [DISCOVERY] Found {len(paginated_startups)} startups (total: {len(filtered_startups)})")
        
        return {
            "startups": paginated_startups,
            "total": len(filtered_startups),
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < len(filtered_startups)
        }
        
    except Exception as e:
        print(f"❌ [DISCOVERY] Error discovering startups: {str(e)}")
        logger.error(f"Error discovering startups: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to discover startups"
        )

@router.get("/investors/discover")
async def discover_investors(
    focus_industries: Optional[List[str]] = Query(None, description="Filter by focus industries"),
    investment_stages: Optional[List[str]] = Query(None, description="Filter by investment stages"),
    location: Optional[str] = Query(None, description="Filter by location"),
    search: Optional[str] = Query(None, description="Search term"),
    limit: int = Query(50, description="Number of results to return"),
    offset: int = Query(0, description="Number of results to skip")
):
    """
    Discover investors with optional filtering.
    
    Args:
        focus_industries: List of industries the investor focuses on
        investment_stages: List of stages the investor invests in
        location: Filter by location
        search: Search term for investor name or company
        limit: Maximum number of results to return
        offset: Number of results to skip for pagination
        
    Returns:
        List of investor profiles matching the criteria
    """
    try:
        print(f"🔍 [DISCOVERY] Discovering investors with filters:")
        print(f"   Industries: {focus_industries}")
        print(f"   Stages: {investment_stages}")
        print(f"   Location: {location}")
        print(f"   Search: {search}")
        print(f"   Limit: {limit}, Offset: {offset}")
        
        # Mock data for now - replace with actual database query
        mock_investors = [
            {
                "id": "investor_1",
                "name": "John Smith",
                "company": "TechVentures Capital",
                "title": "Managing Partner",
                "focus_industries": ["Technology", "AI", "SaaS"],
                "investment_stages": ["Seed", "Series A"],
                "location": "San Francisco, CA",
                "description": "Early-stage tech investor with 10+ years experience",
                "portfolio_size": "50+ companies",
                "avg_investment": "$500K - $2M",
                "website": "https://techventures.com",
                "linkedin": "https://linkedin.com/in/johnsmith",
                "photo_url": "https://via.placeholder.com/100x100?text=JS"
            },
            {
                "id": "investor_2",
                "name": "Sarah Johnson",
                "company": "HealthFund Partners",
                "title": "Investment Director",
                "focus_industries": ["Healthcare", "Biotech", "MedTech"],
                "investment_stages": ["Series A", "Series B"],
                "location": "New York, NY",
                "description": "Healthcare-focused investor with medical background",
                "portfolio_size": "30+ companies",
                "avg_investment": "$1M - $5M",
                "website": "https://healthfund.com",
                "linkedin": "https://linkedin.com/in/sarahjohnson",
                "photo_url": "https://via.placeholder.com/100x100?text=SJ"
            },
            {
                "id": "investor_3",
                "name": "Mike Chen",
                "company": "GreenVentures",
                "title": "Founding Partner",
                "focus_industries": ["Clean Energy", "Sustainability", "Climate Tech"],
                "investment_stages": ["Seed", "Series A", "Series B"],
                "location": "Austin, TX",
                "description": "Climate tech investor focused on sustainable solutions",
                "portfolio_size": "40+ companies",
                "avg_investment": "$250K - $3M",
                "website": "https://greenventures.com",
                "linkedin": "https://linkedin.com/in/mikechen",
                "photo_url": "https://via.placeholder.com/100x100?text=MC"
            }
        ]
        
        # Apply filters
        filtered_investors = mock_investors
        
        if focus_industries:
            filtered_investors = [i for i in filtered_investors if 
                                any(industry.lower() in [ind.lower() for ind in i["focus_industries"]] 
                                    for industry in focus_industries)]
        
        if investment_stages:
            filtered_investors = [i for i in filtered_investors if 
                                any(stage.lower() in [s.lower() for s in i["investment_stages"]] 
                                    for stage in investment_stages)]
            
        if location:
            filtered_investors = [i for i in filtered_investors if location.lower() in i["location"].lower()]
            
        if search:
            search_lower = search.lower()
            filtered_investors = [i for i in filtered_investors if 
                               search_lower in i["name"].lower() or 
                               search_lower in i["company"].lower() or
                               search_lower in i["description"].lower()]
        
        # Apply pagination
        paginated_investors = filtered_investors[offset:offset + limit]
        
        print(f"✅ [DISCOVERY] Found {len(paginated_investors)} investors (total: {len(filtered_investors)})")
        
        return {
            "investors": paginated_investors,
            "total": len(filtered_investors),
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < len(filtered_investors)
        }
        
    except Exception as e:
        print(f"❌ [DISCOVERY] Error discovering investors: {str(e)}")
        logger.error(f"Error discovering investors: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to discover investors"
        )
