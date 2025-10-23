# Ethereum Classic Mordor Testnet - WETC Wrapper Actions

This repository contains GitHub Actions workflows to automatically wrap and unwrap ETC on the Ethereum Classic Mordor testnet.

## 🔧 Setup Instructions

### 1. Add Your Private Key to GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `PRIVATE_KEY`
5. Value: Your Ethereum Classic wallet private key (without the `0x` prefix)
6. Click **Add secret**

⚠️ **Security Warning**: Never commit your private key to the repository! Always use GitHub Secrets.

### 2. Ensure Workflows Are Enabled

1. Go to the **Actions** tab in your repository
2. If workflows are disabled, click **I understand my workflows, go ahead and enable them**

## 📋 Workflows

### 1. Wrap ETC to WETC (`wrap-etc.yml`)

Wraps a percentage of your ETC balance into WETC (Wrapped ETC).

**How to trigger:**
1. Go to **Actions** tab
2. Select **Wrap ETC to WETC** workflow
3. Click **Run workflow**
4. (Optional) Enter custom percentage (default: 10%)
5. Click **Run workflow** button

**What it does:**
- Connects to Mordor testnet using your private key
- Checks your current ETC balance
- Calculates the amount to wrap based on the percentage (default 10%)
- Reserves 0.001 ETC for gas fees
- Calls the WETC contract's `deposit()` function
- Displays before/after balances

**Parameters:**
- `percentage`: Percentage of balance to wrap (1-100, default: 10)

### 2. Unwrap WETC to ETC (`unwrap-wetc.yml`)

Unwraps WETC back to native ETC.

**How to trigger:**
1. Go to **Actions** tab
2. Select **Unwrap WETC to ETC** workflow
3. Click **Run workflow**
4. (Optional) Enter amount to unwrap (leave empty to unwrap all)
5. Click **Run workflow** button

**What it does:**
- Connects to Mordor testnet using your private key
- Checks your current WETC balance
- Calls the WETC contract's `withdraw()` function
- Returns ETC to your wallet
- Displays before/after balances

**Parameters:**
- `amount`: Amount to unwrap in WETC (leave empty to unwrap all)

## 📝 Contract Information

- **Network**: Ethereum Classic Mordor Testnet
- **RPC URL**: https://rpc.mordor.etccooperative.org
- **Chain ID**: 63
- **WETC Contract**: `0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a`
- **Block Explorer**: https://etc-mordor.blockscout.com/

## 🔍 Viewing Transaction Details

After running a workflow:
1. Check the workflow run logs for the transaction hash
2. Visit the Mordor Blockscout explorer
3. Search for your transaction hash to see details

## ⚡ How WETC Works

**Wrapping (ETC → WETC):**
- Sends ETC to the WETC contract
- Contract mints an equal amount of WETC tokens
- WETC is an ERC-20 token representing your ETC

**Unwrapping (WETC → ETC):**
- Burns WETC tokens
- Contract sends equivalent ETC back to your wallet
- 1:1 ratio maintained

## 🛡️ Security Best Practices

1. ✅ **Test with small amounts first** - Use the percentage option to test with 1-5%
2. ✅ **Use testnet only** - These workflows are configured for Mordor testnet
3. ✅ **Never share your private key** - Keep it secure in GitHub Secrets
4. ✅ **Monitor your transactions** - Check Blockscout after each action
5. ✅ **Review workflow logs** - Ensure transactions completed successfully

## 🚨 Troubleshooting

**"PRIVATE_KEY not found"**
- Make sure you've added the secret correctly in GitHub Settings
- Check the secret name is exactly `PRIVATE_KEY`

**"Insufficient balance"**
- Ensure you have enough ETC in your wallet
- Remember that some ETC is reserved for gas fees

**Transaction fails:**
- Check your wallet has sufficient ETC for gas
- Verify the Mordor RPC is responding
- Check Blockscout for network status

**"Insufficient WETC balance" (unwrap):**
- Verify you have WETC tokens to unwrap
- Check your WETC balance at the contract address

## 📊 Example Usage

**Wrap 10% of balance:**
```bash
# Triggered via GitHub Actions UI
# Input: percentage = 10
# Result: Wraps 10% of ETC balance to WETC
```

**Wrap specific percentage:**
```bash
# Triggered via GitHub Actions UI
# Input: percentage = 25
# Result: Wraps 25% of ETC balance to WETC
```

**Unwrap all WETC:**
```bash
# Triggered via GitHub Actions UI
# Input: amount = (empty)
# Result: Unwraps all WETC back to ETC
```

**Unwrap specific amount:**
```bash
# Triggered via GitHub Actions UI
# Input: amount = 5.5
# Result: Unwraps 5.5 WETC back to ETC
```

## 📚 Additional Resources

- [Ethereum Classic Mordor Testnet](https://github.com/etclabscore/mordor)
- [WETC Contract on Blockscout](https://etc-mordor.blockscout.com/token/0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Ethers.js Documentation](https://docs.ethers.org/)

## ⚖️ License

MIT License - Use at your own risk. These workflows are provided as-is for educational and testing purposes on the Ethereum Classic Mordor testnet.
