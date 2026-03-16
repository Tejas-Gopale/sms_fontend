import ParentSidebar from "../components/ParentSidebar";

export default function ParentBusTracking() {

  const busInfo = {
    busNumber: "Bus 12",
    driver: "Ramesh Kumar",
    driverPhone: "+91 9876543210",
    route: "Green Valley → City Center → School",
    distance: "2 km",
    eta: "8 minutes"
  };

  return (

    <div className="flex">

      <ParentSidebar />

      <div className="flex-1 p-8 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          🚌 Bus Tracking
        </h1>

        {/* Bus Info Cards */}

        <div className="grid grid-cols-3 gap-6 mb-6">

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">Bus Number</p>
            <p className="text-xl font-semibold">{busInfo.busNumber}</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">Distance</p>
            <p className="text-xl font-semibold">{busInfo.distance} away</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">Estimated Arrival</p>
            <p className="text-xl font-semibold">{busInfo.eta}</p>
          </div>

        </div>

        {/* Driver Info */}

        <div className="bg-white p-6 rounded-xl shadow mb-6">

          <h2 className="text-xl font-semibold mb-4">
            Driver Information
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <p>
              <strong>Driver Name:</strong> {busInfo.driver}
            </p>

            <p>
              <strong>Contact:</strong> {busInfo.driverPhone}
            </p>

            <p className="col-span-2">
              <strong>Route:</strong> {busInfo.route}
            </p>

          </div>

        </div>

        {/* Map Section */}

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4">
            Live Bus Location
          </h2>

          <div className="h-72 bg-gray-200 rounded flex items-center justify-center text-gray-500">

            Live Map Will Appear Here

          </div>

          <p className="mt-4 text-gray-600">

            Bus is currently <strong>{busInfo.distance}</strong> away from the pickup location.

          </p>

        </div>

      </div>

    </div>

  );
}