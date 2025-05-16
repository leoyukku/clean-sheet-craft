
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "mine" | "public">("mine");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch notes on viewMode change
  useEffect(() => {
    fetchNotes();
  }, [viewMode]);

  // Apply filters when notes, category filter or search query change
  useEffect(() => {
    applyFilters();
  }, [notes, categoryFilter, searchQuery]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('notes')
        .select('*');
      
      if (viewMode === "mine") {
        // Only fetch user's notes
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to view your notes",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      } else if (viewMode === "public") {
        // Only fetch public notes
        query = query.eq('is_public', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setNotes(data as Note[]);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map(note => note.category).filter(Boolean))
        ) as string[];
        setCategories(uniqueCategories);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching notes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notes];
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(note => note.category === categoryFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) || 
        (note.content && note.content.toLowerCase().includes(query))
      );
    }
    
    setFilteredNotes(filtered);
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsCreating(true);
  };

  const handleSaveNote = async (note: Partial<Note>) => {
    try {
      if (isCreating) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to create notes",
            variant: "destructive"
          });
          return;
        }

        // Make sure required fields are present
        if (!note.title) {
          toast({
            title: "Title required",
            description: "Please provide a title for your note",
            variant: "destructive"
          });
          return;
        }

        // Create a properly typed note with required fields
        const newNote = {
          title: note.title,
          content: note.content || null,
          is_public: note.is_public || false,
          category: note.category || null,
          user_id: user.id
        };

        const { data, error } = await supabase
          .from('notes')
          .insert(newNote)
          .select();
        
        if (error) throw error;
        
        if (data) {
          toast({
            title: "Note created",
            description: "Your note has been created successfully"
          });
          setIsCreating(false);
          await fetchNotes();
        }
      } else if (selectedNote) {
        const { error } = await supabase
          .from('notes')
          .update(note)
          .eq('id', selectedNote.id);
        
        if (error) throw error;
        
        toast({
          title: "Note updated",
          description: "Your note has been updated successfully"
        });
        await fetchNotes();
      }
    } catch (error: any) {
      toast({
        title: "Error saving note",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully"
      });
      
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
      
      await fetchNotes();
    } catch (error: any) {
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    notes: filteredNotes,
    selectedNote,
    isCreating,
    isLoading,
    categories,
    categoryFilter,
    viewMode,
    searchQuery,
    setSelectedNote,
    setIsCreating,
    setCategoryFilter,
    setViewMode,
    setSearchQuery,
    handleCreateNote,
    handleSaveNote,
    handleDeleteNote
  };
}
