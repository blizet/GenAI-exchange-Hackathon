import { useState, useCallback } from 'react';

const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [loadingStates, setLoadingStates] = useState({});

  const setLoadingState = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const startLoading = useCallback((key = 'default') => {
    if (key === 'default') {
      setLoading(true);
    } else {
      setLoadingState(key, true);
    }
  }, [setLoadingState]);

  const stopLoading = useCallback((key = 'default') => {
    if (key === 'default') {
      setLoading(false);
    } else {
      setLoadingState(key, false);
    }
  }, [setLoadingState]);

  const isLoading = useCallback((key = 'default') => {
    if (key === 'default') {
      return loading;
    }
    return loadingStates[key] || false;
  }, [loading, loadingStates]);

  const withLoading = useCallback(async (asyncFn, key = 'default') => {
    try {
      startLoading(key);
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    loadingStates,
    startLoading,
    stopLoading,
    isLoading,
    withLoading,
    setLoadingState
  };
};

export default useLoading;
