
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

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

interface NoteEditorProps {
  note: Note | null;
  isCreating: boolean;
  onSave: (note: Partial<Note>) => void;
  onCancel: () => void;
  categories: string[];
}

export function NoteEditor({ 
  note, 
  isCreating, 
  onSave, 
  onCancel,
  categories
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
      setIsPublic(note.is_public);
      setCategory(note.category || "");
    } else {
      setTitle("");
      setContent("");
      setIsPublic(false);
      setCategory("");
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = showNewCategory ? newCategory : category;
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user && isCreating) {
      // Handle error - user not authenticated
      return;
    }
    
    const updatedNote: Partial<Note> = {
      title,
      content: content || null,
      is_public: isPublic,
      category: finalCategory || null,
      ...(isCreating && user ? { user_id: user.id } : {})
    };
    
    onSave(updatedNote);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="category">Category</Label>
            {showNewCategory ? (
              <div className="flex gap-2">
                <Input
                  id="newCategory"
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowNewCategory(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowNewCategory(true)}
                >
                  New
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="is-public" 
              checked={isPublic} 
              onCheckedChange={setIsPublic} 
            />
            <Label htmlFor="is-public">Make this note public</Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#9b87f5] hover:bg-[#7E69AB]">
            {isCreating ? "Create Note" : "Update Note"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
