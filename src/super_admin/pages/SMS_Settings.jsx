import SuperAdminSidebar from "../components/SuperAdminSidebar";

export default function Settings() {

  return (

    <div className="flex">

      <SuperAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-6">
          Platform Settings
        </h1>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Platform Info */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">
              Platform Branding
            </h2>

            <input
              type="text"
              placeholder="Platform Name"
              className="border p-3 w-full mb-3 rounded"
            />

            <input
              type="text"
              placeholder="Company Name"
              className="border p-3 w-full mb-3 rounded"
            />

            <input
              type="file"
              className="border p-3 w-full mb-3 rounded"
            />

            <input
              type="text"
              placeholder="Website URL"
              className="border p-3 w-full mb-3 rounded"
            />

          </div>


          {/* Contact Settings */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">
              Contact & Support
            </h2>

            <input
              type="email"
              placeholder="Support Email"
              className="border p-3 w-full mb-3 rounded"
            />

            <input
              type="email"
              placeholder="Billing Email"
              className="border p-3 w-full mb-3 rounded"
            />

            <input
              type="text"
              placeholder="Support Phone"
              className="border p-3 w-full mb-3 rounded"
            />

            <textarea
              placeholder="Office Address"
              className="border p-3 w-full mb-3 rounded"
            />

          </div>


          {/* SaaS Limits */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">
              Default School Limits
            </h2>

            <input
              type="number"
              placeholder="Max Teachers per School"
              className="border p-3 w-full mb-3 rounded"
            />

            <input
              type="number"
              placeholder="Max Students per School"
              className="border p-3 w-full mb-3 rounded"
            />

            <input
              type="number"
              placeholder="Max Admins per School"
              className="border p-3 w-full mb-3 rounded"
            />

          </div>


          {/* Domain Settings */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">
              Domain Settings
            </h2>

            <input
              type="text"
              placeholder="Base Domain (example: schoolapp.com)"
              className="border p-3 w-full mb-3 rounded"
            />

            <input
              type="text"
              placeholder="Subdomain Prefix"
              className="border p-3 w-full mb-3 rounded"
            />

            <input
              type="text"
              placeholder="Cloudflare Tunnel URL"
              className="border p-3 w-full mb-3 rounded"
            />

          </div>


          {/* Security Settings */}
          <div className="bg-white p-6 rounded-xl shadow md:col-span-2">

            <h2 className="text-xl font-semibold mb-4">
              Security Settings
            </h2>

            <div className="flex items-center justify-between mb-3">

              <span>Enable Two Factor Authentication</span>

              <input type="checkbox" />

            </div>

            <div className="flex items-center justify-between mb-3">

              <span>Allow School Self Registration</span>

              <input type="checkbox" />

            </div>

            <div className="flex items-center justify-between mb-3">

              <span>Email Verification Required</span>

              <input type="checkbox" />

            </div>

          </div>

        </div>

        {/* Save Button */}

        <div className="mt-6">

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow">
            Save Platform Settings
          </button>

        </div>

      </div>

    </div>

  );

}