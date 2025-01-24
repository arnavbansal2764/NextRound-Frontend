import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    region: process.env.NEXT_PUBLIC_AWS_REGION,
});

export async function POST(request: NextRequest) {
    try {
        const { fileName, fileType } = await request.json();

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: fileName,
            ContentType: fileType,
            Expires: 60, 
        };

        const uploadUrl = s3.getSignedUrl('putObject', params);

        return NextResponse.json({ uploadUrl });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
}
