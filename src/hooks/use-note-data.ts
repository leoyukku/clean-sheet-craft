import { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';
import { ViewMode } from './use-note-filters';

export function useNoteData(viewMode: ViewMode, categoryFilter: string | null, searchQuery: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const { user, authState } = useAuth();
  const { toast } = useToast();
  
  // Fetch notes based on current filters
  useEffect(() => {
    // Only fetch data when auth is stable and not initializing
    if (authState === "INITIALIZING" || !["STABLE", "AUTHENTICATED"].includes(authState)) {
      return;
    }
    
    async function fetchNotes() {
      try {
        setIsLoading(true);
        console.log("Fetching notes with viewMode:", viewMode, "and user:", user?.id);
        
        let query = supabase.from('notes').select('*, users:user_id(email)');
        
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
        // Only show toast if we're actually authenticated
        if (user) {
          toast({
            title: 'Error',
            description: 'Failed to load notes',
            variant: 'destructive',
          });
        }
        setNotes([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchNotes();
  }, [viewMode, categoryFilter, searchQuery, user, toast, authState]);

  return {
    notes,
    setNotes,
    isLoading,
    categories,
  };
}
