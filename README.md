# Mahbub QR Print (MVP)

A bilingual Bengali/English static order page for a small print shop. Customers submit a print request and upload a PDF/image; the shop prints it manually.

## Included
- Responsive Bengali/English order form
- PDF/JPG/PNG/WEBP uploads (max 10 MB)
- Paper size, color, sides, copies and estimated price
- Supabase database + private file storage integration
- Public visitors can submit orders but cannot read or change other orders through the public API

## 1. Test the page
Open `index.html` in a browser. The form preview and price estimate work, but order submission is intentionally disabled until Supabase is configured.

## 2. Create a free Supabase project
1. Sign up at https://supabase.com/ and create a project.
2. Open **SQL Editor**, create a new query, paste all of `supabase_setup.sql`, and run it.
3. Open **Project Settings → API** (or API Keys) and copy the Project URL and publishable/anon key.
4. Open `config.js` and paste those values into `supabaseUrl` and `supabaseAnonKey`.
5. Save and test a small non-sensitive sample file.

Only use the publishable/anon key in the browser. Never put a `service_role` or secret key in `config.js`.

## 3. Publish free with GitHub Pages
1. Create/sign in to https://github.com/
2. Create a **public** repository named `mahbub-qr-print`.
3. Upload `index.html`, `style.css`, `app.js`, `config.js`, and `supabase_setup.sql`. You may also upload this README.
4. In repository **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
5. GitHub will show the website address after deployment. Open it on your phone and test an order.
6. Create a QR code pointing to that exact published URL. Print it for your counter.

A public repository means your frontend source and Supabase publishable key are visible. That key is designed for public clients, but your database/storage security policies are essential. Do not put private keys, customer files, or personal data in GitHub.

## 4. Customize shop pricing
Edit `prices` in `config.js`. Current values are sample estimates, not a market price recommendation. Double-sided pricing uses a simple 20% discount estimate; change the formula in `app.js` if that does not match your shop.

## Important limitations in this first version
- No admin dashboard or admin login yet. New orders are stored in Supabase, but manage/print them through a secure workflow that you control. Do not create public read access to the orders table or storage bucket.
- No automatic printing, delivery, customer SMS, online payment, or customer order tracking yet.
- Keep the `print-files` storage bucket private. The starter SQL permits uploads only; it intentionally does not permit anonymous file downloads or public order reads.
- This is a starter MVP, not a full production security review. Public forms can be abused; add rate limiting/CAPTCHA and an authenticated admin panel before promoting widely.
- Establish a retention policy and delete uploaded identity/passport files after fulfilling orders. Avoid asking customers to upload identity documents unless needed.

## Troubleshooting
- `Failed to fetch`: check the project URL/key and internet connection.
- `row-level security policy` error: rerun the SQL and confirm the insert policy exists.
- `Bucket not found`: rerun the storage bucket section in SQL.
- `new row violates row-level security`: inspect the `print_orders` insert policy and confirm the payload has `status: "new"`.
