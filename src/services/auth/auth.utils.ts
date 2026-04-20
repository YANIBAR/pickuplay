
export function decodeToken(token: string) {
    const payload = token.split('.')[1]; // Get the payload part
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/')); // Base64 decode
    return JSON.parse(decoded);
}