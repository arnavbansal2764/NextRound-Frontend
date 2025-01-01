
// import { db } from "@/lib/db";
// import { NextResponse } from "next/server";
// import { initialProfile } from "@/lib/profile/initialProfile";

// interface CreateUserRequest {
//   name: string;
//   birthdate: Date;
//   education: string;
//   path: string[];
// }

// export async function POST(req: Request, res: NextResponse) {
//   try {
//     //@ts-ignore
//     const profile = await initialProfile();
//     console.log("first");
//     if (!profile) return new NextResponse("Unauthorised", { status: 401 });
//     console.log("second");
//     const reqData = await req.json();

//     const { name, birthdate, education, path }: CreateUserRequest =
//       await reqData.data;
//     console.log("name: ", name);
//     if (!name || !birthdate || !education || !path) {
//       return new NextResponse("missing fields", { status: 404 });
//     }
//     console.log("third");
//     let user = await db.user.update({
//       where: {
//         id: profile.id,
//       },
//       data: {
//         name,
//         birthdate,
//         education,
//         path,
//       },
//     });

//     path.forEach(async (p) => {
//       const tempProfile = await db.profile.create({
//         data: {
//           profileName: p,
//           userId: user.id,
//         },
//       });
//     });

//     const defaultDate = new Date("1900-01-01T00:00:00.000Z");
//     if (
//       user.name === "Anonymous" ||
//       user.birthdate === defaultDate ||
//       user.education === "Not specified" ||
//       user.path.length == 0
//     ) {
//       user = await db.user.update({
//         where: {
//           id: profile.id,
//         },
//         data: { complete: false },
//       });
//     } else {
//       const dbProfiles = await db.profile.findMany({
//         where: {
//           userId: user.id,
//         },
//       });
//       const len = dbProfiles.length;
//       for (let i = 0; i < len; i++) {
//         if (!path.includes(dbProfiles[i].profileName)) {
//           await db.profile.delete({
//             where: {
//               id: dbProfiles[i].id,
//             },
//           });
//         }
//       }
//       user = await db.user.update({
//         where: {
//           id: profile.id,
//         },
//         data: { complete: true },
//       });
//     }
//     console.log("updated");

//     return NextResponse.json(user);
//   } catch (error) {
//     console.log("USER_PROFILE \n", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { initialProfile } from "@/lib/profile/initialProfile";
import { RedisManager } from "@/lib/redis/RedisManagerSimilarity";
import { GET_SIMILARITY_SCORE } from "@/lib/redis/types";
import { currentProfile } from "@/lib/profile/currentProfile";
import { currentUserData } from "@/lib/profile/currentUserData";

interface CreateUserRequest {
  name: string;
  birthdate: Date;
  education: string;
  path: string[];
  resume: string;
  email: string;
}

export async function POST(req: Request, res: NextResponse) {
  try {
    const profile = await initialProfile();
    console.log("first");
    if (!profile) return new NextResponse("Unauthorised", { status: 401 });
    console.log("second");
    const reqData = await req.json();
    const { name, birthdate, education, path, resume , email}: CreateUserRequest =
      await reqData.data;
    console.log("name: ", name);
    if (!name || !birthdate || !education || !path || !resume || !email) {
      return new NextResponse("missing fields", { status: 404 });
    }
    console.log("third");
    const updatedUser = await db.user.update({
      where: { id: profile.id },
      data: {
        name,
        birthdate: new Date(birthdate),
        education,
        path,
      },
    });
    let userData = await db.userData.findFirst({
      where: { userId: profile.id },
    });
    if (userData) {
      // Update existing UserData
      userData = await db.userData.update({
        where: { id: userData.id },
        data: {
          resume,
        },
      });
    } else {
      // Create new UserData
      userData = await db.userData.create({
        data: {
          userId: profile.id,
          resume,
          qna: {}, // Initialize qna as empty JSON
          complete: false,
          role: path[0], // Add appropriate default role
          email, // Assuming profile has an email property
        },
      });

      const jobs = await db.joblisting.findMany();
      for(const job of jobs){
        const res = await RedisManager.getInstance().sendAndAwait({
          type: GET_SIMILARITY_SCORE,
          data: {
            job_description: job.description,
            resume: userData.resume,
          },
      })
  
      if(res.type=="SIMILARITY_SCORE"&& (res.payload.score.semantic_similarity>0.4)){
        
        await db.userData.update({where:{
          id:userData.id
        }, data: {
          jobListings: {
            connect: {
              id: job.id
            }
          }
        }})
      }
      }
    }

    return NextResponse.json({user: updatedUser, userData}, {status: 200});
  } catch (error) {
    console.log("USER_PROFILE \n", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const userData = await currentUserData();

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 500 });
    }

    const userId = userData[0].userId;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { UserData: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    return NextResponse.json({ user, userData }, { status: 200 });
  } catch (error) {
    console.log("GET_USER_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}