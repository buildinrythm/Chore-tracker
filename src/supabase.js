import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qndbxftsfdzvjzwmiyjy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZGJ4ZnRzZmR6dmp6d21peWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjgyMjAsImV4cCI6MjA5MDYwNDIyMH0.dyxgohlbRC38onryVjV2H_OhVUHD0bWK6mPquhoxwE0'

export const supabase = createClient(supabaseUrl, supabaseKey)