// JWT Authentication Utility Engine

export function generateMockJwtToken(userPayload, expiresInHours = 24) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userPayload.id || "usr_994812",
    email: userPayload.email || "rapuruprasanthi@gmail.com",
    role: userPayload.role || "Candidate Admin",
    iss: "auracareer-auth-gateway",
    iat: now,
    exp: now + (expiresInHours * 3600),
    scopes: ["jobs:read", "jobs:apply", "outreach:send", "latex:compile", "kb:write"]
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const mockSignature = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}

export function inspectJwtToken(tokenStr) {
  try {
    const parts = tokenStr.split('.');
    if (parts.length !== 3) throw new Error("Invalid JWT token format");
    
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    const signature = parts[2];
    
    const isExpired = payload.exp ? (Date.now() / 1000) > payload.exp : false;

    return {
      valid: true,
      header,
      payload,
      signature: signature.substring(0, 12) + "...",
      isExpired,
      expiresInFormatted: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : "N/A"
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message
    };
  }
}
