export const  normalizeName = (name: string | null | undefined): string|undefined => {
    if (!name) return;
  
    let normalized = name.toLowerCase();

    // Remove special characters and punctuation, but keep spaces
    normalized = normalized.replace(/[^a-z0-9\s]/g, '');
  
    // Collapse multiple spaces into single spaces
    normalized = normalized.replace(/\s+/g, ' ');
  
    // Trim leading/trailing whitespace 
    normalized = normalized.trim();
  
    return normalized;
  
  }