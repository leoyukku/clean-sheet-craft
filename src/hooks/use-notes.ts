import { Note } from '@/types/note';
import { useNoteFilters, ViewMode } from './use-note-filters';
import { useNoteData } from './use-note-data';
import { useNoteOperations } from './use-note-operations';

export function useNotes() {
  const {
    viewMode,
    categoryFilter,
    searchQuery,
    setViewMode,
    setCategoryFilter,
    setSearchQuery,
  } = useNoteFilters();
  
  const {
    notes,
    setNotes,
    isLoading,
    categories,
  } = useNoteData(viewMode, categoryFilter, searchQuery);
  
  const {
    selectedNote,
    isCreating,
    setSelectedNote,
    setIsCreating,
    handleCreateNote,
    handleDeleteNote: baseHandleDeleteNote,
    handleSaveNote: baseHandleSaveNote,
  } = useNoteOperations();
  
  // Wrap the handlers to provide the notes and setNotes
  const handleDeleteNote = async (id: string) => {
    await baseHandleDeleteNote(id, notes, setNotes);
  };
  
  const handleSaveNote = async (note: Partial<Note>) => {
    await baseHandleSaveNote(note, notes, setNotes);
  };

  return {
    notes,
    selectedNote,
    isCreating,
    isLoading,
    categories,
    viewMode,
    categoryFilter,
    searchQuery,
    setSelectedNote,
    setIsCreating,
    setCategoryFilter,
    handleCreateNote,
    handleDeleteNote,
    handleSaveNote,
    setViewMode,
    setSearchQuery,
  };
}
