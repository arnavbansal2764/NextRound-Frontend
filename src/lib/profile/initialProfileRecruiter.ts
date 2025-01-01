import { currentUser, auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const initialProfileRecruiter = async () => {
  const user = await currentUser();
  console.log("\n\n\n\n", user?.id, "\n\n\n\n\n");

  if (!user) {
    return auth().redirectToSignIn(); // Redirect if user not found
  } else {
    // Try to find the recruiter profile by Clerk user ID
    const dbRecruiter = await db.recruiter.findUnique({
      where: {
        id: user.id, // Ensure you're using the userId, not MongoDB ObjectID
      },
    });

    if (dbRecruiter) {
      return dbRecruiter; // Return existing recruiter profile
    }

    // Create a new recruiter profile if none exists
    const newRecruiter = await db.recruiter.create({
      data: {
        id: user.id, // Store Clerk user ID
        name: `${user.firstName} ${user.lastName}`,
        companyName: "Company", // Default values for recruiter fields
        aboutCompany: "About the company",
        organization: "Organization name",
      },
    });

    return newRecruiter;
  }
};
