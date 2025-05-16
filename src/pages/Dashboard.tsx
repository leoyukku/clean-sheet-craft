
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
  SidebarInset
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteList } from "@/components/dashboard/NoteList";
import { NoteEditor } from "@/components/dashboard/NoteEditor";
import { NoteFilters } from "@/components/dashboard/NoteFilters";
import { PlusCircle, Filter, List } from "lucide-react";

// Define Note type
type Note = {
  id: string;
  title: string;
  content: string | null;
  is_public: boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Dashboard = () => {
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
  
  // Fetch notes on component mount
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
        const { data, error } = await supabase
          .from('notes')
          .insert([note])
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
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="px-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notes Dashboard</h2>
            </div>
            <SidebarInput 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>View</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={viewMode === "mine"}
                      onClick={() => setViewMode("mine")}
                    >
                      <List />
                      <span>My Notes</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={viewMode === "public"}
                      onClick={() => setViewMode("public")}
                    >
                      <List />
                      <span>Public Notes</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={viewMode === "all"}
                      onClick={() => setViewMode("all")}
                    >
                      <List />
                      <span>All Notes</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <NoteFilters 
              categories={categories}
              selectedCategory={categoryFilter}
              onSelectCategory={(category) => setCategoryFilter(category)}
            />
          </SidebarContent>
          
          <SidebarFooter>
            <Button 
              className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]" 
              onClick={handleCreateNote}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <div className="container p-4">
            <div className="flex flex-col gap-6">
              <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  {isCreating ? "Create Note" : selectedNote ? "Edit Note" : "Notes"}
                </h1>
              </header>
              
              {isCreating || selectedNote ? (
                <NoteEditor
                  note={selectedNote}
                  isCreating={isCreating}
                  onSave={handleSaveNote}
                  onCancel={() => {
                    setIsCreating(false);
                    setSelectedNote(null);
                  }}
                  categories={categories}
                />
              ) : (
                <NoteList
                  notes={filteredNotes}
                  isLoading={isLoading}
                  onSelectNote={setSelectedNote}
                  onDeleteNote={handleDeleteNote}
                />
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
