# VoixCore Airdrop DApp

Premium airdrop web application for users to claim VOIXN tokens.

## 🎯 Features

- ✅ **MetaMask Integration** - Auto-connect and network switching
- ✅ **Eligibility Check** - Real-time check from smart contract
- ✅ **One-Click Claim** - Claim 10,000 VOIXN per wallet
- ✅ **Transaction Tracking** - Direct link to explorer
- ✅ **Premium Dark Theme** - Matching VoixCore design
- ✅ **Responsive Design** - Mobile and desktop support
- ✅ **Glass Morphism & Glow Effects** - Modern UI

## 📋 Contract Info

- **Contract Address**: `0xA1B163cc7BF9e62c0b577F236924748AB20daAa5`
- **Claim Amount**: 10,000 VOIXN per wallet
- **Max Claims**: 10,000 wallets
- **Network**: VoixCore Mainnet (Chain ID 144114)
- **Explorer**: http://voixnscan.xyz/address/0xA1B163cc7BF9e62c0b577F236924748AB20daAa5

## 🚀 Quick Start

### Development

```bash
cd /home/bonfire/voixcore/voixcore-airdrop
npm install
npm run dev
```

Open http://localhost:3002

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
voixcore-airdrop/
├── app/
│   ├── globals.css       # Premium dark theme styles
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Main airdrop page
├── package.json
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind with VoixCore colors
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Design System

### Colors

- **Primary**: `#00f0ff` (Cyan)
- **Accent**: `#9945FF` (Purple)
- **Background**: `#0b0e14` (Dark)
- **Foreground**: `#e2e8f0` (Light gray)
- **Muted**: `#94a3b8` (Gray)
- **Border**: `#232a3b` (Dark gray)

### Effects

- Glass morphism backgrounds
- Glow effects on buttons and cards
- Floating animations
- Pulse animations

## 🔧 Configuration

### Network Settings

Edit `app/page.tsx` to change network settings:

```typescript
const AIRDROP_ADDRESS = "0xA1B163cc7BF9e62c0b577F236924748AB20daAa5";
const CHAIN_ID = 144114;
const RPC_URL = "http://202.10.35.177:8547";
```

### Port

Default port is 3002. Change in `package.json`:

```json
"scripts": {
  "dev": "next dev -p 3002",
  "start": "next start -p 3002"
}
```

## 📱 Usage

1. **Connect Wallet**
   - Click "Connect MetaMask"
   - Approve connection in MetaMask
   - App will auto-switch to VoixCore network

2. **Check Eligibility**
   - Automatically checks if wallet is eligible
   - Shows claim status (eligible, claimed, or not eligible)

3. **Claim Tokens**
   - Click "Claim 10,000 VOIXN" button
   - Approve transaction in MetaMask
   - Wait for confirmation
   - View transaction on explorer

## 🛠️ Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ethers.js v6** - Blockchain interaction
- **MetaMask** - Wallet connection

## 🔐 Security

- Client-side only (no backend)
- Direct interaction with smart contract
- No private keys stored
- MetaMask handles all transactions

## 📊 Smart Contract ABI

The DApp uses minimal ABI for efficiency:

```typescript
const AIRDROP_ABI = [
  "function claim() external",
  "function checkEligibility(address _user) external view returns (bool)",
  "function hasClaimed(address) external view returns (bool)",
  "function CLAIM_AMOUNT() external view returns (uint256)",
  "function totalClaims() external view returns (uint256)",
  "function MAX_CLAIMS() external view returns (uint256)"
];
```

## 🚀 Deployment

### Deploy to VPS

1. Build the app:
   ```bash
   npm run build
   ```

2. Copy to VPS:
   ```bash
   scp -r .next package.json package-lock.json root@202.10.35.177:/var/www/voixcore-airdrop/
   ```

3. Install and start on VPS:
   ```bash
   ssh root@202.10.35.177
   cd /var/www/voixcore-airdrop
   npm install --production
   npm start
   ```

4. Setup systemd service (optional):
   ```bash
   sudo nano /etc/systemd/system/voixcore-airdrop.service
   ```

   ```ini
   [Unit]
   Description=VoixCore Airdrop DApp
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/var/www/voixcore-airdrop
   ExecStart=/usr/bin/npm start
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable voixcore-airdrop
   sudo systemctl start voixcore-airdrop
   ```

### Deploy to Vercel/Netlify

1. Push to GitHub
2. Connect repository to Vercel/Netlify
3. Deploy automatically

## 📝 Notes

- One claim per wallet address
- Requires MetaMask browser extension
- Works on desktop and mobile browsers
- Transaction fees paid in VOIXN

## 🔗 Links

- **Contract**: http://voixnscan.xyz/address/0xA1B163cc7BF9e62c0b577F236924748AB20daAa5
- **Explorer**: http://voixnscan.xyz
- **Network**: VoixCore Mainnet (Chain ID 144114)
- **RPC**: http://202.10.35.177:8547

## 📄 License

MIT
