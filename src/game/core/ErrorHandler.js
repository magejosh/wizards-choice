/**
 * Centralized Error Handling Utility for Wizard's Choice
 */
class ErrorHandler {
    /**
     * Log an error with consistent formatting
     * @param {string} source - Source of the error (component/class name)
     * @param {string} message - Error message
     * @param {Error} [error] - Optional error object
     */
    static log(source, message, error = null) {
        const timestamp = new Date().toISOString();
        const errorPrefix = `[${timestamp}] ERROR in ${source}: `;
        
        console.error(errorPrefix + message);
        
        if (error) {
            console.error(error);
        }
        
        // Optional: Send to error tracking service
        this.trackError(source, message, error);
    }
    
    /**
     * Handle critical errors that might break game functionality
     * @param {string} source - Source of the critical error
     * @param {string} message - Critical error message
     * @param {Error} [error] - Optional error object
     * @param {Function} [recoveryCallback] - Optional recovery function
     */
    static handleCritical(source, message, error = null, recoveryCallback = null) {
        this.log(source, `CRITICAL: ${message}`, error);
        
        // Show user-friendly error notification
        this.showErrorNotification(message);
        
        // Attempt recovery if callback provided
        if (typeof recoveryCallback === 'function') {
            try {
                recoveryCallback();
            } catch (recoveryError) {
                this.log(source, 'Recovery attempt failed', recoveryError);
            }
        }
    }
    
    /**
     * Show an error notification to the user
     * @param {string} message - Error message to display
     */
    static showErrorNotification(message) {
        // Check if running in browser environment
        if (typeof document !== 'undefined') {
            const notification = document.createElement('div');
            notification.className = 'error-notification';
            notification.textContent = `Error: ${message}`;
            notification.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background-color: #ff4444;
                color: white;
                padding: 10px;
                border-radius: 5px;
                z-index: 1000;
            `;
            
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 5000);
        }
    }
    
    /**
     * Track error for potential remote logging or analytics
     * @param {string} source - Source of the error
     * @param {string} message - Error message
     * @param {Error} [error] - Optional error object
     */
    static trackError(source, message, error = null) {
        // Placeholder for potential error tracking service integration
        // Could be expanded to send errors to services like Sentry, LogRocket, etc.
        const errorData = {
            source,
            message,
            timestamp: new Date().toISOString(),
            stackTrace: error ? error.stack : null
        };
        
        // Example: console logging, could be replaced with actual tracking
        console.warn('Error tracked:', errorData);
    }
    
    /**
     * Safely execute a function with error handling
     * @param {Function} fn - Function to execute
     * @param {string} source - Source of the function call
     * @param {Array} [args] - Arguments to pass to the function
     * @returns {*} Result of the function or null if error occurred
     */
    static safeExecute(fn, source, args = []) {
        try {
            return fn(...args);
        } catch (error) {
            this.handleCritical(source, 'Execution failed', error);
            return null;
        }
    }
}

export default ErrorHandler;
