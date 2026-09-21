// JWT Token helper & Mock Auth State

export const initialUserSession = {
  isAuthenticated: true,
  user: {
    id: "usr_994812",
    fullName: "Prasanthi Rapuru",
    email: "rapuruprasanthi@gmail.com",
    role: "Candidate Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    targetTitles: ["Senior Full Stack Engineer", "Cloud Security Engineer", "AI Solutions Architect"],
    preferredLocations: ["Hybrid / Bengaluru", "Remote", "Hyderabad"],
    minSalary: "$120,000 / ₹28,000,000",
    experienceLevel: "5+ Years Senior",
    activeMode: "Approval", // 'Autonomous' | 'Approval' | 'Assisted'
  },
  jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTk0ODEyIiwiZW1haWwiOiJyYXB1cnVwcmFzYW50aGlAZ21haWwuY29tIiwicm9sZSI6IkNhbmRpZGF0ZSBBZG1pbiIsImlhdCI6MTcyNjg5MDgwMCwiZXhwIjoxNzI2OTc3MjAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  refreshToken: "rf_token_9812497129487192847198274",
  tokenExpiresAt: "2026-09-22T12:00:00Z",
  permissions: {
    linkedin: true,
    naukri: true,
    indeed: true,
    glassdoor: true,
    foundit: true,
    wellfound: true,
    cutshort: true,
    instahyre: true,
    hirist: true,
    shine: false
  },
  quotas: {
    maxPerDay: 25,
    maxPerPortal: 5,
    appliedToday: 8,
    emailsSentToday: 6
  }
};

export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {
      sub: "usr_994812",
      email: "rapuruprasanthi@gmail.com",
      role: "Candidate Admin",
      iat: 1726890800,
      exp: 1726977200,
      iss: "auracareer-auth-service"
    };
  }
}
