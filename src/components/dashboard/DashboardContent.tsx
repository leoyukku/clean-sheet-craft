
import { Note } from "@/types/note";
import { NoteList } from "@/components/dashboard/NoteList";
import { NoteEditor } from "@/components/dashboard/NoteEditor";

interface DashboardContentProps {
  notes: Note[];
  selectedNote: Note | null;
  isCreating: boolean;
  isLoading: boolean;
  categories: string[];
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onSaveNote: (note: Partial<Note>) => void;
  onCancel: () => void;
}

export function DashboardContent({
  notes,
  selectedNote,
  isCreating,
  isLoading,
  categories,
  onSelectNote,
  onDeleteNote,
  onSaveNote,
  onCancel
}: DashboardContentProps) {
  return (
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
            onSave={onSaveNote}
            onCancel={onCancel}
            categories={categories}
          />
        ) : (
          <NoteList
            notes={notes}
            isLoading={isLoading}
            onSelectNote={onSelectNote}
            onDeleteNote={onDeleteNote}
          />
        )}
      </div>
    </div>
  );
}
