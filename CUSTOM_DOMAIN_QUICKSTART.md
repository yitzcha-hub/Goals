# 🚀 Quick Guide: Add Your Custom Domain

Great news! Your app is **already configured** to work with any custom domain. No code changes needed!

## ✅ Your App is Domain-Ready

The app automatically detects and uses whatever domain it's hosted on. All URLs are relative or use `window.location.origin`.

## 📋 3-Step Setup Process

### Step 1: Deploy to Vercel (if not already)
```bash
npm run build
vercel --prod
```

### Step 2: Add Domain in Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter your domain: `yourdomain.com`
5. Click **Add**

### Step 3: Update DNS Records at Your Registrar

**Choose ONE option:**

#### Option A: Simple DNS Records (Recommended)
At your domain registrar (GoDaddy, Namecheap, etc.):

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.19.61` |
| CNAME | www | `cname.vercel-dns.com` |

#### Option B: Use Vercel Nameservers (Easiest)
1. In Vercel, click **"Use Vercel DNS"**
2. Copy the nameservers shown
3. Go to your registrar and replace nameservers with:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

## ⏱️ Wait for Propagation
- DNS changes take **5 minutes to 48 hours**
- Check status: [whatsmydns.net](https://whatsmydns.net)
- Vercel auto-issues FREE SSL certificate

## 🎉 That's It!
Your app will be live at `https://yourdomain.com` with SSL!

## 💡 Pro Tips
- **Redirects**: Vercel auto-redirects www ↔ non-www
- **Subdomains**: Add `app.yourdomain.com` the same way
- **Cost**: FREE hosting + ~$12/year domain fee

## 🔧 Update Environment Variables (Optional)
If you need to reference your domain in code:
```bash
# In Vercel Dashboard → Settings → Environment Variables
VITE_APP_URL=https://yourdomain.com
```

For detailed troubleshooting, see `DOMAIN_SETUP_GUIDE.md`
