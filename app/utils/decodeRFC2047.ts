/**
 * Decodes RFC 2047 encoded strings (MIME header encoding)
 * Format: =?charset?encoding?encoded-text?=
 * 
 * @param encoded - The RFC 2047 encoded string
 * @returns The decoded string
 * 
 * @example
 * decodeRFC2047('=?utf-8?Q?=E4=B8=BA=E4=BB=80=E4=B9=88=E6=98=AF=E6=97=A5=E6=9C=AC?=')
 * // Returns: "为什么是日本"
 */
export function decodeRFC2047(encoded: string): string {
  if (!encoded || typeof encoded !== 'string') {
    return encoded;
  }

  // RFC 2047 format: =?charset?encoding?encoded-text?=
  const rfc2047Regex = /=\?([^?]+)\?([QB])\?([^?]+)\?=/gi;

  return encoded.replace(rfc2047Regex, (match, charset, encoding, encodedText) => {
    try {
      if (encoding.toUpperCase() === 'Q') {
        // Quoted-Printable decoding
        return decodeQuotedPrintable(encodedText, charset);
      } else if (encoding.toUpperCase() === 'B') {
        // Base64 decoding
        return decodeBase64(encodedText, charset);
      }
      return match; // Unknown encoding, return as-is
    } catch (error) {
      console.error('Error decoding RFC 2047:', error);
      return match; // Return original if decoding fails
    }
  });
}

/**
 * Decodes Quoted-Printable encoded text
 */
function decodeQuotedPrintable(text: string, charset: string = 'utf-8'): string {
  // Build byte array from quoted-printable encoding
  const bytes: number[] = [];
  let i = 0;
  
  while (i < text.length) {
    if (text[i] === '=' && i + 2 < text.length) {
      // Check if it's a hex byte (=XX)
      const hexMatch = text.substring(i + 1, i + 3).match(/^[0-9A-F]{2}$/i);
      if (hexMatch) {
        bytes.push(parseInt(hexMatch[0], 16));
        i += 3;
        continue;
      }
      // Check if it's a soft line break (=\r\n or =\n)
      if (text[i + 1] === '\r' && text[i + 2] === '\n') {
        i += 3;
        continue;
      }
      if (text[i + 1] === '\n') {
        i += 2;
        continue;
      }
    }
    
    // Handle underscore as space (RFC 2047 Q-encoding)
    if (text[i] === '_') {
      bytes.push(0x20); // Space character
    } else {
      bytes.push(text.charCodeAt(i));
    }
    i++;
  }
  
  // Decode bytes using the specified charset
  try {
    const decoder = new TextDecoder(charset.toLowerCase());
    return decoder.decode(new Uint8Array(bytes));
  } catch {
    // Fallback: convert bytes to string directly
    return String.fromCharCode(...bytes);
  }
}

/**
 * Decodes Base64 encoded text
 */
function decodeBase64(text: string, charset: string = 'utf-8'): string {
  try {
    // Remove whitespace from base64 string
    const cleanBase64 = text.replace(/\s/g, '');
    
    // Decode base64 to bytes
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Decode bytes using the specified charset
    const decoder = new TextDecoder(charset.toLowerCase());
    return decoder.decode(bytes);
  } catch (error) {
    console.error('Error decoding base64:', error);
    return text;
  }
}

