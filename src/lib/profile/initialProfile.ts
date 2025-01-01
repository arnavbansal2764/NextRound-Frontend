import { currentUser, auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
export const initialProfile = async () => {
  const user = await currentUser();
  console.log("\n\n\n\n", user?.id, "\n\n\n\n\n");
  if (!user) {
    return auth().redirectToSignIn();
  } else {
    const dbUser = await db.user.findUnique({
      where: {
        id: user.id,
      },
    });
    if (dbUser) {
      return dbUser;
    }

    const newUser = await db.user.create({
      data: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      },
    });
    return newUser;
  }
};
