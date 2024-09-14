import { normalizeIndustry } from './industryManager';
const logger = require('../logger');

describe('normalizeIndustry', () => {
  // Mock the logger to avoid actual logging during tests
  jest.spyOn(logger, 'warn').mockImplementation(() => {});

  it('should assign correct categories', () => {
    expect(normalizeIndustry("spectroscopy devices")).toEqual(["Health and Social Care"]);     
    expect(normalizeIndustry("optician services")).toEqual(["Health and Social Care"]);     
    expect(normalizeIndustry("liquid nitrogen")).toEqual(["Energy"]);     
  });
});