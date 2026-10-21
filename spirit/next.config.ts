import type { NextConfig } from 'next';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const config: NextConfig = { output: 'export', basePath: basePath || undefined, images: { unoptimized: true }, trailingSlash: true, poweredByHeader: false };
export default config;
