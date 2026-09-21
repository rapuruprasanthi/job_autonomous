import random
from typing import List
from app.services.job_search.base_connector import BaseJobConnector, JobPosting

INDIAN_TECH_COMPANIES = [
    "Razorpay", "Swiggy", "Zomato", "CRED", "Flipkart", "Meesho", "PhonePe",
    "Zepto", "InMobi", "Postman India", "BrowserStack", "Chargebee", "Freshworks"
]

INDIAN_TECH_TITLES = [
    "Senior Full Stack Engineer", "Backend Software Engineer (Python/FastAPI)",
    "Lead Python Developer", "Full Stack Engineer (React/TypeScript)",
    "Software Development Engineer II (SDE-2)", "Senior Platform Engineer"
]

INDIAN_LOCATIONS = [
    "Bengaluru, Karnataka (Remote/Hybrid)",
    "Hyderabad, Telangana",
    "Pune, Maharashtra",
    "Gurgaon / Delhi NCR",
    "Noida, Uttar Pradesh",
    "Remote (India)"
]

class MockJobConnector(BaseJobConnector):
    def __init__(self, portal_slug: str = "naukri"):
        self.portal_slug = portal_slug

    def search(self, target_titles: List[str], locations: List[str], min_salary: int = 0) -> List[JobPosting]:
        results: List[JobPosting] = []
        titles = target_titles if target_titles else ["Software Engineer"]

        for i, title in enumerate(titles):
            company = INDIAN_TECH_COMPANIES[(i + len(self.portal_slug)) % len(INDIAN_TECH_COMPANIES)]
            loc = locations[0] if locations else INDIAN_LOCATIONS[i % len(INDIAN_LOCATIONS)]
            lpa_val = 18 + (i * 4)

            description = f"""
            {company} is looking for a talented {title} to join our high-scale engineering team in India.
            
            Key Responsibilities:
            - Design, develop, and deploy scalable microservices using Python, FastAPI, and PostgreSQL.
            - Build responsive web dashboards using React, TypeScript, and Tailwind CSS.
            - Optimize database queries, Redis caching layer, and background task queues.
            - Collaborate with product managers and engineers across Bengaluru and Hyderabad offices.

            Requirements:
            - 3+ years experience in full-stack web application development.
            - Proficiency in Python, FastAPI/Django, React, TypeScript, SQL, and Docker.
            - B.Tech/B.E. in Computer Science or equivalent technical field.
            - Strong understanding of system design, REST APIs, and microservices architecture.
            """

            job = JobPosting(
                portal_slug=self.portal_slug,
                external_id=f"{self.portal_slug}-in-job-{i+201}",
                title=f"{title}",
                company=company,
                location=loc,
                work_mode="Remote" if "Remote" in loc else "Hybrid",
                salary_range=f"₹{lpa_val} LPA - ₹{lpa_val + 8} LPA",
                description=description.strip(),
                url=f"https://www.{self.portal_slug}.com/job-listings/{company.lower()}-{i+201}",
                raw_data={"portal": self.portal_slug, "currency": "INR", "lpa": lpa_val}
            )
            results.append(job)

        return results
