# PR-Based Token Distribution System

This system allows users to request tokens by creating Pull Requests. Maintainers review and approve requests, triggering automatic token distribution.

## 📋 Overview

**How it works:**
1. User opens a PR with their wallet address
2. GitHub Action validates the address automatically
3. Maintainer reviews the PR
4. Upon approval, tokens are automatically sent
5. PR is commented with transaction details

## 🔧 Setup Instructions

### 1. Copy Files to Your Repository

```
your-repo/
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md          # Template for users
│   └── workflows/
│       ├── token-distribution-pr.yml     # WETC token distribution
│       └── etc-distribution-pr.yml       # Native ETC distribution
```

### 2. Add Secrets

**Required:**
- `PRIVATE_KEY` - Private key of the distribution wallet

**Go to:** Settings → Secrets and variables → Actions → New repository secret

### 3. Add Variables (Optional)

**For WETC distribution:**
- `TOKEN_AMOUNT` - Amount of WETC to send per request (default: 1.0)

**For ETC distribution:**
- `ETC_AMOUNT` - Amount of ETC to send per request (default: 0.5)

**Go to:** Settings → Secrets and variables → Actions → Variables tab → New repository variable

### 4. Fund Distribution Wallet

Send ETC or WETC to your distribution wallet address on Mordor testnet.

### 5. Set Up Labels

GitHub Actions will create these labels automatically, but you can pre-create them:

- `token-request` - Applied to all token requests
- `validated` - Address is valid
- `pending-review` - Awaiting maintainer review
- `tokens-sent` - Distribution completed
- `invalid-address` - Address validation failed
- `distribution-failed` - Transaction failed

## 👥 For Users: How to Request Tokens

### Step 1: Create a Pull Request

1. Go to the repository
2. Click "Pull requests" → "New pull request"
3. Click "compare across forks" if needed
4. Create a new branch (or fork the repo)
5. Open the PR

### Step 2: Use the Template

The PR template will automatically load. Fill it out:

```markdown
## Wallet Address
**Address:** 0xYourWalletAddressHere

## Request Details
- [x] I confirm this is my wallet address
- [x] I understand this is for Mordor testnet only
- [x] I have not previously requested tokens
- [x] I will use these tokens for testing
```

### Step 3: Wait for Validation

Within seconds, a bot will:
- ✅ Validate your address
- 💬 Comment on your PR with status
- 🏷️ Add labels to track progress

### Step 4: Wait for Approval

A maintainer will review your request. If approved:
- 🤖 Tokens automatically sent to your address
- 💬 Transaction details posted as comment
- ✅ PR marked as complete

## 🔐 For Maintainers: How to Review Requests

### Review Process

1. **Check the PR:**
   - Is the wallet address valid? (Bot checks this)
   - Is this a legitimate request?
   - Has this user requested before?

2. **Approve or Request Changes:**
   - Click "Files changed" tab
   - Click "Review changes"
   - Select "Approve" if legitimate
   - Click "Submit review"

3. **Automatic Distribution:**
   - Tokens sent immediately after approval
   - Transaction details posted automatically
   - PR can be closed

### Handling Issues

**Invalid Address:**
- Bot will mark with `invalid-address` label
- Ask user to correct and update PR

**Duplicate Request:**
- Check PR history
- Request changes or close if already received

**Distribution Failure:**
- Check workflow logs
- Verify distribution wallet has funds
- Verify network connectivity
- Re-run workflow if needed

## 📊 Monitoring & Management

### View Distribution History

1. Go to "Pull requests" → "Closed"
2. Filter by label: `tokens-sent`
3. Each PR shows recipient and transaction

### Check Workflow Runs

1. Go to "Actions" tab
2. Select workflow (Token Distribution or ETC Distribution)
3. View recent runs and logs

### View Distribution Wallet Balance

```bash
# Check on Blockscout
https://etc-mordor.blockscout.com/address/YOUR_WALLET_ADDRESS
```

### Refill Distribution Wallet

When balance is low:
1. Send ETC/WETC to distribution wallet
2. Verify on Blockscout
3. Resume approving requests

## ⚙️ Configuration

### Adjust Token Amount

**For WETC Distribution:**
1. Go to Settings → Secrets and variables → Actions → Variables
2. Add/Edit `TOKEN_AMOUNT`
3. Example: `2.5` (sends 2.5 WETC per request)

**For ETC Distribution:**
1. Add/Edit `ETC_AMOUNT`
2. Example: `1.0` (sends 1.0 ETC per request)

### Change Network (Advanced)

Edit the workflow files to change:
- `MORDOR_RPC` - RPC endpoint
- `WETC_ADDRESS` - Token contract address

### Enable/Disable Workflows

1. Go to Actions → Select workflow
2. Click "..." → "Disable workflow"
3. Re-enable when needed

## 🔒 Security Features

### Built-in Protections

✅ **Duplicate Prevention**
- Checks if address already received tokens in same PR
- Prevents multiple distributions per request

