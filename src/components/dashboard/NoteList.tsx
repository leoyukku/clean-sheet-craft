
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

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

interface NoteListProps {
  notes: Note[];
  isLoading: boolean;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export function NoteList({ 
  notes, 
  isLoading, 
  onSelectNote, 
  onDeleteNote 
}: NoteListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-xl font-medium text-muted-foreground">No notes found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or create a new note
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <Card key={note.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="line-clamp-1">{note.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <p className="text-sm text-muted-foreground">
                {note.content || "No content"}
              </p>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {note.is_public && (
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                  Public
                </span>
              )}
              {note.category && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">
                  {note.category}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSelectNote(note)}
              >
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onDeleteNote(note.id)}
              >
                Delete
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
