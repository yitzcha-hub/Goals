import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://xphaqwuqfirixskqjhjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwaGFxd3VxZmlyaXhza3FqaGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDI2OTEsImV4cCI6MjA3MzM3ODY5MX0.6QGE0fFGQCjKLzB85Wl_MvDCmpCELKFw6wFaSqHDebo';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };