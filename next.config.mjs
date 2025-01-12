/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_ELEVEN_LABS_API_KEY: process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY,
        NEXT_PUBLIC_ELEVEN_LABS_VOICE_ID: process.env.NEXT_PUBLIC_ELEVEN_LABS_VOICE_ID,

    }

};

export default nextConfig;
