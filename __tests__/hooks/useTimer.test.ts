import { renderHook, act } from '@testing-library/react'
import { useTimer } from '../../app/hooks/useTimer'

describe('useTimer hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(Date, 'now')
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('should initialize with 0 time', () => {
    const { result } = renderHook(() => useTimer())
    
    expect(result.current.timeElapsed).toBe(0)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
  })

  it('should start the timer', () => {
    const { result } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(false)
  })

  it('should increment time when running', () => {
    const { result } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    expect(result.current.timeElapsed).toBe(1)
  })

  it('should pause the timer', () => {
    const { result } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    // Advance time by 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    
    act(() => {
      result.current.pause()
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(true)
    expect(result.current.timeElapsed).toBe(2)
  })

  it('should resume the timer', () => {
    const { result } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    // Advance time by 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    act(() => {
      result.current.pause()
    })
    
    act(() => {
      result.current.resume()
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(false)
  })

  it('should reset the timer', () => {
    const { result } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    // Advance time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.timeElapsed).toBe(0)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
  })

  it('should cleanup interval on unmount', () => {
    const { result, unmount } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    const initialTimerCount = jest.getTimerCount()
    
    unmount()
    
    // The timer should be cleaned up
    expect(jest.getTimerCount()).toBeLessThan(initialTimerCount)
  })

  it('should format time correctly', () => {
    const { result } = renderHook(() => useTimer())
    
    // Test formatTime utility function directly
    expect(result.current.formatTime(5)).toBe('00:05')
    expect(result.current.formatTime(60)).toBe('01:00')
    expect(result.current.formatTime(3600)).toBe('60:00')
    expect(result.current.formatTime(125)).toBe('02:05')
  })

  it('should provide correct utility functions', () => {
    const { result } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    // Advance time by 125 seconds (2 minutes and 5 seconds)
    act(() => {
      jest.advanceTimersByTime(125000)
    })
    
    expect(result.current.getTimeInMilliseconds()).toBe(125000)
    expect(result.current.getTimeInMinutes()).toBe(2)
    
    const breakdown = result.current.getTimeBreakdown()
    expect(breakdown).toEqual({
      hours: 0,
      minutes: 2,
      seconds: 5,
      total: 125
    })
  })

  it('should handle toggle functionality', () => {
    const { result } = renderHook(() => useTimer())
    
    // Toggle should start the timer
    act(() => {
      result.current.toggle()
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(false)
    
    // Toggle should pause the timer
    act(() => {
      result.current.toggle()
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(true)
    
    // Toggle should resume the timer
    act(() => {
      result.current.toggle()
    })
    
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(false)
  })
})