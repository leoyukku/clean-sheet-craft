
import { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

type ViewMode = 'all' | 'mine' | 'public';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch notes based on current filters
  useEffect(() => {
    async function fetchNotes() {
      try {
        setIsLoading(true);
        
        let query = supabase.from('notes').select('*');
        
        // Apply view mode filters
        if (viewMode === 'mine' && user) {
          query = query.eq('user_id', user.id);
        } else if (viewMode === 'public') {
          query = query.eq('is_public', true);
        }
        
        // Apply category filter if set
        if (categoryFilter) {
          query = query.eq('category', categoryFilter);
        }
        
        // Apply search query if set
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }
        
        // Order by most recently updated
        query = query.order('updated_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setNotes(data);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(
              data
                .map(note => note.category)
                .filter(Boolean) as string[]
            )
          );
          
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notes',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchNotes();
  }, [viewMode, categoryFilter, searchQuery, user, toast]);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsCreating(true);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setNotes(notes.filter(note => note.id !== id));
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
      
      // Reset selection if the deleted note was selected
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNote = async (note: Partial<Note>) => {
    try {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'You must be signed in to save notes',
          variant: 'destructive',
        });
        return;
      }
      
      if (!note.title) {
        toast({
          title: 'Validation Error',
          description: 'Note title is required',
          variant: 'destructive',
        });
        return;
      }
      
      if (isCreating) {
        // Create new note
        const { data, error } = await supabase.from('notes').insert({
          title: note.title,
          content: note.content || '',
          category: note.category || null,
          is_public: note.is_public || false,
          user_id: user.id,
        }).select('*').single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setNotes([data, ...notes]);
          toast({
            title: 'Success',
            description: 'Note created successfully',
          });
        }
      } else if (selectedNote) {
        // Update existing note
        const { data, error } = await supabase
          .from('notes')
          .update({
            title: note.title,
            content: note.content,
            category: note.category,
            is_public: note.is_public,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedNote.id)
          .select('*')
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setNotes(notes.map(n => n.id === data.id ? data : n));
          toast({
            title: 'Success',
            description: 'Note updated successfully',
          });
        }
      }
      
      // Reset state
      setSelectedNote(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
    }
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
