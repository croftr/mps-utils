const logger = require('../logger');

export const  normalizeName1 = (name: string | null | undefined): string|undefined => {
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


export const normalizeName = (name: string | null | undefined): string | undefined => {

  if (!name) return;

  // let normalized = normalizer.normalize(name);

 let normalized = name.toLowerCase();

  //1. Remove special characters, punctuation, and extra spaces (including full stops)
  normalized = normalized.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

  // 2. Remove some words 
  normalized = normalized.replace(/\b(sponsorship|ltd|limited)\b/g, '');

  // 2. Replace common abbreviations and replace with full forms
  const allAbbreviations  = {
    'co': 'company',
    'inc': 'incorporated',
    'corp': 'corporation',
    'zac' : 'zacharias',
    'partnerships' : 'partnership',
    'ceramics' : 'ceramic',
    'ass': 'association',
    'lib': 'liberal',
    'dem': 'democrat',
  };

  for (const [abbr, fullForm] of Object.entries(allAbbreviations)) {
    normalized = normalized.replace(new RegExp(`\\b${abbr}\\b`, 'g'), fullForm);
  }

  // 4. Trim leading/trailing whitespace 
  normalized = normalized.trim();

  if (!normalized.length) {
    logger.warn(`Have removed all characters from ${name}`);
  }

  return normalized;
};