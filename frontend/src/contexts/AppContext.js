/**
 * Centralized application state management using React Context API.
 * Manages user data, loading states, and global application state.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import firebaseService from '../services/firebaseService';

// Initial state
const initialState = {
  // User state
  user: null,
  userType: null, // 'startup' or 'investor'
  userProfile: null,
  
  // Loading states
  loading: {
    user: false,
    profile: false,
    startups: false,
    investors: false,
    analysis: false,
    global: false
  },
  
  // Error states
  errors: {
    user: null,
    profile: null,
    startups: null,
    investors: null,
    analysis: null,
    global: null
  },
  
  // Data state
  data: {
    startups: [],
    investors: [],
    analyses: [],
    notifications: []
  },
  
  // UI state
  ui: {
    theme: 'light',
    sidebarOpen: false,
    modals: {
      analysis: false,
      profile: false,
      settings: false
    }
  }
};

// Action types
const ActionTypes = {
  // User actions
  SET_USER: 'SET_USER',
  SET_USER_TYPE: 'SET_USER_TYPE',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  CLEAR_USER: 'CLEAR_USER',
  
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  CLEAR_LOADING: 'CLEAR_LOADING',
  
  // Error actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_ALL_ERRORS: 'CLEAR_ALL_ERRORS',
  
  // Data actions
  SET_STARTUPS: 'SET_STARTUPS',
  SET_INVESTORS: 'SET_INVESTORS',
  SET_ANALYSES: 'SET_ANALYSES',
  ADD_ANALYSIS: 'ADD_ANALYSIS',
  UPDATE_ANALYSIS: 'UPDATE_ANALYSIS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  
  // UI actions
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  CLOSE_ALL_MODALS: 'CLOSE_ALL_MODALS'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    // User actions
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        errors: { ...state.errors, user: null }
      };
      
    case ActionTypes.SET_USER_TYPE:
      return {
        ...state,
        userType: action.payload,
        errors: { ...state.errors, user: null }
      };
      
    case ActionTypes.SET_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload,
        errors: { ...state.errors, profile: null }
      };
      
    case ActionTypes.CLEAR_USER:
      // When user logs out, reset all user-specific state and data
      return {
        ...state,
        user: null,
        userType: null,
        userProfile: null,
        // Clear all user-specific data
        data: { 
            ...state.data, 
            startups: [], 
            investors: [], 
            analyses: [], 
            notifications: [] 
        },
        // Clear all errors
        errors: Object.keys(state.errors).reduce((acc, key) => ({ ...acc, [key]: null }), {}),
        // Ensure UI is clean (e.g., modals closed)
        ui: {
            ...state.ui,
            modals: Object.keys(state.ui.modals).reduce((acc, key) => ({ ...acc, [key]: false }), {})
        }
      };
    
    // Loading actions
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: true }
      };
      
    case ActionTypes.CLEAR_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: false }
      };
    
    // Error actions
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.error }
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: null }
      };
      
    case ActionTypes.CLEAR_ALL_ERRORS:
      return {
        ...state,
        errors: Object.keys(state.errors).reduce((acc, key) => ({ ...acc, [key]: null }), {})
      };
    
    // Data actions
    case ActionTypes.SET_STARTUPS:
      return {
        ...state,
        data: { ...state.data, startups: action.payload },
        errors: { ...state.errors, startups: null }
      };
      
    case ActionTypes.SET_INVESTORS:
      return {
        ...state,
        data: { ...state.data, investors: action.payload },
        errors: { ...state.errors, investors: null }
      };
      
    case ActionTypes.SET_ANALYSES:
      return {
        ...state,
        data: { ...state.data, analyses: action.payload },
        errors: { ...state.errors, analysis: null }
      };
      
    case ActionTypes.ADD_ANALYSIS:
      return {
        ...state,
        data: { ...state.data, analyses: [...state.data.analyses, action.payload] }
      };
      
    case ActionTypes.UPDATE_ANALYSIS:
      return {
        ...state,
        data: {
          ...state.data,
          analyses: state.data.analyses.map(analysis =>
            analysis.id === action.payload.id ? { ...analysis, ...action.payload } : analysis
          )
        }
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        data: {
          ...state.data,
          // Add notification to the beginning of the array for 'newest first' view
          notifications: [{ ...action.payload, id: Date.now() }, ...state.data.notifications] 
        }
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        data: {
          ...state.data,
          notifications: state.data.notifications.filter(n => n.id !== action.payload)
        }
      };
    
    // UI actions
    case ActionTypes.SET_THEME:
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload }
      };
      
    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      };
      
    case ActionTypes.OPEN_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: { ...state.ui.modals, [action.payload]: true }
        }
      };
      
    case ActionTypes.CLOSE_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: { ...state.ui.modals, [action.payload]: false }
        }
      };
      
    case ActionTypes.CLOSE_ALL_MODALS:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: Object.keys(state.ui.modals).reduce((acc, key) => ({ ...acc, [key]: false }), {})
        }
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    // User actions
    setUser: (user) => dispatch({ type: ActionTypes.SET_USER, payload: user }),
    setUserType: (userType) => dispatch({ type: ActionTypes.SET_USER_TYPE, payload: userType }),
    setUserProfile: (profile) => dispatch({ type: ActionTypes.SET_USER_PROFILE, payload: profile }),
    clearUser: () => dispatch({ type: ActionTypes.CLEAR_USER }),
    
    // Loading actions
    setLoading: (key) => dispatch({ type: ActionTypes.SET_LOADING, payload: { key } }),
    clearLoading: (key) => dispatch({ type: ActionTypes.CLEAR_LOADING, payload: { key } }),
    
    // Error actions
    setError: (key, error) => dispatch({ type: ActionTypes.SET_ERROR, payload: { key, error } }),
    clearError: (key) => dispatch({ type: ActionTypes.CLEAR_ERROR, payload: { key } }),
    clearAllErrors: () => dispatch({ type: ActionTypes.CLEAR_ALL_ERRORS }),
    
    // Data actions
    setStartups: (startups) => dispatch({ type: ActionTypes.SET_STARTUPS, payload: startups }),
    setInvestors: (investors) => dispatch({ type: ActionTypes.SET_INVESTORS, payload: investors }),
    setAnalyses: (analyses) => dispatch({ type: ActionTypes.SET_ANALYSES, payload: analyses }),
    addAnalysis: (analysis) => dispatch({ type: ActionTypes.ADD_ANALYSIS, payload: analysis }),
    updateAnalysis: (analysis) => dispatch({ type: ActionTypes.UPDATE_ANALYSIS, payload: analysis }),
    addNotification: (notification) => dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification }),
    removeNotification: (id) => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
    
    // UI actions
    setTheme: (theme) => dispatch({ type: ActionTypes.SET_THEME, payload: theme }),
    toggleSidebar: () => dispatch({ type: ActionTypes.TOGGLE_SIDEBAR }),
    openModal: (modal) => dispatch({ type: ActionTypes.OPEN_MODAL, payload: modal }),
    closeModal: (modal) => dispatch({ type: ActionTypes.CLOSE_MODAL, payload: modal }),
    closeAllModals: () => dispatch({ type: ActionTypes.CLOSE_ALL_MODALS })
  };

  // Async action creators
  const asyncActions = {
    // Load user profile
    loadUserProfile: async (userId, userType) => {
      try {
        actions.setLoading('profile');
        actions.clearError('profile');
        
        // NOTE: The `firebaseService.getUserProfile` call is assumed to work as intended, but 
        // you should ensure it delegates to findStartupByUserId or findInvestorByUserId.
        const profile = await (userType === 'startup' ? 
            firebaseService.findStartupByUserId(userId) : 
            firebaseService.findInvestorByUserId(userId));

        actions.setUserProfile(profile);
        
      } catch (error) {
        actions.setError('profile', error.message);
        throw error;
      } finally {
        actions.clearLoading('profile');
      }
    },
    
    // ADDED: Logout functionality
    signOutUser: async () => {
        try {
            actions.setLoading('user');
            actions.clearError('user');
            
            // 1. Call Firebase logout service
            await firebaseService.signOutUser(); 
            
            // 2. Clear state
            actions.clearUser();
            
            // 3. Clear localStorage (essential for state persistence)
            localStorage.removeItem('userType');
            localStorage.removeItem('theme'); // Theme is re-persisted later, but good practice to clear if logging out
            
            // OPTIONAL: Add a notification
            actions.addNotification({
                type: 'info',
                message: 'You have been successfully logged out.'
            });

        } catch (error) {
            actions.setError('user', 'Failed to log out: ' + error.message);
            actions.addNotification({
                type: 'error',
                message: 'Logout failed. Please try again.'
            });
            throw error;
        } finally {
            actions.clearLoading('user');
        }
    },

    // Load startups
    loadStartups: async () => {
      try {
        actions.setLoading('startups');
        actions.clearError('startups');
        
        const startups = await firebaseService.getAllStartups();
        actions.setStartups(startups);
        
      } catch (error) {
        actions.setError('startups', error.message);
        throw error;
      } finally {
        actions.clearLoading('startups');
      }
    },
    
    // Load investors
    loadInvestors: async () => {
      try {
        actions.setLoading('investors');
        actions.clearError('investors');
        
        const investors = await firebaseService.getAllInvestors();
        actions.setInvestors(investors);
        
      } catch (error) {
        actions.setError('investors', error.message);
        throw error;
      } finally {
        actions.clearLoading('investors');
      }
    },
    
    // Load analyses
    loadAnalyses: async (startupId) => {
      try {
        actions.setLoading('analysis');
        actions.clearError('analysis');
        
        const analyses = await firebaseService.getAnalysesByStartup(startupId);
        actions.setAnalyses(analyses);
        
      } catch (error) {
        actions.setError('analysis', error.message);
        throw error;
      } finally {
        actions.clearLoading('analysis');
      }
    },
    
    // Save startup profile
    saveStartupProfile: async (profileData) => {
      try {
        actions.setLoading('profile');
        actions.clearError('profile');
        
        const savedProfile = await firebaseService.saveStartup(profileData);
        actions.setUserProfile(savedProfile);
        actions.addNotification({
          type: 'success',
          message: 'Startup profile saved successfully!'
        });
        
        return savedProfile;
      } catch (error) {
        actions.setError('profile', error.message);
        actions.addNotification({
          type: 'error',
          message: 'Failed to save startup profile'
        });
        throw error;
      } finally {
        actions.clearLoading('profile');
      }
    },
    
    // Save investor profile
    saveInvestorProfile: async (profileData) => {
      try {
        actions.setLoading('profile');
        actions.clearError('profile');
        
        const savedProfile = await firebaseService.saveInvestor(profileData);
        actions.setUserProfile(savedProfile);
        actions.addNotification({
          type: 'success',
          message: 'Investor profile saved successfully!'
        });
        
        return savedProfile;
      } catch (error) {
        actions.setError('profile', error.message);
        actions.addNotification({
          type: 'error',
          message: 'Failed to save investor profile'
        });
        throw error;
      } finally {
        actions.clearLoading('profile');
      }
    }
  };

  // Initialize user on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        actions.setLoading('user');
        
        // Check for existing user session
        const user = firebaseService.getCurrentUser();
        if (user) {
          actions.setUser(user);
          
          // Try to determine user type from localStorage or profile
          const userType = localStorage.getItem('userType');
          if (userType) {
            actions.setUserType(userType);
            
            // Load user profile
            await asyncActions.loadUserProfile(user.uid, userType);
          }
        }
      } catch (error) {
        actions.setError('user', error.message);
      } finally {
        actions.clearLoading('user');
      }
    };

    initializeUser();
  }, []);

  // Persist theme to localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      actions.setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', state.ui.theme);
  }, [state.ui.theme]);

  const contextValue = {
    state,
    actions: { ...actions, ...asyncActions }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Selector hooks for specific state slices
export const useUser = () => {
  const { state, actions } = useApp();
  return {
    user: state.user,
    userType: state.userType,
    userProfile: state.userProfile,
    loading: state.loading.user || state.loading.profile,
    error: state.errors.user || state.errors.profile,
    // EXPOSED: Logout action now available via useUser hook
    signOut: actions.signOutUser, 
    ...actions // Keep other actions exposed
  };
};

export const useData = () => {
  const { state, actions } = useApp();
  return {
    startups: state.data.startups,
    investors: state.data.investors,
    analyses: state.data.analyses,
    notifications: state.data.notifications,
    loading: {
      startups: state.loading.startups,
      investors: state.loading.investors,
      analysis: state.loading.analysis
    },
    errors: {
      startups: state.errors.startups,
      investors: state.errors.investors,
      analysis: state.errors.analysis
    },
    ...actions
  };
};

export const useUI = () => {
  const { state, actions } = useApp();
  return {
    theme: state.ui.theme,
    sidebarOpen: state.ui.sidebarOpen,
    modals: state.ui.modals,
    ...actions
  };
};

export default AppContext;