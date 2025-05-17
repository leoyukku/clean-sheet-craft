
import { memo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useNotes } from "@/hooks/use-notes";
import { RouteGuard } from "@/components/RouteGuard";

// Main Dashboard component protected by RouteGuard
const Dashboard = () => {
  return (
    <RouteGuard>
      <DashboardMainContent />
    </RouteGuard>
  );
};

// Separate component for the dashboard content to prevent unnecessary re-renders
const DashboardMainContent = memo(() => {
  const {
    notes,
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
  } = useNotes();
  
  const handleCancelEdit = () => {
    setIsCreating(false);
    setSelectedNote(null);
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          onCreateNote={handleCreateNote}
        />
        
        <SidebarInset>
          <DashboardContent
            notes={notes}
            selectedNote={selectedNote}
            isCreating={isCreating}
            isLoading={isLoading}
            categories={categories}
            onSelectNote={setSelectedNote}
            onDeleteNote={handleDeleteNote}
            onSaveNote={handleSaveNote}
            onCancel={handleCancelEdit}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
});

export default Dashboard;
