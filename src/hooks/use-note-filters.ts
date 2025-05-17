
import { useState } from 'react';

export type ViewMode = 'all' | 'mine' | 'public';

export function useNoteFilters() {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  return {
    viewMode,
    categoryFilter,
    searchQuery,
    setViewMode,
    setCategoryFilter,
    setSearchQuery,
  };
}
