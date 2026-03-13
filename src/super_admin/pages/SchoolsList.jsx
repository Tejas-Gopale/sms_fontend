export default function SchoolsList() {

  const schools = [
    { id: 1, name: "Sunrise Public School", city: "Mumbai" },
    { id: 2, name: "Green Valley School", city: "Pune" },
    { id: 3, name: "Modern Academy", city: "Nashik" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Registered Schools
      </h1>

      <div className="bg-white rounded-xl shadow p-6">

        <table className="w-full">

          <thead>
            <tr className="border-b text-left">
              <th className="p-3">ID</th>
              <th className="p-3">School Name</th>
              <th className="p-3">City</th>
            </tr>
          </thead>

          <tbody>
            {schools.map((school) => (
              <tr key={school.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{school.id}</td>
                <td className="p-3">{school.name}</td>
                <td className="p-3">{school.city}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}