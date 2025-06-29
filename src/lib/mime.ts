// Helper function to detect MIME type from buffer
export async function detectMimeType(buffer: Buffer): Promise<string> {
  // Check for image signatures
  if (buffer.length < 4) return 'application/octet-stream';

  const signatures: { [key: string]: number[] } = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'image/svg+xml': [0x3C, 0x3F, 0x78, 0x6D],
    'image/bmp': [0x42, 0x4D],
    'image/tiff': [0x49, 0x49, 0x2A, 0x00],
    'image/x-icon': [0x00, 0x00, 0x01, 0x00]
  };

  for (const [mimeType, signature] of Object.entries(signatures)) {
    if (signature.every((byte, i) => buffer[i] === byte)) {
      return mimeType;
    }
  }

  // Default to jpeg if no match found
  return 'image/jpeg';
} 