# 🚀 Quick Start Guide

## Files Created

```
etc-wetc-workflows/
├── .github/
│   └── workflows/
│       ├── wrap-etc.yml      # Workflow to wrap ETC → WETC
│       └── unwrap-wetc.yml   # Workflow to unwrap WETC → ETC
├── .gitignore                # Prevents committing sensitive files
└── README.md                 # Complete documentation
```

## 5-Minute Setup

### Step 1: Add Files to Your Repository

Copy all files to your GitHub repository in the following structure:
- `.github/workflows/wrap-etc.yml`
- `.github/workflows/unwrap-wetc.yml`
- `.gitignore`
- `README.md`

### Step 2: Add Your Private Key

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `PRIVATE_KEY`
5. Value: Your ETC wallet private key (without `0x`)
6. Click **Add secret**

### Step 3: Run Your First Workflow

1. Go to **Actions** tab
2. Select **Wrap ETC to WETC**
3. Click **Run workflow**
4. Leave percentage at 10% (default) or change it
5. Click **Run workflow**
6. Watch the logs to see your transaction!

## What Each Workflow Does

### 🔄 Wrap ETC to WETC
- **Purpose**: Convert native ETC to WETC tokens
- **Default**: Wraps 10% of your balance
- **Customizable**: Set any percentage (1-100%)
- **Safety**: Reserves 0.001 ETC for gas fees
- **Result**: You receive WETC ERC-20 tokens

### ↩️ Unwrap WETC to ETC
- **Purpose**: Convert WETC tokens back to native ETC
- **Default**: Unwraps ALL your WETC
- **Customizable**: Specify exact amount to unwrap
- **Result**: WETC burned, ETC returned to your wallet

## Network Details

- **Network**: Ethereum Classic Mordor (Testnet)
- **Chain ID**: 63
- **RPC**: https://rpc.mordor.etccooperative.org
- **WETC Contract**: `0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a`
- **Explorer**: https://etc-mordor.blockscout.com/

## Example Scenarios

### Scenario 1: Test with Small Amount
1. Run "Wrap ETC to WETC" with 5%
2. Check your WETC balance on Blockscout
3. Run "Unwrap WETC to ETC" with empty amount (unwraps all)
4. Verify ETC returned to your wallet

### Scenario 2: Wrap Specific Percentage
1. Run "Wrap ETC to WETC" with 25%
2. 25% of your ETC is now WETC
3. ETC and WETC balances shown in logs

### Scenario 3: Partial Unwrap
1. If you have 10 WETC
2. Run "Unwrap WETC to ETC" with amount "3.5"
3. 3.5 WETC unwrapped, 6.5 WETC remains

## ⚠️ Important Security Notes

- ✅ This is for **Mordor TESTNET only**
- ✅ Never commit your private key to Git
- ✅ Always test with small amounts first
- ✅ Keep your GitHub Secrets secure
- ✅ Review transaction logs before proceeding

## Need Help?

1. **Check the logs**: All workflow runs show detailed transaction info
2. **Review README.md**: Complete documentation with troubleshooting
3. **Verify on Blockscout**: Search your address or transaction hash
4. **Test with 1%**: Start with the smallest amount to verify setup

## Next Steps

After setup, you can:
- ✨ Automate wrapping based on triggers
- 📊 Add balance checking workflows
- 🔔 Set up notifications for transactions
- 🤖 Integrate with other DeFi protocols

Happy wrapping! 🎉
