'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

interface Meeting {
    id: string;
    mentorName: string;
    userName: string;
    mentorId: string;
    dateTime: string;
    purpose: string;
    duration: string;
    details: string;
    accepted: string;
}

export function MeetingList({ meetingList, setMeetingList }: any) {
    

    const handleAccept = async (id: string, status: string) => {
        try {
            await axios.post('/api/meetings/update', { id, accepted: status });
            setMeetingList((prev: Meeting[]) =>
                prev.map((meeting: Meeting) =>
                    meeting.id === id ? { ...meeting, accepted: status } : meeting
                )
            );
        } catch (error) {
            console.error('Error updating meeting status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.post('/api/meetings/delete', { id });
            setMeetingList((prev: Meeting[]) => prev.filter((meeting: Meeting) => meeting.id !== id));
        } catch (error) {
            console.error('Error deleting meeting:', error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold m-8">Your Upcoming Meetings</h2>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {meetingList.map((meeting: Meeting, index: number) => (
                    <motion.div
                        key={meeting.id}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="mt-4 ml-8 mr-8">
                            <CardHeader>
                                <CardTitle>{meeting.mentorName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Purpose: {meeting.purpose}</p>
                                <p>Duration: {meeting.duration}</p>
                                <p>Details: {meeting.details}</p>
                                <p>Accepted: {meeting.accepted}</p>
                                {meeting.accepted === 'In Progress' ? (
                                    <div className="flex space-x-4">
                                        <CheckCircle
                                            className="text-green-500 cursor-pointer"
                                            onClick={() => handleAccept(meeting.id, 'yes')}
                                        />
                                        <XCircle
                                            className="text-red-500 cursor-pointer"
                                            onClick={() => handleDelete(meeting.id)}
                                        />
                                    </div>
                                ) : meeting.accepted === 'yes' ? (
                                    <p>Accepted</p>
                                ) : (
                                    <p>Rejected</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
