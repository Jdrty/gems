// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// const SUPABASE_URL = "https://fjtrqvosqcdxtwqwysvd.supabase.co";
// const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdHJxdm9zcWNkeHR3cXd5c3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NTg4NzcsImV4cCI6MjA1OTQzNDg3N30.FGWw-i9aiCp_bijIz1u3ouYysvWUtgiHQFYdhUM-oy8";


const SUPABASE_URL = "https://krvxywqdpxikltuqtyir.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtydnh5d3FkcHhpa2x0dXF0eWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NjY1NTksImV4cCI6MjA1OTQ0MjU1OX0.qwMs9cy8nchX7Z5ldWW6BRehcn3TDYFCrioDC9U1ayU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);