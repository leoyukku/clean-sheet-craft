
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
          updateNotes([data, ...notes]);
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
