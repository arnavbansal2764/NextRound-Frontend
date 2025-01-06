import {
  GET_CHECKPOINTS,
  GET_CULTURAL_FIT,
  GET_INTERVIEW_ANALYSIS,
  GET_JOBS_SCRAPED,
  GET_QUESTIONS,
  GET_RECOMMENDATION,
  GET_RESUME_BUILD,
  GET_SIMILARITY_SCORE,
  Question_Transcript,
} from ".";

export type MessagesToAI =
  | {
      type: typeof GET_RECOMMENDATION;
      data: {
        description: String;
        responsibilities: String;
        requirements: String;
        experience: String;
        location: String;
        jobType: String; // intern, full-time, etc.
        mode: String; // remote, on-site, hybrid
        organization: String; // Add this field to store the organization type (gov/private)
        title: String;
        salary: String;
        resume:String
      };
    }
  | {
      type: typeof GET_RESUME_BUILD;
      data: {
        job_description: string;
        resume: string;
      };
    }
  | {
      type: typeof GET_SIMILARITY_SCORE;
      data: {
        job_description: string;
        resume: string;
      };
    }
  | {
      type: typeof GET_INTERVIEW_ANALYSIS;
      data: {
        question_responses: Question_Transcript[];
      };
    }
  | {
      type: typeof GET_QUESTIONS;
      data: {
        resume: string;
      };
    }
  | {
      type: typeof GET_CULTURAL_FIT;
      data: {
        audio_url: string;
        question:string;
      };
    }|{
      type: typeof GET_CHECKPOINTS;
      data:{
        currentStatus:string;
        endGoal:string;
      }
    } |{
      type: typeof GET_JOBS_SCRAPED;
      data:{
        jobType:"internship"|"private"|"government";
        role:string;
        location:string;
        years:string;
      }
    }
