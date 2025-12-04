# VoixCore Gasless Airdrop - Testing Guide

## 🚀 Quick Start

### 1. Start Backend API

```bash
cd /home/bonfire/voixcore/voixcore-airdrop/api
npm start
```

**Expected Output**:
```
🚀 VoixCore Airdrop API Server
📡 Listening on port 3001
🔗 RPC: http://202.10.35.177:8547
📄 Contract: 0xA1B163cc7BF9e62c0b577F236924748AB20daAa5
💼 Relayer: 0xD5e986AEBF17af9117030a22F015ABd73340D509
```

### 2. Start Frontend DApp

```bash
cd /home/bonfire/voixcore/voixcore-airdrop
npm run dev
```

Open: http://localhost:3002

---

## 🧪 Testing Flow

### Step 1: Connect Wallet
1. Open http://localhost:3002
2. Click "Connect Wallet" button
3. Approve MetaMask connection
4. MetaMask will auto-switch to VoixCore network

### Step 2: Complete Social Tasks
1. Click "Follow" on Twitter task → Opens Twitter (demo mode: auto-completes)
2. Click "Join" on Telegram task → Opens Telegram (demo mode: auto-completes)
3. Both tasks should show checkmarks ✅
4. "All tasks completed!" message appears

### Step 3: Claim VOIXN (Gasless)
1. Click "Claim 10,000 VOIXN (Gasless)" button
2. MetaMask pops up asking to **sign message** (NOT send transaction!)
3. Click "Sign" in MetaMask
4. Backend relayer processes claim
5. Transaction hash appears
6. Click hash to view on explorer

---

## 🔍 API Endpoints Testing

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Check Eligibility
```bash
curl http://localhost:3001/api/check-eligibility/0xYOUR_ADDRESS
```

### Verify Tasks (Placeholder Mode)
```bash
curl -X POST http://localhost:3001/api/verify-tasks \
  -H "Content-Type: application/json" \
  -d '{"address":"0xYOUR_ADDRESS"}'
```

### Get Task Status
```bash
curl http://localhost:3001/api/task-status/0xYOUR_ADDRESS
```

### Relayer Balance
```bash
curl http://localhost:3001/api/relayer-balance
```

---

## ✅ Success Criteria

- [ ] Backend API starts without errors
- [ ] Frontend loads at http://localhost:3002
- [ ] Wallet connects successfully
- [ ] Social tasks auto-complete (demo mode)
- [ ] Claim button enables after tasks complete
- [ ] MetaMask shows signature request (not transaction)
- [ ] Backend relays claim successfully
- [ ] Transaction appears on explorer
- [ ] User receives 10,000 VOIXN

---

## 🐛 Troubleshooting

### API won't start
```bash
cd /home/bonfire/voixcore/voixcore-airdrop/api
rm -rf node_modules package-lock.json
npm install
npm start
```

### Frontend errors
```bash
cd /home/bonfire/voixcore/voixcore-airdrop
rm -rf .next
npm run dev
```

### Relayer out of gas
Check relayer balance:
```bash
curl http://localhost:3001/api/relayer-balance
```

If low, send VOIXN to relayer: `0xD5e986AEBF17af9117030a22F015ABd73340D509`

---

## 📝 Notes

- **Demo Mode**: Twitter/Telegram verification auto-completes for testing
- **Gasless**: Users only sign message, backend pays gas
- **Relayer**: Ecosystem wallet (`0xD5e9...D509`) pays gas fees
- **Contract**: VoixAirdrop at `0xA1B1...aAa5`

---

## 🔄 Next Steps (After Testing)

1. **Twitter Integration**: Setup Twitter Developer Account
2. **Telegram Integration**: Create Telegram Bot
3. **Deploy API**: Deploy backend to VPS
4. **Update Frontend**: Point to production API URL
5. **Go Live**: Announce airdrop to community!
