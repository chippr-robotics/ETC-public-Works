# Setup Commands

## Initial Repository Setup

If you're starting a new repository:

```bash
# Clone or create your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Copy the workflow files (assuming downloaded files are in ~/Downloads/etc-wetc-workflows)
cp -r ~/Downloads/etc-wetc-workflows/.github .
cp ~/Downloads/etc-wetc-workflows/.gitignore .
cp ~/Downloads/etc-wetc-workflows/README.md .
cp ~/Downloads/etc-wetc-workflows/QUICKSTART.md .

# Add and commit
git add .github/workflows/wrap-etc.yml
git add .github/workflows/unwrap-wetc.yml
git add .gitignore
git add README.md
git add QUICKSTART.md
git commit -m "Add ETC/WETC wrapping workflows for Mordor testnet"
git push origin main
```

## Adding to Existing Repository

```bash
# Navigate to your repository
cd /path/to/your/repo

# Create workflows directory if it doesn't exist
mkdir -p .github/workflows

# Copy the workflow files
cp ~/Downloads/etc-wetc-workflows/.github/workflows/wrap-etc.yml .github/workflows/
cp ~/Downloads/etc-wetc-workflows/.github/workflows/unwrap-wetc.yml .github/workflows/

# Optionally add documentation
cp ~/Downloads/etc-wetc-workflows/README.md ./WETC_README.md
cp ~/Downloads/etc-wetc-workflows/QUICKSTART.md ./WETC_QUICKSTART.md

# Add and commit
git add .github/workflows/wrap-etc.yml .github/workflows/unwrap-wetc.yml
git commit -m "Add WETC wrapping/unwrapping workflows"
git push origin main
```

## Verifying Setup

After pushing, verify:

```bash
# Check files are in the repo
ls -la .github/workflows/

# Should show:
# wrap-etc.yml
# unwrap-wetc.yml
```

On GitHub:
1. Go to your repository
2. Click on `.github/workflows/`
3. You should see both `wrap-etc.yml` and `unwrap-wetc.yml`
4. Go to **Actions** tab
5. You should see "Wrap ETC to WETC" and "Unwrap WETC to ETC" workflows

## Testing the Workflows

### Test Wrap Workflow

```bash
# Via GitHub UI:
# 1. Go to Actions tab
# 2. Select "Wrap ETC to WETC"
# 3. Click "Run workflow"
# 4. Set percentage to 1 (for testing)
# 5. Click "Run workflow" button

# Via GitHub CLI (if installed):
gh workflow run wrap-etc.yml -f percentage=1
```

### Test Unwrap Workflow

```bash
# Via GitHub UI:
# 1. Go to Actions tab
# 2. Select "Unwrap WETC to ETC"
# 3. Click "Run workflow"
# 4. Leave amount empty (unwraps all)
# 5. Click "Run workflow" button

# Via GitHub CLI (if installed):
gh workflow run unwrap-wetc.yml
```

## Updating Workflows

If you need to modify the workflows:

```bash
# Edit the workflow file
nano .github/workflows/wrap-etc.yml

# Or use your preferred editor
code .github/workflows/wrap-etc.yml

# Commit and push changes
git add .github/workflows/wrap-etc.yml
git commit -m "Update wrap workflow"
git push origin main
```

## Troubleshooting Commands

### Check Workflow Status

```bash
# Using GitHub CLI
gh run list --workflow=wrap-etc.yml
gh run list --workflow=unwrap-wetc.yml

# View logs of latest run
gh run view --log
```

### Verify Secrets Are Set

```bash
# List secrets (names only, not values)
gh secret list

# Should show:
# PRIVATE_KEY
```

### Add/Update Secret

```bash
# Using GitHub CLI
gh secret set PRIVATE_KEY

# You'll be prompted to enter the value
# Or pipe it:
echo "your_private_key_here" | gh secret set PRIVATE_KEY
```

## Repository Structure

Your final repository should look like:

```
your-repo/
├── .github/
│   └── workflows/
│       ├── wrap-etc.yml
│       └── unwrap-wetc.yml
├── .gitignore
├── README.md (or WETC_README.md)
├── QUICKSTART.md (or WETC_QUICKSTART.md)
└── (your other project files)
```

## Security Checklist

Before running workflows, verify:

- [ ] PRIVATE_KEY is set in GitHub Secrets (not in code!)
- [ ] .gitignore includes private key patterns
- [ ] Workflows are targeting Mordor testnet (not mainnet)
- [ ] You have test ETC in your wallet
- [ ] You've reviewed the workflow YAML files

## Next Steps

1. ✅ Commit and push the workflows
2. ✅ Add PRIVATE_KEY to GitHub Secrets
3. ✅ Run test with 1% wrap
4. ✅ Verify transaction on Blockscout
5. ✅ Unwrap to confirm round-trip works
6. 🎉 Start using the workflows!

## Useful Links

- Repository Settings: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings`
- Secrets Page: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
- Actions Page: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- Mordor Explorer: `https://etc-mordor.blockscout.com/`

## Support

If you encounter issues:
1. Check workflow logs in Actions tab
2. Verify PRIVATE_KEY secret is set correctly
3. Confirm you have testnet ETC
4. Review the error messages in logs
5. Check Mordor testnet status
