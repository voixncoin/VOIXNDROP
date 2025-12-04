import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'VoixCore Airdrop - Claim 10,000 VOIXN',
    description: 'Claim your free 10,000 VOIXN tokens from VoixCore Airdrop. One claim per wallet.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
