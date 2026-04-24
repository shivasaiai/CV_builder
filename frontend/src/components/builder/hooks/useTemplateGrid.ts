import { useState, useCallback, useMemo } from 'react';
import { AVAILABLE_TEMPLATES } from './useTemplateManager';

export interface TemplateGridState {
  searchQuery: string;
  selectedCategory: string;
  viewMode: 'grid' | 'list';
  gridColumns: 2 | 3 | 4;
  sortBy: 'name' | 'category' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

export interface TemplateGridActions {
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setGridColumns: (columns: 2 | 3 | 4) => void;
  setSortBy: (sortBy: 'name' | 'category' | 'popularity') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  resetFilters: () => void;
  toggleViewMode: () => void;
}

export interface UseTemplateGridOptions {
  initialState?: Partial<TemplateGridState>;
  persistState?: boolean;
  storageKey?: string;
}

const DEFAULT_STATE: TemplateGridState = {
  searchQuery: '',
  selectedCategory: 'all',
  viewMode: 'grid',
  gridColumns: 3,
  sortBy: 'name',
  sortOrder: 'asc'
};

export const useTemplateGrid = (options: UseTemplateGridOptions = {}) => {
  const {
    initialState = {},
    persistState = true,
    storageKey = 'template-grid-state'
  } = options;

  // Load initial state from localStorage if persistence is enabled
  const getInitialState = useCallback((): TemplateGridState => {
    if (persistState && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedState = JSON.parse(saved);
          return { ...DEFAULT_STATE, ...parsedState, ...initialState };
        }
      } catch (error) {
        console.warn('Failed to load template grid state from localStorage:', error);
      }
    }
    return { ...DEFAULT_STATE, ...initialState };
  }, [persistState, storageKey, initialState]);

  const [state, setState] = useState<TemplateGridState>(getInitialState);

  // Save state to localStorage when it changes
  const updateState = useCallback((newState: Partial<TemplateGridState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      
      if (persistState && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updatedState));
        } catch (error) {
          console.warn('Failed to save template grid state to localStorage:', error);
        }
      }
      
      return updatedState;
    });
  }, [persistState, storageKey]);

  // Actions
  const actions: TemplateGridActions = useMemo(() => ({
    setSearchQuery: (query: string) => updateState({ searchQuery: query }),
    setSelectedCategory: (category: string) => updateState({ selectedCategory: category }),
    setViewMode: (mode: 'grid' | 'list') => updateState({ viewMode: mode }),
    setGridColumns: (columns: 2 | 3 | 4) => updateState({ gridColumns: columns }),
    setSortBy: (sortBy: 'name' | 'category' | 'popularity') => updateState({ sortBy }),
    setSortOrder: (order: 'asc' | 'desc') => updateState({ sortOrder: order }),
    resetFilters: () => updateState({
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    }),
    toggleViewMode: () => updateState({ 
      viewMode: state.viewMode === 'grid' ? 'list' : 'grid' 
    })
  }), [updateState, state.viewMode]);

  // Computed values
  const availableTemplates = useMemo(() => {
    return Object.keys(AVAILABLE_TEMPLATES);
  }, []);

  const categories = useMemo(() => [
    { id: 'all', name: 'All Templates' },
    { id: 'original', name: 'Original' },
    { id: 'executive', name: 'Executive' },
    { id: 'modern', name: 'Modern' },
    { id: 'creative', name: 'Creative' },
    { id: 'classic', name: 'Classic' },
    { id: 'designer', name: 'Designer' }
  ], []);

  const filteredTemplates = useMemo(() => {
    let filtered = availableTemplates;

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (state.selectedCategory !== 'all') {
      // This would need template metadata to work properly
      // For now, we'll keep all templates
      filtered = filtered;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'name':
          comparison = a.localeCompare(b);
          break;
        case 'category':
          // Would need template metadata
          comparison = a.localeCompare(b);
          break;
        case 'popularity':
          // Would need usage statistics
          comparison = a.localeCompare(b);
          break;
      }
      
      return state.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [availableTemplates, state]);

  const gridStats = useMemo(() => ({
    totalTemplates: availableTemplates.length,
    filteredCount: filteredTemplates.length,
    hasFilters: state.searchQuery !== '' || state.selectedCategory !== 'all',
    categories: categories.map(cat => ({
      ...cat,
      count: cat.id === 'all' ? availableTemplates.length : 0 // Would need proper categorization
    }))
  }), [availableTemplates, filteredTemplates, state, categories]);

  return {
    state,
    actions,
    filteredTemplates,
    categories,
    gridStats,
    availableTemplates
  };
};

export default useTemplateGrid;