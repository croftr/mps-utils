import { normalizeName } from './utils';
const logger = require('../logger');

describe('normalizeName', () => {
  // Mock the logger to avoid actual logging during tests
  jest.spyOn(logger, 'warn').mockImplementation(() => {});

  it('should handle null and undefined inputs', () => {
    expect(normalizeName(null)).toBeUndefined();
    expect(normalizeName(undefined)).toBeUndefined();
  });

  it('should normalize to lowercase and remove special characters', () => {
    expect(normalizeName('Acme Co., Ltd.')).toBe('acme company');
    expect(normalizeName('Hello_World!')).toBe('hello world');
    expect(normalizeName('  TeSt-CaSe  ')).toBe('test case');
  });

  it('should remove specific words', () => {
    expect(normalizeName('Sponsorship Solutions Ltd')).toBe('solutions');
    expect(normalizeName('Limited Edition')).toBe('edition');
  });

  it('should replace abbreviations with full forms', () => {
    expect(normalizeName('Acme Inc.')).toBe('acme incorporated');
    expect(normalizeName('Zacharias & Co')).toBe('zacharias company');
    expect(normalizeName('The Lib Dems')).toBe('the liberal dems');
  });

  it('should trim leading/trailing whitespace', () => {
    expect(normalizeName('  hello  ')).toBe('hello');
  });

  it('should log a warning if all characters are removed', () => {
    normalizeName('!!!');
    expect(logger.warn).toHaveBeenCalledWith('Have removed all characters from !!!');
  });

  it('should handle badly formed names', () => {
    expect(normalizeName('1 Journeycall Limited, 3')).toBe('journeycall');    
    expect(normalizeName('1Journeycall Limited,33 22')).toBe('1journeycall limited33 22');    
    expect(normalizeName('11 Journeycall Limited 33')).toBe('11 journeycall  33');        
    expect(normalizeName('147 club')).toBe('147 club');    
    expect(normalizeName('club 22')).toBe('club 22');    
    expect(normalizeName('1 mail2you')).toBe('mail2you');    
    expect(normalizeName('Lots 1,2,3,4,10.11 & 12 - Risk Management Partners')).toBe('lots 11 12 risk management partners');    
  });


});