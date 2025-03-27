/**
 * Performance monitoring utilities for tracking component render times and bottlenecks
 */

// Flag to enable/disable performance monitoring
let isPerfMonitoringEnabled = false;

/**
 * Enable or disable performance monitoring
 * @param enable Whether to enable monitoring
 */
export const setPerformanceMonitoring = (enable: boolean): void => {
  isPerfMonitoringEnabled = enable;
};

/**
 * Track the start of a component render or operation
 * @param componentName Name of the component or operation
 * @returns A function to call when the operation is complete to log the duration
 */
export const trackRenderStart = (componentName: string): () => void => {
  if (!isPerfMonitoringEnabled) return () => {};
  
  const startTime = performance.now();
  console.log(`[PERF] ${componentName} render started`);
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`[PERF] ${componentName} render completed in ${duration.toFixed(2)}ms`);
    
    // Report potentially problematic render times
    if (duration > 100) {
      console.warn(`[PERF] ${componentName} render time exceeds 100ms (${duration.toFixed(2)}ms)`);
    }
  };
};

/**
 * Track a specific operation within a component
 * @param componentName Name of the component
 * @param operationName Name of the operation
 * @param operation Function to track
 * @returns The result of the operation
 */
export const trackOperation = <T>(
  componentName: string,
  operationName: string,
  operation: () => T
): T => {
  if (!isPerfMonitoringEnabled) return operation();
  
  const startTime = performance.now();
  try {
    return operation();
  } finally {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`[PERF] ${componentName}.${operationName} took ${duration.toFixed(2)}ms`);
    
    // Report potentially problematic operations
    if (duration > 50) {
      console.warn(`[PERF] ${componentName}.${operationName} exceeds 50ms (${duration.toFixed(2)}ms)`);
    }
  }
};

/**
 * Create a performance tracking hook to use in React components
 * @param componentName Name of the component
 * @returns An object with functions to track operations
 */
export const usePerformanceTracking = (componentName: string) => {
  const trackComponentOperation = <T>(operationName: string, operation: () => T): T => {
    return trackOperation(componentName, operationName, operation);
  };
  
  const logEvent = (eventName: string, details?: Record<string, any>): void => {
    if (!isPerfMonitoringEnabled) return;
    
    console.log(`[PERF-EVENT] ${componentName}.${eventName}`, details);
  };
  
  return {
    trackOperation: trackComponentOperation,
    logEvent
  };
};

/**
 * Create a performance mark for React DevTools profiler
 * @param markName Name of the performance mark
 */
export const markPerformance = (markName: string): void => {
  if (typeof window !== 'undefined' && isPerfMonitoringEnabled) {
    performance.mark(markName);
  }
};

// Default export with all utilities
export default {
  setPerformanceMonitoring,
  trackRenderStart,
  trackOperation,
  usePerformanceTracking,
  markPerformance
}; 