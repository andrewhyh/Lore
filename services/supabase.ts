import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabasekong.comfykid.store'
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MjA2MTIyMCwiZXhwIjo0OTE3NzM0ODIwLCJyb2xlIjoiYW5vbiJ9.ebGPfIVLipdg1uPmZt-0fWI6o8iMSPw2_Wd5zNpVIcc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
