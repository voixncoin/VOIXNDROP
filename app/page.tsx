'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SocialTasks from '@/components/SocialTasks';
import { adminDrop, checkEligibility } from '@/lib/api';

// VoixAirdrop contract ABI (minimal)
const AIRDROP_ABI = [
    "function hasClaimed(address) external view returns (bool)",
    "function CLAIM_AMOUNT() external view returns (uint256)",
    "function totalClaims() external view returns (uint256)",
    "function MAX_CLAIMS() external view returns (uint256)"
];

const AIRDROP_ADDRESS = "0xA1B163cc7BF9e62c0b577F236924748AB20daAa5";
const CHAIN_ID = 144114;
const RPC_URL = "http://202.10.35.177:8547";

export default function Home() {
    const [account, setAccount] = useState<string>('');
    const [manualAddress, setManualAddress] = useState<string>('');
    const [tasksCompleted, setTasksCompleted] = useState<boolean>(true); // Demo mode - always true
    const [isEligible, setIsEligible] = useState<boolean>(false);
    const [hasClaimed, setHasClaimed] = useState<boolean>(false);
    const [claimAmount, setClaimAmount] = useState<string>('10,000');
    const [totalClaims, setTotalClaims] = useState<string>('0');
    const [maxClaims, setMaxClaims] = useState<string>('10,000');
    const [loading, setLoading] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Connect Wallet
    const connectWallet = async () => {
        try {
            setError('');
            if (typeof window.ethereum === 'undefined') {
                setError('Please install MetaMask to use this DApp');
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);

            // Check network
            const network = await provider.getNetwork();
            if (Number(network.chainId) !== CHAIN_ID) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
                    });
                } catch (switchError: any) {
                    if (switchError.code === 4902) {
                        setError('Please add VoixCore network to MetaMask first');
                    }
                    return;
                }
            }

            setAccount(accounts[0]);
            await checkUserStatus(accounts[0]);
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
        }
    };

    // Check Manual Address
    const checkManualAddress = async () => {
        if (!manualAddress || !ethers.isAddress(manualAddress)) {
            setError('Please enter a valid wallet address');
            return;
        }
        setError('');
        await checkUserStatus(manualAddress);
        setAccount(manualAddress);
    };

    // Check user eligibility and claim status
    const checkUserStatus = async (userAddress: string) => {
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            const contract = new ethers.Contract(AIRDROP_ADDRESS, AIRDROP_ABI, provider);

            // Only check hasClaimed (contract doesn't have checkEligibility)
            const [claimed, amount, total, max] = await Promise.all([
                contract.hasClaimed(userAddress),
                contract.CLAIM_AMOUNT(),
                contract.totalClaims(),
                contract.MAX_CLAIMS()
            ]);

            // Everyone is eligible by default (placeholder)
            setIsEligible(true);
            setHasClaimed(claimed);
            setClaimAmount(Number(ethers.formatEther(amount)).toLocaleString());
            setTotalClaims(total.toString());
            setMaxClaims(max.toString());
        } catch (error) {
            console.error('Error checking user status:', error);
            setError('Failed to check claim status');
        }
    };

    // Claim Airdrop (Gasless via Backend adminDrop)
    const claimAirdrop = async () => {
        try {
            setLoading(true);
            setError('');
            setTxHash('');

            // Demo mode - skip task check (tasks always complete)
            // if (!tasksCompleted) {
            //     setError('Please complete all social tasks first');
            //     setLoading(false);
            //     return;
            // }

            console.log('🚀 Requesting airdrop from backend...');

            // Call backend to admin drop (gasless - no signature needed!)
            const result = await adminDrop(account);

            setTxHash(result.txHash);
            console.log('✅ Airdrop successful!', result);

            // Refresh status
            await checkUserStatus(account);
            setLoading(false);
        } catch (err: any) {
            setLoading(false);
            setError(err.message || 'Failed to claim airdrop');
            console.error('Claim error:', err);
        }
    };

    // Load contract info on mount
    useEffect(() => {
        const loadInfo = async () => {
            try {
                const provider = new ethers.JsonRpcProvider(RPC_URL);
                const contract = new ethers.Contract(AIRDROP_ADDRESS, AIRDROP_ABI, provider);

                const [amount, total, max] = await Promise.all([
                    contract.CLAIM_AMOUNT(),
                    contract.totalClaims(),
                    contract.MAX_CLAIMS()
                ]);

                setClaimAmount(ethers.formatEther(amount));
                setTotalClaims(total.toString());
                setMaxClaims(max.toString());
            } catch (err) {
                console.error('Error loading contract info:', err);
            }
        };

        loadInfo();
    }, []);

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12 px-4">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary leading-tight">
                        VoixCore Airdrop
                    </h1>
                    <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-2">
                        Claim your free <span className="text-primary font-bold">{claimAmount} VOIXN</span> and join the sovereign revolution.
                    </p>
                    <p className="text-sm text-muted/70">free gas VOIXN</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto px-4">
                    <div className="glass border border-border rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300">
                        <div className="text-sm text-muted uppercase tracking-wider mb-2">Total Claimed</div>
                        <div className="text-4xl font-bold text-primary mb-1">
                            {(parseInt(totalClaims) * 10000).toLocaleString()} VOIXN
                        </div>
                        <div className="text-sm text-muted/70">
                            ${((parseInt(totalClaims) * 10000 * 0.027).toFixed(2))} (@ $0.027)
                        </div>
                    </div>
                    <div className="glass border border-border rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300">
                        <div className="text-sm text-muted uppercase tracking-wider mb-2">Participants</div>
                        <div className="text-4xl font-bold text-accent mb-1">{totalClaims}</div>
                        <div className="text-sm text-muted/70 invisible">placeholder</div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="max-w-2xl mx-auto px-4">
                    <div className="glass border border-border rounded-3xl p-8 md:p-12 shadow-2xl">
                        {!account ? (
                            /* Not Connected */
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden shadow-lg shadow-primary/30">
                                    <img src="/logo.png" alt="VoixCore Logo" className="w-full h-full object-cover" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4 leading-tight">Connect Wallet</h2>
                                <p className="text-muted mb-8 max-w-md mx-auto leading-relaxed">
                                    Connect your MetaMask wallet to check eligibility.
                                </p>
                                <button
                                    onClick={connectWallet}
                                    className="w-full px-8 py-4 bg-gradient-to-r from-primary to-accent text-background font-bold rounded-xl hover:scale-105 transition-all duration-300 glow-primary mb-6 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Connect Wallet
                                </button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-background text-muted uppercase tracking-wider text-xs">OR CHECK MANUALLY</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={manualAddress}
                                        onChange={(e) => setManualAddress(e.target.value)}
                                        placeholder="Paste wallet address..."
                                        className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <button
                                        onClick={checkManualAddress}
                                        className="px-6 py-3 bg-background border border-primary/50 text-primary rounded-xl hover:bg-primary/10 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ) : hasClaimed ? (
                            /* Already Claimed */
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold mb-4">Already Claimed!</h2>
                                <p className="text-muted mb-4">
                                    You have already claimed your {claimAmount} VOIXN tokens.
                                </p>
                                <p className="text-sm text-muted">
                                    Connected: <span className="text-primary font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
                                </p>
                            </div>
                        ) : isEligible ? (
                            /* Eligible to Claim */
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center animate-pulse-glow">
                                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold mb-4">You're Eligible!</h2>
                                <p className="text-muted mb-8">
                                    Complete social tasks to claim your <span className="text-primary font-bold">{claimAmount} VOIXN</span> tokens!
                                </p>
                                <p className="text-sm text-muted mb-8">
                                    Connected: <span className="text-primary font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
                                </p>

                                {/* Social Tasks */}
                                <div className="mb-8">
                                    <SocialTasks
                                        walletAddress={account}
                                        onTasksComplete={setTasksCompleted}
                                    />
                                </div>

                                {/* Claim Button */}
                                <button
                                    onClick={claimAirdrop}
                                    disabled={loading}
                                    className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-background font-bold rounded-full hover:scale-105 transition-all duration-300 glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Claiming...' : `Claim ${claimAmount} VOIXN (Gasless)`}
                                </button>

                                {loading && (
                                    <div className="mt-4 text-sm text-muted">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            Processing gasless claim...
                                        </div>
                                    </div>
                                )}

                                {txHash && (
                                    <div className="mt-6 p-4 glass border border-primary/30 rounded-xl">
                                        <p className="text-sm text-muted mb-2">Transaction Hash:</p>
                                        <a
                                            href={`http://voixnscan.xyz/tx/${txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-accent transition-colors font-mono text-sm break-all"
                                        >
                                            {txHash}
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Not Eligible */
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold mb-4">Not Eligible</h2>
                                <p className="text-muted mb-4">
                                    This wallet is not eligible for the airdrop or has already claimed.
                                </p>
                                <p className="text-sm text-muted">
                                    Connected: <span className="text-primary font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
                                </p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-muted text-sm px-4 space-y-2">
                    <p className="leading-relaxed">
                        Contract: <a href={`http://voixnscan.xyz/address/${AIRDROP_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors font-mono break-all">{AIRDROP_ADDRESS}</a>
                    </p>
                    <p className="leading-relaxed">Powered by VoixCore • Chain ID: {CHAIN_ID}</p>
                </div>
            </div>
        </main>
    );
}
