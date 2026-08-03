/**
 * Validates that a string is a well-formed, https, image-like URL.
 * Optionally flags (without blocking) URLs that don't look like a
 * Cloudinary host, since PlayVerse expects Cloudinary-hosted images but
 * shouldn't hard-fail on a differently-configured Cloudinary account
 * (custom domains, CNAME setups) or a CDN in front of Cloudinary.
 */
export interface ImageUrlValidation {
  isValid: boolean;
  error?: string;
  isCloudinaryHost: boolean;
}

const IMAGE_EXTENSION_REGEX = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i;

export function validateImageUrl(url: string): ImageUrlValidation {
  const trimmed = url.trim();

  if (!trimmed) {
    return { isValid: false, error: "Image URL is required.", isCloudinaryHost: false };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, error: "Enter a valid URL.", isCloudinaryHost: false };
  }

  if (parsed.protocol !== "https:") {
    return { isValid: false, error: "Image URL must use https://.", isCloudinaryHost: false };
  }

  const isCloudinaryHost = /(^|\.)cloudinary\.com$/i.test(parsed.hostname);

  // Cloudinary delivery URLs commonly omit a file extension when using
  // format auto-negotiation (f_auto), so a missing extension is only a
  // soft signal, not a hard failure — but a URL that neither looks like
  // Cloudinary NOR ends in an image extension is very likely a mistake
  // (e.g. a webpage link pasted instead of the image link).
  if (!isCloudinaryHost && !IMAGE_EXTENSION_REGEX.test(parsed.pathname)) {
    return {
      isValid: false,
      error: "This doesn't look like a direct image URL. Use the Cloudinary image link.",
      isCloudinaryHost: false,
    };
  }

  return { isValid: true, isCloudinaryHost };
}