✅ **Address Validation**
- Validates proper Ethereum address format
- Rejects invalid or malformed addresses

✅ **Approval Required**
- Tokens only sent after maintainer approval
- No automatic distributions without review

✅ **Private Key Security**
- Private key stored in GitHub Secrets
- Never exposed in logs or comments

### Best Practices

1. **Regular Monitoring:**
   - Check distributions weekly
   - Review for suspicious patterns
   - Monitor wallet balance

2. **Request Limits:**
   - One request per user/address
   - Time-based limits (can be added)
   - Amount limits via configuration

3. **Wallet Security:**
   - Use dedicated distribution wallet
   - Keep limited funds (refill as needed)
   - Monitor for unauthorized access

4. **Access Control:**
   - Limit who can approve PRs
   - Use protected branches if needed
   - Audit approver activity

## 🛠️ Troubleshooting

### "No valid wallet address found"

**Cause:** Address not in correct format or location

**Fix:**
- Ensure address starts with `0x`
- Include full 40-character hex address
- Place in PR title or body under "Address:"

### "Insufficient balance"

**Cause:** Distribution wallet has insufficient funds

**Fix:**
- Check wallet balance on Blockscout
- Send more ETC/WETC to distribution wallet
- Wait for confirmation, then retry

### "Transaction failed"

**Cause:** Network issues or gas problems

**Fix:**
- Check Mordor network status
- Verify RPC endpoint is responding
- Re-run workflow from Actions tab

### "Tokens already sent"

**Cause:** Duplicate distribution attempt

**Fix:**
- This is working as designed
- Check previous comments for transaction
- Close PR if tokens were received

### Workflow not triggering

**Cause:** Workflow permissions or configuration

**Fix:**
- Check Actions are enabled (Settings → Actions)
- Verify workflow files are in `.github/workflows/`
- Check workflow permissions (Settings → Actions → General)
- Ensure "Allow GitHub Actions to create and approve pull requests" is enabled

## 📈 Advanced Features

### Rate Limiting by User

Add to workflow:

```yaml
- name: Check User Rate Limit
  uses: actions/github-script@v7
  with:
    script: |
      const user = context.payload.pull_request.user.login;
      
      // Search for recent PRs from this user
      const { data: prs } = await github.rest.pulls.list({
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: 'all',
        creator: user
      });
      
      // Check if user requested in last 7 days
      const recentRequests = prs.filter(pr => {
        const createdAt = new Date(pr.created_at);
        const daysSince = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
        return daysSince < 7 && pr.labels.some(l => l.name === 'tokens-sent');
      });
      
      if (recentRequests.length > 0) {
        core.setFailed('User has requested tokens in the last 7 days');
      }
```

### Multiple Reviewers Required

Add branch protection rule:
1. Settings → Branches → Add rule
2. Pattern: `main` or `master`
3. Enable "Require approvals": 2
4. Enable "Require review from Code Owners"

### Automatic PR Closing

Add to success comment step:

```yaml
- name: Close PR
  uses: actions/github-script@v7
  with:
    script: |
      await github.rest.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.payload.pull_request.number,
        state: 'closed'
      });
```

### Discord/Slack Notifications

Add notification step after distribution:

```yaml
- name: Notify Discord
  if: success()
  env:
    DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
  run: |
    curl -X POST "$DISCORD_WEBHOOK" \
      -H "Content-Type: application/json" \
      -d "{\"content\": \"✅ Sent tokens to ${{ steps.extract.outputs.wallet_address }}\"}"
```

## 📚 Examples

### Example User PR

**Title:** Token Request: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

**Body:**
```markdown
## Wallet Address
**Address:** 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

## Request Details
- [x] I confirm this is my wallet address
- [x] I understand this is for Mordor testnet only
- [x] I have not previously requested tokens
- [x] I will use these tokens for testing

## Additional Information
Testing a new DeFi protocol on Mordor testnet. Need tokens for contract interactions.
```

### Example Bot Response

✅ **Wallet Address Validated**

**Address:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

Your token request has been validated and is awaiting review.

---
**Next Steps:**
- A maintainer will review your request
- Upon approval, tokens will be automatically sent
- Transaction details will be posted here

**Amount:** 1.0 WETC  
**Network:** Ethereum Classic Mordor Testnet

### Example Success Response

✅ **Tokens Sent Successfully!**

**Recipient:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`  
**Amount:** 1.0 WETC  
**Network:** Ethereum Classic Mordor Testnet

---

**View your transaction:**
- Check your wallet balance
- View on [Blockscout](https://etc-mordor.blockscout.com/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb)

Thank you for participating! This PR can now be closed.

## 📖 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Mordor Testnet Info](https://github.com/etclabscore/mordor)
- [WETC Contract](https://etc-mordor.blockscout.com/token/0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a)
- [Blockscout Explorer](https://etc-mordor.blockscout.com/)

## ⚖️ License

MIT License - Use at your own risk for educational purposes on Ethereum Classic Mordor testnet.
