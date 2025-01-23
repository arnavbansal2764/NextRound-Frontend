"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Phone,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface InterviewLayoutProps {
  children: React.ReactNode;
  isVideoOn: boolean;
  isMicOn: boolean;
  isSpeakerOn: boolean;
  toggleVideo: () => void;
  toggleMic: () => void;
  toggleSpeaker: () => void;
  endCall: () => void;
}

export function InterviewLayout({
  children,
  isVideoOn,
  isMicOn,
  isSpeakerOn,
  toggleVideo,
  toggleMic,
  toggleSpeaker,
  endCall,
}: InterviewLayoutProps) {
  const [time, setTime] = React.useState<string>(
    new Date().toLocaleTimeString()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800">
      {/* Meeting Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm p-4 sticky top-0 z-10 mt-5 mb-5">
        <div className="flex items-center justify-end max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{time}</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-gray-100"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-gray-100"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">{children}</div>

      {/* Meeting Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full transition-all duration-300 ${
                isMicOn
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={toggleMic}
            >
              {isMicOn ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full transition-all duration-300 ${
                isVideoOn
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={toggleVideo}
            >
              {isVideoOn ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full transition-all duration-300 ${
                isSpeakerOn
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={toggleSpeaker}
            >
              {isSpeakerOn ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
            <Button
              onClick={() => {
                toast.error("Screen sharing is not available in this demo");
              }}
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
            >
              <MonitorUp className="h-5 w-5" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
              onClick={endCall}
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
