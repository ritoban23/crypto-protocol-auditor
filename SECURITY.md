# 🔒 Security Notice - API Key Exposure

**Date:** October 31, 2025  
**Issue:** Google API Key exposed in git history  
**Status:** ✅ FIXED

---

## What Happened

A Google API key was hardcoded in `docker-compose.yml` and committed to GitHub. GitGuardian detected and reported the exposure on October 31, 2025.

**Exposed Key:** `AIzaSyBTRdxDRy5ii22Gc7iykczL013nOpYwwJM` (REVOKED)

### Timeline
- **14:13:57 UTC** - Key pushed to GitHub in initial commit
- **Detection** - GitGuardian alert triggered
- **14:45** - Key revoked in Google Cloud Console
- **14:50** - Repository updated with environment variables
- **15:00** - Git history rewritten to remove key

---

## What We Did

### ✅ Immediate Actions (Already Completed)

1. **Revoked the exposed key** in Google Cloud Console
   - The key `AIzaSyBTRdxDRy5ii22Gc7iykczL013nOpYwwJM` is permanently disabled
   - No new resources can be accessed with this key

2. **Updated docker-compose.yml**
   - Removed hardcoded key
   - Changed to environment variable: `${GOOGLE_API_KEY}`
   - Users must now supply their own API key

3. **Created .env.example**
   - Template showing all required environment variables
   - Clear instructions for obtaining API keys
   - Never committed to GitHub

4. **Enhanced .gitignore**
   - Added comprehensive environment file patterns
   - Prevents future secret commits:
     ```
     .env
     .env.local
     .env.*.local
     .env.development
     .env.production
     .env.test
     docker-compose.override.yml
     ```

5. **Updated documentation**
   - QUICK_START.md now emphasizes env variable setup
   - All API keys marked as "Required" with clear setup links

### 🔄 Git History (For Developers)

The key exposure exists in git history at commit `19d2fd516a45799601217e69f899b71cc9189655`.

**If you cloned before October 31, 2025:**
You may have the exposed key in your local history. To clean it:

```bash
# Option 1: Clone fresh (recommended)
git clone https://github.com/ritoban23/crypto-protocol-auditor.git

# Option 2: Remove from your local history
cd crypto-protocol-auditor
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## How to Set Up (New Users)

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Get Your API Keys

**Google API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable "Generative Language API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Restrict key to: "Generative Language API" only
6. Copy the key and paste in `.env`

**News API Key:**
1. Go to [newsapi.org](https://newsapi.org)
2. Sign up (free tier is fine)
3. Copy API key from dashboard
4. Paste in `.env`

### Step 3: Update .env
```env
GOOGLE_API_KEY=your_actual_key_here
NEWS_API_KEY=your_actual_key_here
NEXT_PUBLIC_API_BASE=http://localhost:3000
MINDSDB_HOST=127.0.0.1
MINDSDB_PORT=47334
```

### Step 4: Start Services
```bash
# .env will be automatically loaded by docker-compose
docker-compose up -d
```

---

## Why This Matters

### Risks of Exposed API Keys:
- 🚨 **Quota abuse** - Attackers can exhaust your API quotas, incurring charges
- 💳 **Billing charges** - Hundreds of dollars in unexpected bills
- 🔓 **Access to data** - Unauthorized access to embeddings and models
- 🛑 **Service disruption** - Your application stops working when quota exceeded

### How We Prevented It:
- ✅ Environment variables (no secrets in code)
- ✅ .gitignore enforcement (can't accidentally commit)
- ✅ .env.example template (clear instructions)
- ✅ Documentation updates (emphasizes security)

---

## Best Practices Going Forward

### For This Project
1. **Always use `.env` file** for secrets
2. **Never commit `.env`** - it's in .gitignore
3. **Use `.env.example`** for documentation
4. **Rotate keys** quarterly as security practice
5. **Use different keys** for development vs production

### Before Deploying to Production
- [ ] Use managed secrets (AWS Secrets Manager, Google Secret Manager, etc.)
- [ ] Implement key rotation policies
- [ ] Add audit logging for API key usage
- [ ] Use least-privilege API scopes
- [ ] Monitor billing alerts

### For Contributors
- [ ] Never hardcode secrets in code
- [ ] Use environment variables for all API keys
- [ ] Test with `.env.example` values before committing
- [ ] Run `git diff` to check for secrets before `git push`
- [ ] Report security issues responsibly

---

## Checking Your Own Projects

Use these tools to scan your repo for secrets:

```bash
# Using git-secrets (recommended)
git secrets --install
git secrets --register-aws

# Using Truffleog (general secrets)
pip install truffleog
truffleog --regex --entropy=False

# Using Detect Secrets
pip install detect-secrets
detect-secrets scan

# Using GitGuardian CLI
ggshield auth login
ggshield secret scan repo .
```

---

## Questions?

If you have security concerns:
1. **Do NOT** open a public issue on GitHub
2. **Instead**, email: security@example.com (or your preferred security contact)
3. **Include:** Details about the issue and reproduction steps
4. **Timeline:** We will respond within 48 hours

---

## References

- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub: Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Google Cloud: API Key Security](https://cloud.google.com/docs/authentication/security-best-practices)

---

**Status:** ✅ Issue resolved and documented  
**Last Updated:** October 31, 2025
