import { useState } from "react";
import axios from "axios";

export default function SchoolOnboardingCard() {

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
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:8080/api/superadmin/onboard-school",
        formData
      );

      alert("School Onboarded Successfully");

    } catch (error) {
      console.error(error);
      alert("Error onboarding school");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">

      <h2 className="text-xl font-bold mb-4">
        Onboard New School
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

        <input name="schoolName" placeholder="School Name" onChange={handleChange} className="input"/>
        <input name="schoolEmail" placeholder="School Email" onChange={handleChange} className="input"/>

        <input name="schoolCode" placeholder="School Code" onChange={handleChange} className="input"/>
        <input name="subDomain" placeholder="Sub Domain" onChange={handleChange} className="input"/>

        <input name="boardType" placeholder="Board Type" onChange={handleChange} className="input"/>
        <input name="establishedYear" placeholder="Established Year" onChange={handleChange} className="input"/>

        <input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} className="input"/>
        <input name="websiteUrl" placeholder="Website URL" onChange={handleChange} className="input"/>

        <input name="city" placeholder="City" onChange={handleChange} className="input"/>
        <input name="state" placeholder="State" onChange={handleChange} className="input"/>

        <input name="country" placeholder="Country" onChange={handleChange} className="input"/>
        <input name="pincode" placeholder="Pincode" onChange={handleChange} className="input"/>

        <input name="adminFullName" placeholder="Admin Name" onChange={handleChange} className="input"/>
        <input name="adminEmail" placeholder="Admin Email" onChange={handleChange} className="input"/>

        <input name="adminPassword" placeholder="Admin Password" onChange={handleChange} className="input"/>
        <input name="adminContactNumber" placeholder="Admin Contact" onChange={handleChange} className="input"/>

        <select name="subscriptionPlan" onChange={handleChange} className="input">
          <option>BASIC</option>
          <option>STANDARD</option>
          <option>PREMIUM</option>
        </select>

        <input name="studentCapacity" placeholder="Student Capacity" onChange={handleChange} className="input"/>

        <label className="flex gap-2">
          <input type="checkbox" name="enableSms" onChange={handleChange}/>
          Enable SMS
        </label>

        <label className="flex gap-2">
          <input type="checkbox" name="enableMobileAppAccess" defaultChecked onChange={handleChange}/>
          Enable Mobile App
        </label>

        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white py-2 rounded-lg"
        >
          Submit
        </button>

      </form>
    </div>
  );
}