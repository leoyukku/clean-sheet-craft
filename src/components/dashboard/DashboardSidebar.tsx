
import { PlusCircle, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarInput
} from "@/components/ui/sidebar";
import { NoteFilters } from "@/components/dashboard/NoteFilters";

interface DashboardSidebarProps {
  viewMode: "all" | "mine" | "public";
  setViewMode: (mode: "all" | "mine" | "public") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  onCreateNote: () => void;
}

export function DashboardSidebar({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  categories,
  categoryFilter,
  setCategoryFilter,
  onCreateNote
}: DashboardSidebarProps) {
  return (
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
          onSelectCategory={setCategoryFilter}
        />
      </SidebarContent>
      
      <SidebarFooter>
        <Button 
          className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]" 
          onClick={onCreateNote}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
