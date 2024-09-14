const logger = require('../logger');

export const normalizeName1 = (name: string | null | undefined): string | undefined => {
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

const normalizer = require('node-normalizer');

/**
 * 
 * @param name 
 * @returns 
 */
export const normalizeName = (name: string | null | undefined): string | undefined => {

  if (!name) return;

  let normalized = name.toLowerCase();

  // 1. Replace underscores with spaces
  normalized = normalized.replace(/_|-/g, ' ');

  //remove numbers followed by a comma or decimal 
  normalized = normalized.replace(/(?<!\d)\b\d+(?:\.\d+)?[.,]\s*/g, '');

  // 2. Remove special characters, punctuation, and extra spaces (including full stops)
  normalized = normalized.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
  
  // 3. Remove specific words 
  normalized = normalized.replace(/\b(sponsorship|ltd|limited)\b/g, '');

  // 4. Replace common abbreviations and replace with full forms
  const allAbbreviations = {
    'co': 'company',
    'inc': 'incorporated',
    'corp': 'corporation',
    'zac': 'zacharias',
    'partnerships': 'partnership',
    'ceramics': 'ceramic',
    'ass': 'association',
    'lib': 'liberal',
    'dem': 'democrat',
  };

  for (const [abbr, fullForm] of Object.entries(allAbbreviations)) {
    normalized = normalized.replace(new RegExp(`\\b${abbr}\\b`, 'g'), fullForm);
  }

  // 5. Trim leading/trailing single numbers separated by spaces
  normalized = normalized.replace(/^\s*\d\s+|\s+\d\s*$/g, ''); 

  // 6. Trim leading/trailing whitespace 
  normalized = normalized.trim();

  if (!normalized.length) {
    logger.warn(`Have removed all characters from ${name}`);
  }

  return normalized;
};