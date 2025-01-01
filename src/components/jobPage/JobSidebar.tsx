import React from "react";
import { IoLocationSharp } from "react-icons/io5";
import { SiReacthookform } from "react-icons/si";
import { MdPerson2 } from "react-icons/md";

export default function JobSidebar() {
  return (
    <div>
      <div className="bg-white w-[300px] p-4 shadow-lg h-screen">
        <ul className="space-y-4">
          <li className="text-lg font-semibold flex items-center">
            <IoLocationSharp className="mr-2" /> Location
          </li>
          <li className="text-lg font-semibold flex items-center">
            <SiReacthookform className="mr-2" /> Type
          </li>
          <li className="text-lg font-semibold flex items-center">
            <MdPerson2 className="mr-2" /> JobTitle
          </li>
        </ul>
      </div>
    </div>
  );
}
