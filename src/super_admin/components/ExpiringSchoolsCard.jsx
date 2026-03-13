export default function ExpiringSchoolsCard() {

  const schools = [
    {
      name: "Sunrise Public School",
      city: "Mumbai",
      daysLeft: 5
    },
    {
      name: "Modern Academy",
      city: "Pune",
      daysLeft: 2
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">

      <h2 className="text-xl font-bold mb-4">
        Schools Near Deactivation
      </h2>

      <table className="w-full">

        <thead>
          <tr className="border-b text-left">
            <th className="p-2">School</th>
            <th className="p-2">City</th>
            <th className="p-2">Days Left</th>
          </tr>
        </thead>

        <tbody>

          {schools.map((school, index) => (
            <tr key={index} className="border-b">

              <td className="p-2">{school.name}</td>
              <td className="p-2">{school.city}</td>

              <td className="p-2 text-red-600 font-bold">
                {school.daysLeft} Days
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}