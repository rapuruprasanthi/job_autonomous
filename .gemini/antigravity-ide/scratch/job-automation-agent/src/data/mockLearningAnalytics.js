export const mockLearningAnalyticsData = {
  overallConversionRate: "28.4%",
  totalApplicationsAnalyzed: 142,
  interviewRateGain: "+12.6% vs standard resume",
  resumeFormatComparison: [
    { format: "1-Column Overleaf LaTeX (Classic Modern)", applied: 78, interviewInvites: 26, conversionRate: "33.3%" },
    { format: "2-Column Deedy LaTeX (Minimalist)", applied: 42, interviewInvites: 9, conversionRate: "21.4%" },
    { format: "Plain Text / Standard PDF", applied: 22, interviewInvites: 3, conversionRate: "13.6%" }
  ],
  subjectLinePerformance: [
    { subjectPattern: "Direct Role Reference + Key Skill Match", openRate: "84%", responseRate: "42%" },
    { subjectPattern: "Question about Engineering Roadmap", openRate: "76%", responseRate: "31%" },
    { subjectPattern: "Generic Job Application Inquiry", openRate: "48%", responseRate: "12%" }
  ],
  topConvertedKeywords: [
    { keyword: "JWT Authentication & OAuth2", conversionImpact: "+18%" },
    { keyword: "AWS Security & Zero Trust", conversionImpact: "+16%" },
    { keyword: "Overleaf / LaTeX Automation", conversionImpact: "+15%" },
    { keyword: "React.js & High Performance UI", conversionImpact: "+14%" },
    { keyword: "Autonomous LLM Agents", conversionImpact: "+12%" }
  ],
  learningInsights: [
    "Overleaf 1-Column LaTeX template yielded a +11.9% higher ATS pass-through rate compared to multi-column designs.",
    "Cold emails containing direct repository links (e.g. GitHub security project) achieved a 42% reply rate from TA Leads.",
    "Applying within 4 hours of job posting across Naukri & LinkedIn increased recruiter view rates by 3.2x.",
    "Auto-filling salary expectations with negotiated CTC ranges reduced automatic ATS drop-offs by 24%."
  ]
};
