// Initial setup message
export interface InitialSetupMessage {
    resume_pdf: string;
    number_of_ques: number;
    difficulty: string;
  }
  
  // Initial setup response
  export interface InitialSetupResponse {
    status: "ok" | "error";
    code: number;
    action: "initial_setup";
    message: string;
  }
  
  // Add question-answer message
  export interface AddQuestionAnswerMessage {
    action: "add_ques_ans";
    question: string;
    answer_text: string;
  }
  
  // Add question-answer response
  export interface AddQuestionAnswerResponse {
    status: "ok" | "error";
    code: number;
    action: "add_ques_ans";
    message: string;
  }
  
  // Get question message
  export interface GetQuestionMessage {
    action: "get_question";
  }
  
  // Get question response
  export interface GetQuestionResponse {
    status: "ok" | "error";
    code: number;
    action: "get_question";
    question: string;
  }
  
  // Analyze responses message
  export interface AnalyzeMessage {
    action: "analyze";
  }
  
  export interface Score {
    question: string;
    answer: string;
    refrenceAnswer: string;
    score: number;
}

  // Analyze responses response
  export interface AnalyzeResponse {
    status: string;
    code: number;
    action: string;
    analysis: string;
    scores: Score[];
    averageScore: number;
    totalScore: number;
  }
  
  // Stop interview message
  export interface StopInterviewMessage {
    action: "stop_interview";
  }
  
  // Stop interview response
  export interface StopInterviewResponse {
    status: "ok" | "error";
    code: number;
    action: "stop_interview";
    message: string;
  }
  
  // Error response
  export interface ErrorResponse {
    status: "error";
    code: number;
    action: string;
    message: string;
  }