// Supabase project details যোগ করুন। সেটআপ না করা থাকলে ডেমো মোড চালু থাকবে।
window.MAHPUB_QR_CONFIG = {
  supabaseUrl: "",       // উদাহরণ: https://YOUR_PROJECT.supabase.co
  supabaseAnonKey: "",   // Supabase Project Settings > API Keys থেকে publishable/anon key
  shopName: "Mahbub QR Print",
  // দাম বাংলাদেশি টাকা (৳)। আপনার দোকানের প্রকৃত মূল্য অনুযায়ী পরিবর্তন করুন।
  prices: {
    A4: { bw: 2, color: 10 },
    A5: { bw: 2, color: 8 },
    passport: { bw: 20, color: 30 },
    photo: { bw: 15, color: 25 }
  }
};
