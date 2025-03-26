import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const LoadingContext = createContext();

// Custom hook for component-specific loading state management
export const useLoadingState = (componentId) => {
  const { showLoading, hideLoading, isLoadingOperation } = useLoading();
  const loadingKey = `${componentId}-loading`;

  const startLoading = useCallback(() => {
    showLoading(loadingKey);
  }, [showLoading, loadingKey]);

  const stopLoading = useCallback(() => {
    hideLoading(loadingKey);
  }, [hideLoading, loadingKey]);

  const isLoading = useCallback(() => {
    return isLoadingOperation(loadingKey);
  }, [isLoadingOperation, loadingKey]);

  return {
    startLoading,
    stopLoading,
    isLoading
  };
};

// HOC to wrap components with loading functionality
export const withLoading = (WrappedComponent, componentId) => {
  return function WithLoadingComponent(props) {
    const { startLoading, stopLoading, isLoading } = useLoadingState(componentId);

    const loadingProps = {
      startLoading,
      stopLoading,
      isLoading: isLoading(),
      ...props
    };

    return <WrappedComponent {...loadingProps} />;
  };
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState(new Map());
  const [globalLoading, setGlobalLoading] = useState(false);
  const loadingTimeouts = useRef(new Map());

  const clearLoadingTimeout = useCallback((key) => {
    if (loadingTimeouts.current.has(key)) {
      clearTimeout(loadingTimeouts.current.get(key));
      loadingTimeouts.current.delete(key);
    }
  }, []);

  // Show loading for a specific key or globally with debounce
  const showLoading = useCallback((key = 'global') => {
    clearLoadingTimeout(key);

    // Add a small delay before showing loading to prevent flashing
    loadingTimeouts.current.set(key, setTimeout(() => {
      if (key === 'global') {
        setGlobalLoading(true);
        return;
      }
      
      setLoadingStates(prev => {
        const newStates = new Map(prev);
        newStates.set(key, true);
        return newStates;
      });
    }, 150)); // Small delay to prevent flashing for quick operations
  }, [clearLoadingTimeout]);

  // Hide loading for a specific key or globally
  const hideLoading = useCallback((key = 'global') => {
    clearLoadingTimeout(key);

    if (key === 'global') {
      setGlobalLoading(false);
      return;
    }

    setLoadingStates(prev => {
      const newStates = new Map(prev);
      newStates.delete(key);
      return newStates;
    });
  }, [clearLoadingTimeout]);

  // Check if a specific operation is loading
  const isLoadingOperation = useCallback((key) => {
    if (key === 'global') return globalLoading;
    return loadingStates.has(key);
  }, [loadingStates, globalLoading]);

  // Get all current loading operations
  const getLoadingOperations = useCallback(() => {
    return Array.from(loadingStates.keys());
  }, [loadingStates]);

  // Check if any operation is loading
  const hasActiveLoadingOperations = useCallback(() => {
    return loadingStates.size > 0;
  }, [loadingStates]);

  // Determine if we should show the global loading state
  const shouldShowGlobalLoading = useCallback(() => {
    return globalLoading;
  }, [globalLoading]);

  // Cleanup timeouts when unmounting
  React.useEffect(() => {
    return () => {
      loadingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      loadingTimeouts.current.clear();
    };
  }, []);

  const value = {
    isLoading: shouldShowGlobalLoading(),
    showLoading,
    hideLoading,
    isLoadingOperation,
    getLoadingOperations,
    hasActiveLoadingOperations
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 