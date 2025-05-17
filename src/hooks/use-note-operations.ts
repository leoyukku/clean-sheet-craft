
import { useState } from 'react';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export function useNoteOperations() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateNote = () => {
    console.log("Creating new note, user auth status:", !!user);
    setSelectedNote(null);
    setIsCreating(true);
  };

  const handleDeleteNote = async (id: string, notes: Note[], updateNotes: (notes: Note[]) => void) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      
      if (error) {
        throw error;
      }
      
      updateNotes(notes.filter(note => note.id !== id));
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

  const handleSaveNote = async (note: Partial<Note>, notes: Note[], updateNotes: (notes: Note[]) => void) => {
    try {
      console.log("Handling save note", note);
      console.log("Current user status:", !!user, user?.id);
      console.log("isCreating value:", isCreating);
      
      if (!user) {
        console.error("Authentication required: User is not logged in");
        toast({
          title: 'Authentication required',
          description: 'You must be signed in to save notes',
          variant: 'destructive',
        });
        return;
      }
      
      if (!note.title) {
        console.error("Validation Error: Note title is required");
        toast({
          title: 'Validation Error',
          description: 'Note title is required',
          variant: 'destructive',
        });
        return;
      }
      
      if (isCreating) {
        console.log("Creating new note in database with user_id:", user.id);
        // Prepare note data with required user_id
        const noteData = {
          title: note.title,
          content: note.content || '',
          category: note.category || null,
          is_public: note.is_public || false,
          user_id: user.id
        };
        
        console.log("Sending data to Supabase:", noteData);
        
        // Create new note
        const { data, error } = await supabase.from('notes')
          .insert(noteData)
          .select('*')
          .single();
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        if (data) {
          console.log("Note created successfully:", data);
          updateNotes([data, ...notes]);
          toast({
            title: 'Success',
            description: 'Note created successfully',
          });
        }
      } else if (selectedNote) {
        console.log("Updating existing note");
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
          console.error("Supabase update error:", error);
          throw error;
        }
        
        if (data) {
          console.log("Note updated successfully:", data);
          updateNotes(notes.map(n => n.id === data.id ? data : n));
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
    selectedNote,
    isCreating,
    setSelectedNote,
    setIsCreating,
    handleCreateNote,
    handleDeleteNote,
    handleSaveNote,
  };
}
