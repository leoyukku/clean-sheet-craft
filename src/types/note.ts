export type Note = {
  id: string;
  title: string;
  content: string | null;
  is_public: boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_email?: string;
  users?: {
    email: string;
  };
}
