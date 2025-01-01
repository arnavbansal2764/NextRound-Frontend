"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

type Mentor = {
  id: number;
  name: string;
  expertise: string;
  experience: string;
  avatar: string;
};

export function BlueMentorList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [purpose, setPurpose] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [details, setDetails] = useState("");

  async function fetchMentors() {
    try {
      const response = await axios.get("/api/mentor/profile");
      setMentors(response.data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  }

  const scheduleMeet = async () => {
    if (!selectedMentor || !selectedDateTime || !purpose || !estimatedTime || !details) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      await axios.post("/api/mentor/schedule", {
        mentorId: selectedMentor.id,
        dateTime: selectedDateTime.toISOString(),
        mentorName: selectedMentor.name,
        purpose,
        estimatedTime,
        details,
      });
      toast.success("Meeting confirmed with " + selectedMentor.name);
    } catch (error) {
      console.error(error);
      toast.error("Failed to confirm meeting.");
    }
  };

  useEffect(() => {
    toast.promise(fetchMentors(), {
      loading: "Loading mentors...",
      success: "Mentors loaded",
      error: "Failed to load mentors",
    });
  }, []);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setSelectedDateTime(dateTime);
    } else {
      setSelectedDateTime(null);
    }
  }, [selectedDate, selectedTime]);

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (expertiseFilter === "all" || mentor.expertise === expertiseFilter)
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-light m-8 mt-20 text-center text-blue-800">
        Find Your Mentor
      </h1>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
          <Input
            placeholder="Search mentors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
        <Select onValueChange={setExpertiseFilter}>
          <SelectTrigger className="w-[180px] bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
            <SelectValue placeholder="Expertise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Expertise</SelectItem>
            <SelectItem value="Web Development">Web Development</SelectItem>
            <SelectItem value="Data Science">Data Science</SelectItem>
            <SelectItem value="UX Design">UX Design</SelectItem>
            <SelectItem value="Mobile Development">Mobile Development</SelectItem>
            <SelectItem value="Machine Learning">Machine Learning</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm transition-shadow hover:shadow-md border border-blue-100"
          >
            <Avatar className="w-16 h-16">
              <AvatarImage src={mentor.avatar} alt={mentor.name} />
              <AvatarFallback className="bg-blue-200 text-blue-800">
                {mentor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-blue-800">
                {mentor.name}
              </h2>
              <p className="text-sm text-blue-600">{mentor.expertise}</p>
              <p className="text-xs text-blue-400">{mentor.experience}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-auto bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                  onClick={() => setSelectedMentor(mentor)}
                >
                  Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-center text-blue-800">
                    Schedule with {selectedMentor?.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 pt-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(day) => {
                      if (day) {
                        setSelectedDate(day);
                      }
                    }}
                    className="rounded-md border border-blue-200"
                  />
                  <Select
                    onValueChange={(value) => {
                      setSelectedTime(value);
                    }}
                  >
                    <SelectTrigger className="bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="13:00">01:00 PM</SelectItem>
                      <SelectItem value="14:00">02:00 PM</SelectItem>
                      <SelectItem value="15:00">03:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Purpose of meeting"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <Input
                    placeholder="Estimated time (e.g., 30 mins)"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <Input
                    placeholder="Details about the issue"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={async () => {
                      toast.promise(scheduleMeet(), {
                        loading: "Scheduling meeting...",
                        success: "Meeting confirmed",
                        error: "Failed to confirm meeting",
                      });
                    }}
                  >
                    Confirm Meeting
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
}
