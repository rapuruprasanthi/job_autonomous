from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class JobPosting(BaseModel):
    portal_slug: str
    external_id: str
    title: str
    company: str
    location: str
    work_mode: str = "Remote"
    salary_range: Optional[str] = None
    description: str
    url: str
    raw_data: Optional[Dict[str, Any]] = None

class BaseJobConnector(ABC):
    @abstractmethod
    def search(self, target_titles: List[str], locations: List[str], min_salary: int = 0) -> List[JobPosting]:
        """Search job portal for matching postings."""
        pass
