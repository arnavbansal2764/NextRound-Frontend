export const GET_RECOMMENDATION = 'GET_RECOMMENDATION';
export const GET_RESUME_BUILD = 'GET_RESUME_BUILD';
export const GET_SIMILARITY_SCORE = 'GET_SIMILARITY_SCORE';
export const GET_INTERVIEW_ANALYSIS = 'GET_INTERVIEW_ANALYSIS';
export const GET_QUESTIONS = 'GET_QUESTIONS';
export const GET_CULTURAL_FIT = 'GET_CULTURAL_FIT';
export const GET_CHECKPOINTS = 'GET_CHECKPOINTS';
export const GET_JOBS_SCRAPED = 'GET_JOBS_SCRAPED'

export type Score = {
    entity_match_score: number;
    final_comprehensive_score: number;
    keyword_match_score: number;
    semantic_similarity: number;
  };

export type Question_Transcript = {
  question: string;
  transcript: string;
}

export type Analysis_Result = {
  question: string;
  transcript: string;
  feedback: string;
}

export type  Emotion ={
  name: string;
  value: number;
}

export type CulturalAnalysisResult ={
  emotions: Emotion[][];
  result: string;
}

export type Course = {
  courseName:string;
  courseLink:string;
}