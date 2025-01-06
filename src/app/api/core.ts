import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define the first route (for resumes)
  resume: f({
    pdf: { maxFileSize: "4MB", maxFileCount: 1, minFileCount: 1 },
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Uploaded resume file:", file.url);
      // You can save the file URL in a database or take further actions
    }),

  // Define the second route (for audio files)
  audioUploader: f({
    audio: { maxFileSize: "32MB", maxFileCount: 1, minFileCount: 1 },
    
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Uploaded audio file:", file.url);
      return { fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
