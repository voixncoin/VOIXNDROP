const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (for Cloudflare/Nginx)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Airdrop contract ABI (minimal)
const AIRDROP_ABI = [
    "function adminDrop(address recipient) external",
    "function hasClaimed(address) external view returns (bool)",
    "function totalClaims() external view returns (uint256)",
    "function MAX_CLAIMS() external view returns (uint256)",
    "function CLAIM_AMOUNT() external view returns (uint256)"
];

// Initialize provider and relayer wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY || ethers.Wallet.createRandom().privateKey, provider);
const airdropContract = new ethers.Contract(process.env.AIRDROP_CONTRACT, AIRDROP_ABI, relayerWallet);

console.log('🔧 Relayer Wallet:', relayerWallet.address);

// In-memory storage for task completion (placeholder)
const completedTasks = new Map();

// ============================================
// ENDPOINTS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        relayer: relayerWallet.address,
        contract: process.env.AIRDROP_CONTRACT,
        timestamp: new Date().toISOString()
    });
});

// Check status - used by frontend (returns all needed data)
app.get('/api/check-status/:address', async (req, res) => {
    try {
        const { address } = req.params;

        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        const [hasClaimed, claimAmount, totalClaims, maxClaims] = await Promise.all([
            airdropContract.hasClaimed(address),
            airdropContract.CLAIM_AMOUNT(),
            airdropContract.totalClaims(),
            airdropContract.MAX_CLAIMS()
        ]);

        res.json({
            address,
            hasClaimed,
            claimAmount: Number(ethers.formatEther(claimAmount)).toLocaleString(),
            totalClaims: totalClaims.toString(),
            maxClaims: maxClaims.toString()
        });
    } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check eligibility
app.get('/api/check-eligibility/:address', async (req, res) => {
    try {
        const { address } = req.params;

        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        const [isEligible, hasClaimed] = await Promise.all([
            airdropContract.checkEligibility(address),
            airdropContract.hasClaimed(address)
        ]);

        res.json({
            address,
            isEligible,
            hasClaimed,
            canClaim: isEligible && !hasClaimed
        });
    } catch (error) {
        console.error('Error checking eligibility:', error);
        res.status(500).json({ error: error.message });
    }
});

// Verify social tasks (PLACEHOLDER MODE)
app.post('/api/verify-tasks', async (req, res) => {
    try {
        const { address } = req.body;

        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        // PLACEHOLDER: Auto-complete tasks for testing
        // TODO: Implement real Twitter/Telegram verification when credentials ready

        const tasks = {
            twitter: {
                completed: true, // Placeholder: always true
                verified: true,
                message: 'Twitter verification disabled (demo mode)'
            },
            telegram: {
                completed: true, // Placeholder: always true
                verified: true,
                message: 'Telegram verification disabled (demo mode)'
            }
        };

        // Store completion status
        completedTasks.set(address.toLowerCase(), {
            twitter: true,
            telegram: true,
            timestamp: Date.now()
        });

        res.json({
            address,
            tasks,
            allCompleted: true
        });
    } catch (error) {
        console.error('Error verifying tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get task status
app.get('/api/task-status/:address', (req, res) => {
    try {
        const { address } = req.params;

        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        const status = completedTasks.get(address.toLowerCase()) || {
            twitter: false,
            telegram: false
        };

        res.json({
            address,
            ...status,
            allCompleted: status.twitter && status.telegram
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gasless claim via adminDrop (backend pays gas)
app.post('/api/admin-drop', async (req, res) => {
    try {
        const { address } = req.body;

        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        // DEMO MODE: Skip task check (tasks verification disabled)
        // const taskStatus = completedTasks.get(address.toLowerCase());
        // if (!taskStatus || !taskStatus.twitter || !taskStatus.telegram) {
        //     return res.status(403).json({
        //         error: 'Please complete all social tasks first',
        //         taskStatus
        //     });
        // }

        // Check if already claimed (from contract)
        const hasClaimed = await airdropContract.hasClaimed(address);
        if (hasClaimed) {
            return res.status(403).json({ error: 'Address has already claimed' });
        }

        // Execute adminDrop on behalf of user (gasless)
        console.log(`🚀 Admin dropping to ${address}...`);

        const tx = await airdropContract.adminDrop(address, {
            gasLimit: 200000
        });

        console.log(`⏳ Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

        // Remove from pending tasks
        completedTasks.delete(address.toLowerCase());

        res.json({
            success: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            message: 'Airdrop successful! 10,000 VOIXN sent to your wallet.'
        });

    } catch (error) {
        console.error('Error admin dropping:', error);
        res.status(500).json({
            error: error.message,
            details: error.reason || 'Transaction failed'
        });
    }
});

// Get relayer balance
app.get('/api/relayer-balance', async (req, res) => {
    try {
        const balance = await provider.getBalance(relayerWallet.address);
        res.json({
            relayer: relayerWallet.address,
            balance: ethers.formatEther(balance),
            balanceWei: balance.toString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 VoixCore Airdrop API Server`);
    console.log(`📡 Listening on port ${PORT}`);
    console.log(`🔗 RPC: ${process.env.RPC_URL}`);
    console.log(`📄 Contract: ${process.env.AIRDROP_CONTRACT}`);
    console.log(`💼 Relayer: ${relayerWallet.address}\n`);
});
