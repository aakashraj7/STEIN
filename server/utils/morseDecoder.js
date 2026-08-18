const MORSE_CODE_MAP = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
  '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
  '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
  '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
  '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
  '--..': 'Z',
  '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
  '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
  '.-.-.-': '.', '--..--': ',', '..--..': '?', '.----.': "'",
  '-.-.--': '!', '-..-.': '/', '.-...': '&', '---...': ':',
  '-.-.-.': ';', '-...-': '=', '.-.-.': '+', '-....-': '-',
  '..--.-': '_', '.-..-.': '"', '...-..-': '$', '.--.-.': '@',
};

const REVERSE_MORSE_MAP = Object.fromEntries(
  Object.entries(MORSE_CODE_MAP).map(([code, char]) => [char, code])
);

/**
  * Encode plain text to Morse code string.
  * @param {string} text
  * @returns {string}
  */
export function encodeToMorse(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toUpperCase()
    .trim()
    .split('')
    .map(char => {
      if (char === ' ') return '/';
      return REVERSE_MORSE_MAP[char] || char;
    })
    .join(' ');
}

/**
  * Normalize dots and dashes in raw string.
  */
function normalizeMorseSymbols(str) {
  return str
    .replace(/[•·]/g, '.')
    .replace(/[—–_]/g, '-');
}

/**
  * Decode a single Morse code token (e.g. "...").
  */
export function decodeMorseToken(token) {
  const norm = normalizeMorseSymbols(token.trim());
  return MORSE_CODE_MAP[norm] || '';
}

/**
  * Detect if a text block contains valid Morse code and decode it.
  * Preserves original raw text.
  * 
  * @param {string} rawText
  * @returns {{ originalText: string, decodedText: string, encodingDetected: string | null }}
  */
export function detectAndDecodeEncoding(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      originalText: rawText || '',
      decodedText: rawText || '',
      encodingDetected: null,
    };
  }

  const normalized = normalizeMorseSymbols(rawText);

  // Regex to match candidate Morse code sequences:
  // Sequences consisting of dots, dashes, spaces, slashes (/), and pipes (|)
  const morseBlockRegex = /(?:(?<=\s|^)[.\-\/|\s]{2,}(?=\s|$))/g;

  let encodingDetected = null;
  let decodedText = rawText;

  // First, check if the ENTIRE message is Morse code or contains Morse blocks
  // Strategy: Identify contiguous tokens that consist solely of dots and dashes.
  
  // Split message by whitespace or Morse word separators (/ or |)
  const tokens = normalized.trim().split(/\s+/);
  
  // Helper to check if a token consists strictly of dots and dashes (length 1 to 7)
  const isMorseToken = (t) => /^[.\-]{1,7}$/.test(t) || t === '/' || t === '|';

  // Count Morse tokens vs standard word tokens
  let morseTokens = 0;
  let multiCharMorseTokens = 0;
  let wordTokens = 0;

  for (const t of tokens) {
    if (isMorseToken(t)) {
      if (t !== '/' && t !== '|') {
        morseTokens++;
        if (t.length >= 2) multiCharMorseTokens++;
      }
    } else {
      // Token contains letters/digits/other punctuation
      wordTokens++;
    }
  }

  // Check if entire message qualifies as Morse Code
  // Conditions for entire message being Morse:
  // 1. Zero standard word tokens (or all tokens are Morse/slash/pipe).
  // 2. Contains at least 1 multi-character Morse token OR >= 3 single-character Morse tokens.
  const isEntireMessageMorse = wordTokens === 0 && morseTokens > 0 && (multiCharMorseTokens >= 1 || morseTokens >= 3);

  if (isEntireMessageMorse) {
    const decodedWords = decodeMorseString(normalized);
    if (decodedWords && decodedWords.length > 0) {
      return {
        originalText: rawText,
        decodedText: decodedWords,
        encodingDetected: 'MORSE',
      };
    }
  }

  // Handle mixed content or embedded Morse blocks (e.g. "ALERT: ... --- ...")
  // Find contiguous blocks of Morse tokens
  let hasDecodedMorseBlock = false;
  
  // Scan for Morse token runs within the token list
  const resultTokens = [];
  let currentMorseRun = [];

  const flushMorseRun = () => {
    if (currentMorseRun.length === 0) return;
    
    // Validate run
    const runMorseTokens = currentMorseRun.filter(t => t !== '/' && t !== '|');
    const runMultiChar = runMorseTokens.filter(t => t.length >= 2);
    
    // Must have at least 1 multi-char token OR >= 3 tokens to avoid false positives (e.g., isolated "-" hyphens)
    const isValidMorseBlock = runMorseTokens.length > 0 && (runMultiChar.length >= 1 || runMorseTokens.length >= 3);

    if (isValidMorseBlock) {
      const decodedRun = decodeMorseString(currentMorseRun.join(' '));
      if (decodedRun) {
        resultTokens.push(decodedRun);
        hasDecodedMorseBlock = true;
      } else {
        resultTokens.push(...currentMorseRun);
      }
    } else {
      resultTokens.push(...currentMorseRun);
    }
    currentMorseRun = [];
  };

  for (const token of tokens) {
    if (isMorseToken(token)) {
      currentMorseRun.push(token);
    } else {
      flushMorseRun();
      resultTokens.push(token);
    }
  }
  flushMorseRun();

  if (hasDecodedMorseBlock) {
    encodingDetected = 'MORSE';
    decodedText = resultTokens.join(' ');
  }

  return {
    originalText: rawText,
    decodedText,
    encodingDetected,
  };
}

/**
  * Internal helper to decode a confirmed Morse string into plain text.
  */
function decodeMorseString(morseStr) {
  // Split words by /, |, or 2+ consecutive spaces
  const words = morseStr.split(/\s*[\/|]\s*|\s{2,}/);
  
  const decodedWords = words.map(word => {
    const chars = word.trim().split(/\s+/);
    return chars
      .map(c => MORSE_CODE_MAP[c] || '')
      .join('');
  }).filter(Boolean);

  return decodedWords.join(' ');
}
