import { RedisManager } from '@/lib/redis/RedisManagerCultural';
import { GET_CULTURAL_FIT } from '@/lib/redis/types';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        console.log('POST /api/cultural-fit');
        const { audioUrl } = await req.json();

        const res = await RedisManager.getInstance().sendAndAwait({
            type: GET_CULTURAL_FIT,
            data: {
                audio_url: audioUrl,
            },
          })
        console.log('Cultural-fit \n', res.payload);
      
          return NextResponse.json(res.payload);
    } catch (error) {
        console.error('Error in cultural-fit API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

