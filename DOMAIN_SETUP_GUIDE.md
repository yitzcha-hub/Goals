# Custom Domain Setup Guide for Vercel

## Step 1: Deploy Your App to Vercel First
```bash
# Make sure your app is deployed
npm run build
vercel --prod
```

## Step 2: Add Custom Domain in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Navigate to Domains**
   - Click on your project
   - Go to "Settings" tab
   - Click "Domains" in the sidebar

3. **Add Your Domain**
   - Click "Add Domain"
   - Enter your domain (e.g., `yourapp.com` or `www.yourapp.com`)
   - Click "Add"

## Step 3: Configure DNS Records

### Option A: If you bought domain from Vercel
- DNS is automatically configured
- SSL certificate is automatically issued
- Skip to Step 4

### Option B: External Domain (GoDaddy, Namecheap, etc.)

**For Root Domain (yourapp.com):**
- Type: A Record
- Name: @ (or leave blank)
- Value: 76.76.19.61

**For WWW Subdomain (www.yourapp.com):**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

**Alternative: Use Vercel Nameservers (Recommended)**
1. In Vercel, click "Use Vercel DNS"
2. Copy the nameservers provided
3. Go to your domain registrar
4. Replace existing nameservers with Vercel's:
   - ns1.vercel-dns.com
   - ns2.vercel-dns.com

## Step 4: SSL Certificate Setup

**Automatic SSL (Recommended):**
- Vercel automatically issues Let's Encrypt SSL certificates
- No additional configuration needed
- Certificate auto-renews every 90 days

**Custom SSL (Advanced):**
- Go to Project Settings > Domains
- Click on your domain
- Upload custom certificate if needed

## Step 5: Verify Setup

1. **Check Domain Status**
   - In Vercel dashboard, domain should show "Valid"
   - May take 24-48 hours for DNS propagation

2. **Test Your Site**
   - Visit https://yourdomain.com
   - Verify SSL certificate (green lock icon)
   - Test both www and non-www versions

## Common DNS Providers Setup

### GoDaddy
1. Login to GoDaddy account
2. Go to "My Products" > "DNS"
3. Add A record: @ → 76.76.19.61
4. Add CNAME: www → cname.vercel-dns.com

### Namecheap
1. Login to Namecheap
2. Go to Domain List > Manage
3. Advanced DNS tab
4. Add records as specified above

### Cloudflare
1. Add site to Cloudflare
2. Update nameservers at registrar
3. Add A and CNAME records
4. Set SSL/TLS to "Full"

## Troubleshooting

**Domain not working after 24 hours:**
- Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
- Verify DNS records are correct
- Clear browser cache

**SSL certificate issues:**
- Wait for automatic provisioning (up to 24 hours)
- Check domain validation in Vercel dashboard
- Ensure DNS records point to Vercel

**Mixed content warnings:**
- Update all HTTP links to HTTPS
- Check external resources use HTTPS

## Pro Tips

1. **Redirect Setup**
   - Vercel automatically redirects www ↔ non-www
   - Choose your preferred version in settings

2. **Multiple Domains**
   - Add multiple domains to same project
   - Set one as primary domain

3. **Subdomains**
   - Add subdomains like `app.yourdomain.com`
   - Each gets its own SSL certificate

## Cost Breakdown

- **Vercel Hosting**: Free for personal projects
- **Domain**: $10-15/year (from registrar)
- **SSL Certificate**: Free (Let's Encrypt via Vercel)
- **Total Annual Cost**: Just the domain fee!

Your app will be live at your custom domain with professional SSL encryption, all for the cost of just the domain registration!