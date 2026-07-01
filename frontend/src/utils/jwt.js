// decodes a JWT's payload without verifying the signature (verification is the backend's job;
// this is only used client-side to know when to proactively log the user out)
export const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

// returns the token's expiry as an epoch-millisecond timestamp, or null if it can't be read
export const getTokenExpiryMs = (token) => {
  const payload = decodeJwtPayload(token);
  return typeof payload?.exp === "number" ? payload.exp * 1000 : null;
};
