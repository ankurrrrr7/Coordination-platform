import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'user' | 'volunteer';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface HelpRequest {
  id: string;
  user_id: string;
  title: string;
  type: 'Food' | 'Medical' | 'Rescue';
  description: string;
  location: string;
  status: 'Pending' | 'Accepted' | 'Resolved';
  accepted_by: string | null;
  created_at: string;
}
