/**
 * Basic setup test to verify Jest configuration
 * This ensures the testing environment is working correctly
 */

describe('Jest Setup', () => {
  it('should be able to run tests', () => {
    expect(true).toBe(true);
  });

  it('should have access to testing utilities', () => {
    expect(expect).toBeDefined();
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
  });
});

describe('Environment Setup', () => {
  it('should be running in test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should have basic math operations working', () => {
    expect(2 + 2).toBe(4);
    expect(Math.max(1, 2, 3)).toBe(3);
  });
}); 