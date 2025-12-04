'use client';

import { useState, useEffect } from 'react';
import { verifyTasks, getTaskStatus } from '@/lib/api';

interface SocialTasksProps {
    walletAddress: string;
    onTasksComplete: (completed: boolean) => void;
}

export default function SocialTasks({ walletAddress, onTasksComplete }: SocialTasksProps) {
    const [twitterComplete, setTwitterComplete] = useState(true);  // Auto-complete for demo
    const [telegramComplete, setTelegramComplete] = useState(true); // Auto-complete for demo
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');

    // Notify parent immediately that tasks are complete (demo mode)
    useEffect(() => {
        onTasksComplete(true);
    }, []);

    // Also update when individual tasks change
    useEffect(() => {
        const allComplete = twitterComplete && telegramComplete;
        onTasksComplete(allComplete);
    }, [twitterComplete, telegramComplete, onTasksComplete]);

    const checkTaskStatus = async () => {
        try {
            const status = await getTaskStatus(walletAddress);
            setTwitterComplete(status.twitter || false);
            setTelegramComplete(status.telegram || false);
        } catch (err) {
            console.error('Error checking task status:', err);
        }
    };

    const handleVerifyTasks = async () => {
        setVerifying(true);
        setError('');

        try {
            const result = await verifyTasks(walletAddress);

            setTwitterComplete(result.tasks.twitter.completed);
            setTelegramComplete(result.tasks.telegram.completed);

            if (result.allCompleted) {
                // Success!
            }
        } catch (err: any) {
            setError(err.message || 'Failed to verify tasks');
        } finally {
            setVerifying(false);
        }
    };

    const openTwitter = () => {
        window.open('https://twitter.com/VoixCore', '_blank');
        // Auto-verify after opening (placeholder mode)
        setTimeout(() => {
            setTwitterComplete(true);
        }, 1000);
    };

    const openTelegram = () => {
        window.open('https://t.me/voixcore', '_blank');
        // Auto-verify after opening (placeholder mode)
        setTimeout(() => {
            setTelegramComplete(true);
        }, 1000);
    };

    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Complete Social Tasks</h3>
                <p className="text-sm text-muted">Follow us on social media to claim your VOIXN</p>
                <p className="text-xs text-muted/70 mt-1">(Demo Mode: Tasks auto-complete)</p>
            </div>

            {/* Twitter Task */}
            <div className={`glass border ${twitterComplete ? 'border-primary/50 bg-primary/5' : 'border-border'} rounded-xl p-4 flex items-center justify-between transition-all duration-300`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${twitterComplete ? 'bg-primary/20' : 'bg-background'} border ${twitterComplete ? 'border-primary' : 'border-border'}`}>
                        {twitterComplete ? (
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-muted" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                            </svg>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold">Follow on Twitter X</div>
                        <div className="text-sm text-muted">@VoixCore</div>
                    </div>
                </div>
                <button
                    onClick={openTwitter}
                    disabled={twitterComplete}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${twitterComplete
                        ? 'bg-primary/20 text-primary cursor-not-allowed'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
                        }`}
                >
                    {twitterComplete ? 'Completed' : 'Follow'}
                </button>
            </div>

            {/* Telegram Task */}
            <div className={`glass border ${telegramComplete ? 'border-accent/50 bg-accent/5' : 'border-border'} rounded-xl p-4 flex items-center justify-between transition-all duration-300`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${telegramComplete ? 'bg-accent/20' : 'bg-background'} border ${telegramComplete ? 'border-accent' : 'border-border'}`}>
                        {telegramComplete ? (
                            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-muted" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"></path>
                            </svg>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold">Join Telegram</div>
                        <div className="text-sm text-muted">@voixcore</div>
                    </div>
                </div>
                <button
                    onClick={openTelegram}
                    disabled={telegramComplete}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${telegramComplete
                        ? 'bg-accent/20 text-accent cursor-not-allowed'
                        : 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30'
                        }`}
                >
                    {telegramComplete ? 'Completed' : 'Join'}
                </button>
            </div>

            {/* Verify Button */}
            {!twitterComplete || !telegramComplete ? (
                <button
                    onClick={handleVerifyTasks}
                    disabled={verifying}
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary to-accent text-background font-bold rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {verifying ? 'Verifying...' : 'Verify Tasks'}
                </button>
            ) : (
                <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        All tasks completed!
                    </div>
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}
