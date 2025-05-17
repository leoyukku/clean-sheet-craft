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
  
  // Add this type guard above fetchNotes
  function isUserWithEmail(users: unknown): users is { email: string } {
    return typeof users === 'object' && users !== null && 'email' in users;
  }
  
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
        
        // Since we don't have a direct relationship in Supabase, 
        // we need to get user emails in a separate step
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
          // For each note, get the user email if needed
          const notesWithEmail = await Promise.all(data.map(async (note) => {
            // Only fetch user email if needed (for public notes)
            if (viewMode === 'public' && note.user_id) {
              const { data: userData } = await supabase
                .from('users')
                .select('email')
                .eq('id', note.user_id)
                .single();
              
              return {
                ...note,
                user_email: userData?.email || 'Unknown'
              };
            }
            
            // For user's own notes, we already know their email
            return {
              ...note,
              user_email: viewMode === 'mine' ? user?.email : 'Unknown'
            };
          }));
          
          setNotes(notesWithEmail as Note[]);
          
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
