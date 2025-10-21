// Shared helper to normalize image values into full URLs used by the app.
export function normalizeImageUri(val) {
  if (!val) return null;
  try {
    const s = String(val).trim();
    if (!s) return null;
    // already absolute - canonicalize host to www.thetrago.com when needed
    if (/^https?:\/\//i.test(s)) {
      try {
        const url = new URL(s);
        if (url.hostname === 'thetrago.com') {
          url.hostname = 'www.thetrago.com';
          return url.toString();
        }
        return s;
      } catch (e) {
        return s;
      }
    }
    // protocol-relative
    if (/^\/\//.test(s)) return `https:${s}`;

    const baseHost = 'https://www.thetrago.com';

    // Extract filename
    const filename = s.split('/').pop();
    const hasExt = /\.(png|jpe?g|gif|webp|svg)$/i.test(filename);

    // If value already references uploads path, keep it but ensure full host
    if (/Api\/uploads/i.test(s) || /uploads\//i.test(s)) {
      const path = s.replace(/^\/+/, '');
      return `${baseHost}/${path}`;
    }

    // If it mentions member folder or looks like a member file, map to member uploads
    if (/member/i.test(s) || /member.*\.(png|jpe?g|gif|webp|svg)$/i.test(s)) {
      return `${baseHost}/Api/uploads/member/${filename}`;
    }

    // If it's a review image filename (starts with review_), prefer storage/uploads/review path (per server FTP)
    if (/^review[_-]/i.test(filename)) {
      // prefer storage path if server stores under /storage/uploads/review/
      return `${baseHost}/storage/uploads/review/${filename}`;
    }

    // If it mentions company, map to company uploads
    if (/company/i.test(s)) {
      return `${baseHost}/Api/uploads/company/${filename}`;
    }

    // If it's just a filename with an image extension, put it under uploads root
    if (hasExt) return `${baseHost}/Api/uploads/${filename}`;

    // Default: treat as member filename under member uploads
    return `${baseHost}/Api/uploads/member/${filename}`;
  } catch (e) {
    return null;
  }
}
