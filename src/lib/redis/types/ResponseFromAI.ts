import { Analysis_Result, Course, Score, Segment, SegmentSecondaryTrait,CulturalScore } from "./";

export type ResponseFromAi = {
    type:"RECOMMENDATION",
    payload: {
        recommendation: string
    }
}|{
    type:"RESUME_BUILD", payload: {
        resume: string
    }
}|{
    type:"SIMILARITY_SCORE", payload: {
        score: Score
    }
} |{
    type:"INTERVIEW_ANALYSIS", payload: {
        analysis: Analysis_Result[]
    }
} |{
    type:"ERROR", payload: {
        message: string
    }
} |{
    type:"QUESTIONS", payload: {
        questions: string[]
    }
} |{
    type:"CULTURE_FIT", payload: {
        result: string;
        primary_traits: Segment[];
        segment_secondary_traits: SegmentSecondaryTrait[];
        scores:{
            totalScore:number;
            averageScore:number;
            scores:CulturalScore[];
        }
    }
} |{
    type:"CHECKPOINTS",payload:{
        courses: Course[];
    }
} |{
    type:"SCRAPED_JOB",payload:{
        jobs:string[];
    }
}
