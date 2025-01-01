import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <>
  <div className="h-screen w-full flex justify-center items-center">
    <div className="flex justify-center items-center w-[1200px] h-[600px] bg-white p-12">
      <div className="hidden lg:flex w-1/2 relative items-center justify-center">
        <img
          src="/login.png"
          style={{ width: "500px", height: "500px" }}
          alt=""
        />
      </div>
      <div className="flex items-center justify-center lg:w-1/2">
      <div className=" bg-gray-50 px-16 py-16 border">
        <SignIn />
        </div>
      </div>
    </div>
  </div>
</>
}
