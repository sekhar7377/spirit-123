import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'SPIRIT — In Spirit Mode', description: 'Enter the world of Spirit. Prabhas. A film by Sandeep Reddy Vanga. An independent cinematic fan experience.', robots: { index: true, follow: true } };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html> }
