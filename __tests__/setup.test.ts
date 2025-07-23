// Simple setup test to validate Jest configuration
describe('Jest Setup', () => {
  it('should be able to run basic tests', () => {
    expect(true).toBe(true)
  })

  it('should have access to Jest globals', () => {
    expect(typeof describe).toBe('function')
    expect(typeof it).toBe('function')
    expect(typeof expect).toBe('function')
  })

  it('should support async/await', async () => {
    const promise = Promise.resolve('test')
    const result = await promise
    expect(result).toBe('test')
  })
})