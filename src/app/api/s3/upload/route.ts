import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: NextRequest) {
    try {
        const { fileName, fileType } = await request.json();

        const command = new PutObjectCommand({
            Bucket: process.env.NEXT_AWS_BUCKET_NAME!,
            Key: fileName,
            ContentType: fileType,
        });

        // Generate a pre-signed URL that expires in 60 seconds
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

        return NextResponse.json({ uploadUrl });
    } catch (error) {
        console.error('Error generating upload URL:', error);
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
}
