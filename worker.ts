
/**
 * Cisco IOS Insight: Pre-processing Worker
 * Handles heavy string manipulation and PII redaction off-main-thread.
 */

import { ConfigFile } from './types';

// Sensitive patterns to redact (Passwords, Keys, Community Strings)
const REDACTION_PATTERNS = [
  /(password (?:7|0|8|9) )\S+/gi,
  /(secret (?:5|8|9) )\S+/gi,
  /(key-string (?:7|0) )\S+/gi,
  /(snmp-server community )\S+/gi,
  /(neighbor \S+ password (?:7|0) )\S+/gi,
  /(username \S+ (?:password|secret) (?:7|5|0) )\S+/gi,
  /(key hex-string )\S+/gi,
  /(pre-shared-key (?:local|remote) (?:0|6|7) )\S+/gi
];

self.onmessage = (e: MessageEvent<{ files: ConfigFile[] }>) => {
  const { files } = e.data;
  
  const processedFiles = files.map(file => {
    let content = file.content;
    
    // 1. Basic Sanitization: Remove excessive whitespace and control characters
    content = content.replace(/\r/g, '').trim();
    
    // 2. Security Redaction: Replace sensitive strings with <REDACTED>
    REDACTION_PATTERNS.forEach(pattern => {
      content = content.replace(pattern, '$1<REDACTED>');
    });

    // 3. Heuristic: Identify the hostname for better context
    const hostnameMatch = content.match(/^hostname\s+(\S+)/m);
    const identifiedHostname = hostnameMatch ? hostnameMatch[1] : 'Unknown-Device';

    return {
      ...file,
      content,
      identifiedHostname
    };
  });

  self.postMessage({ processedFiles });
};
