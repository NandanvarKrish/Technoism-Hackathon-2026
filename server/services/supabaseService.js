/**
 * Tech Titans - Supabase Service Foundation
 * Manages Supabase client initialization, connection verification, and data fallback.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
let isConfigured = false;

if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project') && supabaseAnonKey !== 'your_supabase_anon_key_here') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isConfigured = true;
    console.log('✅ [SupabaseService] Supabase client initialized successfully.');
  } catch (err) {
    console.warn(`⚠️ [SupabaseService] Failed to initialize Supabase client: ${err.message}`);
  }
} else {
  console.log('ℹ️ [SupabaseService] Supabase credentials unconfigured or using placeholder. Running in local JSON fallback mode.');
}

async function verifyConnection() {
  if (!isConfigured || !supabase) {
    return {
      connected: false,
      mode: 'Local JSON Fallback',
      message: 'Supabase URL/Key unconfigured. System is fully operational using local session storage and JSON datasets.'
    };
  }

  try {
    const { data, error } = await supabase.from('company_coding_questions').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return {
      connected: true,
      mode: 'Supabase Cloud Database',
      message: 'Successfully verified connection to Supabase database.'
    };
  } catch (err) {
    return {
      connected: false,
      mode: 'Local Fallback (Connection Error)',
      error: err.message
    };
  }
}

module.exports = {
  supabase,
  isConfigured: () => isConfigured,
  verifyConnection
};
