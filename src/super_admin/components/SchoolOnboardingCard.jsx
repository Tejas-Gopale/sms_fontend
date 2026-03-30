import { useState } from "react";
import axios from "axios";
import ApiService from "../../common/services/api";
export default function SchoolOnboardingCard() {

  const [loading,setLoading] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: "",
    schoolEmail: "",
    schoolCode: "",
    subDomain: "",
    boardType: "",
    establishedYear: "",
    phoneNumber: "",
    websiteUrl: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    adminFullName: "",
    adminEmail: "",
    adminPassword: "",
    adminContactNumber: "",
    subscriptionPlan: "BASIC",
    studentCapacity: "",
    enableSms: false,
    enableMobileAppAccess: true
  });

  const handleChange = (e) => {

    const { name,value,type,checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);

    try {

      await ApiService.post(
        "/super-admin/create-school",
        formData
      );

      alert("School Onboarded Successfully");

    } catch (err) {
      console.error(err);
      alert("Error onboarding school");

    }

    setLoading(false);

  };

  return (

    <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        School Onboarding
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* SCHOOL DETAILS */}

        <div>

          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            School Details
          </h3>

          <div className="grid md:grid-cols-3 gap-4">

            <Input name="schoolName" placeholder="School Name" handleChange={handleChange}/>
            <Input name="schoolEmail" placeholder="School Email" handleChange={handleChange}/>
            <Input name="schoolCode" placeholder="School Code" handleChange={handleChange}/>

            <Input name="subDomain" placeholder="Sub Domain" handleChange={handleChange}/>
            <Input name="boardType" placeholder="Board Type (CBSE/ICSE)" handleChange={handleChange}/>
            <Input name="establishedYear" placeholder="Established Year" handleChange={handleChange}/>

            <Input name="phoneNumber" placeholder="Phone Number" handleChange={handleChange}/>
            <Input name="websiteUrl" placeholder="Website URL" handleChange={handleChange}/>

          </div>

        </div>


        {/* ADDRESS */}

        <div>

          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Address Details
          </h3>

          <div className="grid md:grid-cols-3 gap-4">

            <Input name="addressLine1" placeholder="Address Line 1" handleChange={handleChange}/>
            <Input name="addressLine2" placeholder="Address Line 2" handleChange={handleChange}/>
            <Input name="city" placeholder="City" handleChange={handleChange}/>

            <Input name="state" placeholder="State" handleChange={handleChange}/>
            <Input name="country" placeholder="Country" handleChange={handleChange}/>
            <Input name="pincode" placeholder="Pincode" handleChange={handleChange}/>

          </div>

        </div>


        {/* ADMIN DETAILS */}

        <div>

          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Admin Details
          </h3>

          <div className="grid md:grid-cols-3 gap-4">

            <Input name="adminFullName" placeholder="Admin Full Name" handleChange={handleChange}/>
            <Input name="adminEmail" placeholder="Admin Email" handleChange={handleChange}/>
            <Input name="adminPassword" placeholder="Admin Password" type="password" handleChange={handleChange}/>

            <Input name="adminContactNumber" placeholder="Admin Contact Number" handleChange={handleChange}/>

          </div>

        </div>


        {/* SUBSCRIPTION */}

        <div>

          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Subscription Details
          </h3>

          <div className="grid md:grid-cols-3 gap-4">

            <select
              name="subscriptionPlan"
              onChange={handleChange}
              className="input"
            >
              <option>BASIC</option>
              <option>STANDARD</option>
              <option>PREMIUM</option>
            </select>

            <Input name="studentCapacity" placeholder="Student Capacity" handleChange={handleChange}/>

          </div>

        </div>


        {/* FEATURES */}

        <div className="flex gap-6">

          <label className="flex items-center gap-2 text-gray-700">

            <input
              type="checkbox"
              name="enableSms"
              onChange={handleChange}
            />

            Enable SMS

          </label>

          <label className="flex items-center gap-2 text-gray-700">

            <input
              type="checkbox"
              name="enableMobileAppAccess"
              defaultChecked
              onChange={handleChange}
            />

            Enable Mobile App

          </label>

        </div>


        {/* SUBMIT */}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02]"
        >

          {loading ? "Creating School..." : "Onboard School"}

        </button>

      </form>

    </div>

  );

}


/* INPUT COMPONENT */

function Input({ name,placeholder,handleChange,type="text" }) {

  return (

    <input
      type={type}
      name={name}
      placeholder={placeholder}
      onChange={handleChange}
      className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />

  );

}