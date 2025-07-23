import { renderHook, act } from '@testing-library/react'
import { useTimer } from '../../app/hooks/useTimer'

describe('useTimer hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should initialize with 0 time', () => {
    const { result } = renderHook(() => useTimer())
    
    expect(result.current.timeElapsed).toBe(0)
    expect(result.current.isRunning).toBe(false)
  })

  it('should start the timer', () => {
    const { result } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    expect(result.current.isRunning).toBe(true)
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
    
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    
    act(() => {
      result.current.pause()
    })
    
    expect(result.current.isRunning).toBe(false)
    expect(result.current.timeElapsed).toBe(2)
    
    // Time should not advance after pause
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    expect(result.current.timeElapsed).toBe(2)
  })

  it('should resume the timer', () => {
    const { result } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
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
    
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    expect(result.current.timeElapsed).toBe(2)
  })

  it('should reset the timer', () => {
    const { result } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.timeElapsed).toBe(0)
    expect(result.current.isRunning).toBe(false)
  })

  it('should cleanup interval on unmount', () => {
    const { result, unmount } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    const initialTimerCount = jest.getTimerCount()
    
    unmount()
    
    expect(jest.getTimerCount()).toBeLessThan(initialTimerCount)
  })

  it('should format time correctly', () => {
    const { result } = renderHook(() => useTimer())
    
    act(() => {
      result.current.start()
    })
    
    // Test various time values
    act(() => {
      jest.advanceTimersByTime(5000) // 5 seconds
    })
    
    expect(result.current.formattedTime).toBe('00:05')
    
    act(() => {
      jest.advanceTimersByTime(55000) // Total 60 seconds (1 minute)
    })
    
    expect(result.current.formattedTime).toBe('01:00')
    
    act(() => {
      jest.advanceTimersByTime(3540000) // Total 3600 seconds (1 hour)
    })
    
    expect(result.current.formattedTime).toBe('60:00')
  })
})