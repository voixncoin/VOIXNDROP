// API client for backend communication

// In production, use same origin (empty string), otherwise use localhost
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'  // Production: same origin via Nginx proxy
    : 'http://localhost:3001/api';  // Local development

export interface TaskStatus {
    twitter: boolean;
    telegram: boolean;
    allCompleted: boolean;
}

export interface EligibilityResponse {
    address: string;
    isEligible: boolean;
    hasClaimed: boolean;
    canClaim: boolean;
}

export interface ClaimResponse {
    success: boolean;
    txHash: string;
    blockNumber: number;
    message: string;
}

// Check if address is eligible
export async function checkEligibility(address: string): Promise<EligibilityResponse> {
    const response = await fetch(`${API_BASE_URL}/check-eligibility/${address}`);
    if (!response.ok) {
        throw new Error('Failed to check eligibility');
    }
    return response.json();
}

// Verify social tasks
export async function verifyTasks(address: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/verify-tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
    });

    if (!response.ok) {
        throw new Error('Failed to verify tasks');
    }

    return response.json();
}

// Get task status
export async function getTaskStatus(address: string): Promise<TaskStatus> {
    const response = await fetch(`${API_BASE_URL}/task-status/${address}`);
    if (!response.ok) {
        throw new Error('Failed to get task status');
    }
    return response.json();
}

// Submit gasless claim via adminDrop
export async function adminDrop(address: string): Promise<ClaimResponse> {
    const response = await fetch(`${API_BASE_URL}/admin-drop`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process airdrop');
    }

    return response.json();
}

// Health check
export async function healthCheck(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
}
