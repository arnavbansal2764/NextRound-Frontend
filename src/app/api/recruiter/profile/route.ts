import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { initialProfile } from "@/lib/profile/initialProfile";
import { initialProfileRecruiter } from "@/lib/profile/initialProfileRecruiter";

interface CreateRecruiterRequest {
  name: string;
  companyName: string;
  aboutCompany: string;
  organization: string;
}

export async function POST(req: Request, res: NextResponse) {
  try {
    //@ts-ignore
    const profile = await initialProfileRecruiter();
    console.log("first");
    if (!profile) return new NextResponse("Unauthorised", { status: 401 });
    console.log("second");
    const reqData = await req.json();

    const { name, companyName, aboutCompany,organization }: CreateRecruiterRequest =
      await reqData.data;
    console.log("name: ", name);
    if (!name || !companyName || !aboutCompany || !organization) {
      return new NextResponse("missing fields", { status: 404 });
    }
    console.log("third");
    let user = await db.recruiter.update({
      where: {
        id: profile.id,
      },
      data: {
        name,
        companyName,
        aboutCompany,
        organization,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.log("USER_PROFILE \n", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// export async function GET(req: Request, res: NextResponse) {
//   try {
//     const recruiter = await db.recruiter.findUnique({
//       where: {
//         id: profile.id,
//       },
//     });

//     return NextResponse.json(recr);
//   } catch (error) {
//     console.log("USER_PROFILE \n", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }