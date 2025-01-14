import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export async function POST(request: NextRequest) {
    try {
        const { fileName } = await request.json(); 

        if (!fileName) {
            return NextResponse.json({ error: 'File name is required' }, { status: 400 });
        }
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME!, 
            Key: fileName, 
        };

        await s3.deleteObject(params).promise();

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}
