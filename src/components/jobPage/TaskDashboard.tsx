export default function TaskDashboard() {
  return (
    <div className="w-4/6">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Job Details</h1>

        <div className="mb-6">
          <ul>
            <li className="flex items-center justify-between py-2">
              <div className="flex items-center font-semibold">
                Company
              </div>
              <span className="bg-purple-200 text-purple-700 px-2 py-1 rounded">
                Private
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <div className="flex items-center font-semibold">
                Location
              </div>
              <span className="bg-purple-200 text-purple-700 px-2 py-1 rounded">
                Gurgaon
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <div className="flex items-center font-semibold">
                Type
              </div>
              <span className="bg-purple-200 text-purple-700 px-2 py-1 rounded">
                Full Time
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Similarity Score</h2>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-blue-100 rounded shadow">
              <div className="flex justify-between">
                <h3 className="font-bold">Skills Match</h3>
                <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded">
                  20 points
                </span>
              </div>
              <p className="mb-2">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Commodi, sit? Lorem, ipsum dolor sit amet consectetur
                adipisicing elit. Itaque corrupti autem quibusdam hic
                perferendis vero maiores ratione excepturi praesentium ipsam.
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded shadow">
              <div className="flex justify-between">
                <h3 className="font-bold">Experience</h3>
                <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded">
                  25 points
                </span>
              </div>
              <p className="mb-2">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Commodi, sit? Lorem, ipsum dolor sit amet consectetur
                adipisicing sdam hic
                perferendis vero maiores ratione excepturi praesentium ipsam.
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded shadow">
              <div className="flex justify-between">
                <h3 className="font-bold">Education</h3>
                <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded">
                  10 points
                </span>
              </div>
              <p className="mb-2">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Compti autem quibusdam hic
                perferendis vero maiores ratione excepturi praesentium ipsam.
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded shadow">
              <div className="flex justify-between">
                <h3 className="font-bold">Accomplishments</h3>
                <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded">
                  10 points
                </span>
              </div>
              <p className="mb-2">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                adipisicing el excepturi praesentium ipsam.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
