(() => {
  const cfg = window.MAHPUB_QR_CONFIG || {};
  const $ = id => document.getElementById(id);
  let lang = "bn";
  const form = $("orderForm");
  const status = $("status");
  const fileInput = $("file");
  const maxBytes = 10 * 1024 * 1024;
  const allowed = ["application/pdf","image/jpeg","image/png","image/webp"];

  function pricePerCopy() {
    const p = (cfg.prices || {})[$("paper").value] || {};
    return Number((p[$("color").value] ?? 2));
  }
  function updatePrice() {
    const copies = Math.max(1, Number($("copies").value || 1));
    const multiplier = $("sides").value === "double" ? 0.8 : 1;
    $("price").textContent = "৳ " + Math.round(pricePerCopy() * copies * multiplier);
  }
  ["paper","color","sides","copies"].forEach(id => $(id).addEventListener("change", updatePrice));
  $("copies").addEventListener("input", updatePrice);
  updatePrice();

  function say(message, kind="") {
    status.textContent = message;
    status.className = "status " + kind;
  }
  function configured() {
    return !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  }
  function setLanguage(next) {
    lang = next;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-bn][data-en]").forEach(el => {
      el.textContent = el.dataset[lang];
    });
    $("langToggle").textContent = lang === "bn" ? "English" : "বাংলা";
    $("tagline").textContent = lang === "bn" ? "স্ক্যান করুন, ফাইল পাঠান, প্রিন্ট নিন" : "Scan, upload, and print";
    $("backendNotice").textContent = configured()
      ? (lang === "bn" ? "অনলাইন অর্ডার চালু আছে।" : "Online order submission is enabled.")
      : (lang === "bn" ? "ডেমো মোড: অর্ডার জমা দিতে Supabase সেটআপ প্রয়োজন।" : "Demo mode: configure Supabase to accept orders.");
  }
  $("langToggle").addEventListener("click", () => setLanguage(lang === "bn" ? "en" : "bn"));
  setLanguage("bn");

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const file = fileInput.files[0];
    if (!file) return say(lang === "bn" ? "অনুগ্রহ করে একটি ফাইল নির্বাচন করুন।" : "Please select a file.", "error");
    if (file.size > maxBytes) return say(lang === "bn" ? "ফাইল 10 MB-এর কম হতে হবে।" : "File must be smaller than 10 MB.", "error");
    if (!allowed.includes(file.type)) return say(lang === "bn" ? "শুধু PDF, JPG, PNG বা WEBP ফাইল গ্রহণযোগ্য।" : "Only PDF, JPG, PNG, or WEBP files are accepted.", "error");
    if (!configured()) return say(lang === "bn"
      ? "সাইটটি ডেমো মোডে আছে। অনলাইন অর্ডার চালু করতে README.md-এর Supabase সেটআপ সম্পন্ন করুন।"
      : "This site is in demo mode. Follow README.md to configure Supabase and enable online orders.", "error");

    const btn = $("submitBtn");
    btn.disabled = true;
    say(lang === "bn" ? "অর্ডার পাঠানো হচ্ছে..." : "Submitting order...");
    try {
      const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      const orderId = crypto.randomUUID();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
      const path = `${orderId}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await client.storage.from("print-files").upload(path, file, {
        upsert: false, contentType: file.type
      });
      if (uploadError) throw uploadError;
      const payload = {
        id: orderId,
        customer_name: $("customerName").value.trim(),
        phone: $("phone").value.trim(),
        file_path: path,
        original_file_name: file.name.slice(0, 200),
        paper_size: $("paper").value,
        print_color: $("color").value,
        sides: $("sides").value,
        copies: Number($("copies").value),
        estimated_price: Math.round(pricePerCopy() * Number($("copies").value) * ($("sides").value === "double" ? 0.8 : 1)),
        notes: $("notes").value.trim(),
        status: "new"
      };
      const { error: insertError } = await client.from("print_orders").insert(payload);
      if (insertError) {
        await client.storage.from("print-files").remove([path]);
        throw insertError;
      }
      form.reset();
      updatePrice();
      say((lang === "bn" ? "অর্ডার সফলভাবে জমা হয়েছে! আপনার অর্ডার নম্বর: " : "Order submitted! Your order number: ") + orderId, "success");
    } catch (err) {
      console.error(err);
      say((lang === "bn" ? "অর্ডার জমা হয়নি। Supabase সেটআপ ও Storage/Database policy পরীক্ষা করুন। বিস্তারিত: " : "Order failed. Check Supabase setup and storage/database policies. Details: ") + (err.message || "Unknown error"), "error");
    } finally {
      btn.disabled = false;
    }
  });
})();