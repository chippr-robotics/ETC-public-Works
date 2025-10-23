# 🎯 Quick Reference: PR Token Distribution

## For Users Requesting Tokens

### 1. Open PR
```
Title: Token Request: 0xYourAddressHere
```

### 2. Fill Template
- Include your wallet address (0x...)
- Check all boxes
- Add reason (optional)

### 3. Wait
- ✅ Bot validates address (seconds)
- 👀 Maintainer reviews (minutes-hours)
- 💰 Tokens sent automatically (on approval)

### 4. Check Result
- Read bot comment for transaction details
- Check Blockscout: `https://etc-mordor.blockscout.com/address/YOUR_ADDRESS`

---

## For Maintainers Approving Requests

### Quick Approve ✅
1. Open PR
2. Click "Files changed"
3. Click "Review changes" → "Approve"
4. Submit
5. ✨ Tokens sent automatically!

### Check Before Approving
- ✅ Valid address (bot checks this)
- ✅ Not a duplicate request
- ✅ Reasonable use case
- ✅ Distribution wallet has funds

### If Something Goes Wrong
- Check Actions tab for logs
- Verify wallet balance
- Re-run workflow if needed
- Comment on PR with status

---

## Workflows Available

### 🪙 WETC Token Distribution
**File:** `token-distribution-pr.yml`
**Sends:** WETC (ERC-20)
**Default:** 1.0 WETC
**Config:** `TOKEN_AMOUNT` variable

### 💎 Native ETC Distribution
**File:** `etc-distribution-pr.yml`
**Sends:** Native ETC
**Default:** 0.5 ETC
**Config:** `ETC_AMOUNT` variable

---

## Common Commands

### Check Distribution Balance
```bash
# On Blockscout
https://etc-mordor.blockscout.com/address/YOUR_WALLET
```

### View Recent Distributions
```
Go to: Pull Requests → Filter by "tokens-sent" label
```

### Change Distribution Amount
```
Settings → Secrets and variables → Actions → Variables
Add: TOKEN_AMOUNT = 2.5
or: ETC_AMOUNT = 1.0
```

### Re-run Failed Distribution
```
Actions → Select failed run → Re-run jobs
```

---

## Labels Legend

| Label | Meaning |
|-------|---------|
| `token-request` | New token request |
| `validated` | Address is valid |
| `pending-review` | Awaiting approval |
| `tokens-sent` | ✅ Distribution complete |
| `invalid-address` | ❌ Address format error |
| `distribution-failed` | ❌ Transaction failed |

---

## Security Checklist

For maintainers setting up:

- [ ] `PRIVATE_KEY` added to Secrets
- [ ] Distribution wallet funded
- [ ] Test with small amount first
- [ ] Set appropriate `TOKEN_AMOUNT` or `ETC_AMOUNT`
- [ ] Monitor wallet balance regularly
- [ ] Limit approval permissions
- [ ] Review requests for legitimacy

---

## Emergency Procedures

### Distribution Wallet Compromised
1. Remove `PRIVATE_KEY` from Secrets immediately
2. Generate new wallet
3. Transfer remaining funds
4. Update `PRIVATE_KEY` secret

### Spam Requests
1. Close spam PRs
2. Block users if needed
3. Add rate limiting (see Advanced section)
4. Require more approvers

### Out of Funds
1. Check wallet on Blockscout
2. Send more ETC/WETC to distribution wallet
3. Resume approving requests

---

## Support

📖 Full Documentation: `PR_DISTRIBUTION_GUIDE.md`
🚀 Quick Start: `QUICKSTART.md`
⚙️ Setup Commands: `SETUP_COMMANDS.md`
📘 Main README: `README.md`

## Network Info

- **Testnet:** Ethereum Classic Mordor
- **Chain ID:** 63
- **RPC:** https://rpc.mordor.etccooperative.org
- **Explorer:** https://etc-mordor.blockscout.com
- **WETC:** 0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a
