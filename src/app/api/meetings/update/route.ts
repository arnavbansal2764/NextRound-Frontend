import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { id, accepted } = await req.json();

        if (!id || !accepted) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updatedMeeting = await db.meetings.update({
            where: { id },
            data: { accepted },
        });
        const cUser = await currentUser();
        try{
            let prevm =  await db.mentor.findUnique({where:{
                userId: cUser!.id,
            }});
            if(prevm){
                let m = await db.mentor.update({
                    where:{
                        userId: cUser!.id,
                    },
                    data: {
                        acceptedMeetings: prevm?.acceptedMeetings+1
                    },
                });
            }else{
                return NextResponse.json({ error: 'Mentor Not found' }, { status: 420 });
            }
        }catch(e){
            console.log(e)
            return NextResponse.json({ error: 'Error Verifying you' }, { status: 420 });
        }
        return NextResponse.json({ message: 'Meeting status updated', meeting: updatedMeeting });
    } catch (error) {
        console.error('Error updating meeting status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}