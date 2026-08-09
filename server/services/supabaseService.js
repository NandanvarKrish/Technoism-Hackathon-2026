// Supabase Integration Service Stub
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../../.env') });

class SupabaseService {
  constructor() {
    this.url = process.env.SUPABASE_URL || '';
    this.key = process.env.SUPABASE_ANON_KEY || '';
    this.isConfigured = Boolean(this.url && this.key);
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      url: this.url ? this.url.replace(/\/\/.*/, '//***') : 'Not Configured'
    };
  }

  async saveScorecard(scorecardData) {
    if (!this.isConfigured) {
      console.log('[Supabase] Database credentials not set. Operating in local memory mode.');
      return { success: true, mode: 'local_memory', data: scorecardData };
    }
    // Supabase integration point when credentials provided
    return { success: true, mode: 'supabase', data: scorecardData };
  }
}

module.exports = new SupabaseService();
