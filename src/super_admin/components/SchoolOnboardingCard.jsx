// src/super-admin/components/SchoolOnboardingCard.jsx
import { useState } from "react";
import ApiService from "../../common/services/api";

function Input({ name, placeholder, handleChange, type = "text" }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      onChange={handleChange}
      className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    />
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
        {children}
      </h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

export default function SchoolOnboardingCard() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: "", schoolEmail: "", schoolCode: "", subDomain: "",
    boardType: "", establishedYear: "", phoneNumber: "", websiteUrl: "",
    addressLine1: "", addressLine2: "", city: "", state: "", country: "", pincode: "",
    adminFullName: "", adminEmail: "", adminPassword: "", adminContactNumber: "",
    subscriptionPlan: "BASIC", studentCapacity: "",
    enableSms: false, enableMobileAppAccess: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ApiService.post("/super-admin/create-school", formData);
      alert("School Onboarded Successfully");
    } catch (err) {
      console.error(err);
      alert("Error onboarding school");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl p-8">

      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">School Onboarding</h2>
        <p className="text-sm text-gray-400 mt-1">Fill in the details to register a new school on the platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* School Details */}
        <div>
          <SectionTitle>School Details</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <Input name="schoolName"      placeholder="School Name"            handleChange={handleChange} />
            <Input name="schoolEmail"     placeholder="School Email"           handleChange={handleChange} />
            <Input name="schoolCode"      placeholder="School Code"            handleChange={handleChange} />
            <Input name="subDomain"       placeholder="Sub Domain"             handleChange={handleChange} />
            <Input name="boardType"       placeholder="Board Type (CBSE/ICSE)" handleChange={handleChange} />
            <Input name="establishedYear" placeholder="Established Year"       handleChange={handleChange} />
            <Input name="phoneNumber"     placeholder="Phone Number"           handleChange={handleChange} />
            <Input name="websiteUrl"      placeholder="Website URL"            handleChange={handleChange} />
          </div>
        </div>

        {/* Address */}
        <div>
          <SectionTitle>Address Details</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <Input name="addressLine1" placeholder="Address Line 1" handleChange={handleChange} />
            <Input name="addressLine2" placeholder="Address Line 2" handleChange={handleChange} />
            <Input name="city"         placeholder="City"           handleChange={handleChange} />
            <Input name="state"        placeholder="State"          handleChange={handleChange} />
            <Input name="country"      placeholder="Country"        handleChange={handleChange} />
            <Input name="pincode"      placeholder="Pincode"        handleChange={handleChange} />
          </div>
        </div>

        {/* Admin Details */}
        <div>
          <SectionTitle>Admin Details</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <Input name="adminFullName"      placeholder="Admin Full Name"       handleChange={handleChange} />
            <Input name="adminEmail"         placeholder="Admin Email"           handleChange={handleChange} />
            <Input name="adminPassword"      placeholder="Admin Password"        handleChange={handleChange} type="password" />
            <Input name="adminContactNumber" placeholder="Admin Contact Number"  handleChange={handleChange} />
          </div>
        </div>

        {/* Subscription */}
        <div>
          <SectionTitle>Subscription Details</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <select
              name="subscriptionPlan"
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="BASIC">BASIC</option>
              <option value="STANDARD">STANDARD</option>
              <option value="PREMIUM">PREMIUM</option>
            </select>
            <Input name="studentCapacity" placeholder="Student Capacity" handleChange={handleChange} />
          </div>
        </div>

        {/* Feature Toggles */}
        <div>
          <SectionTitle>Feature Toggles</SectionTitle>
          <div className="flex gap-8">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="enableSms"
                onChange={handleChange}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-600 font-medium">Enable SMS</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="enableMobileAppAccess"
                defaultChecked
                onChange={handleChange}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-600 font-medium">Enable Mobile App</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-sm tracking-wide"
        >
          {loading ? "Creating School..." : "Onboard School"}
        </button>

      </form>
    </div>
  );
}
// import { useState } from "react";
// import axios from "axios";
// import ApiService from "../../common/services/api";
// export default function SchoolOnboardingCard() {

//   const [loading,setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     schoolName: "",
//     schoolEmail: "",
//     schoolCode: "",
//     subDomain: "",
//     boardType: "",
//     establishedYear: "",
//     phoneNumber: "",
//     websiteUrl: "",
//     addressLine1: "",
//     addressLine2: "",
//     city: "",
//     state: "",
//     country: "",
//     pincode: "",
//     adminFullName: "",
//     adminEmail: "",
//     adminPassword: "",
//     adminContactNumber: "",
//     subscriptionPlan: "BASIC",
//     studentCapacity: "",
//     enableSms: false,
//     enableMobileAppAccess: true
//   });

//   const handleChange = (e) => {

//     const { name,value,type,checked } = e.target;

//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value
//     });

//   };

//   const handleSubmit = async (e) => {

//     e.preventDefault();
//     setLoading(true);

//     try {

//       await ApiService.post(
//         "/super-admin/create-school",
//         formData
//       );

//       alert("School Onboarded Successfully");

//     } catch (err) {
//       console.error(err);
//       alert("Error onboarding school");

//     }

//     setLoading(false);

//   };

//   return (

//     <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">

//       <h2 className="text-2xl font-bold mb-6 text-gray-800">
//         School Onboarding
//       </h2>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-8"
//       >

//         {/* SCHOOL DETAILS */}

//         <div>

//           <h3 className="text-lg font-semibold mb-4 text-gray-700">
//             School Details
//           </h3>

//           <div className="grid md:grid-cols-3 gap-4">

//             <Input name="schoolName" placeholder="School Name" handleChange={handleChange}/>
//             <Input name="schoolEmail" placeholder="School Email" handleChange={handleChange}/>
//             <Input name="schoolCode" placeholder="School Code" handleChange={handleChange}/>

//             <Input name="subDomain" placeholder="Sub Domain" handleChange={handleChange}/>
//             <Input name="boardType" placeholder="Board Type (CBSE/ICSE)" handleChange={handleChange}/>
//             <Input name="establishedYear" placeholder="Established Year" handleChange={handleChange}/>

//             <Input name="phoneNumber" placeholder="Phone Number" handleChange={handleChange}/>
//             <Input name="websiteUrl" placeholder="Website URL" handleChange={handleChange}/>

//           </div>

//         </div>


//         {/* ADDRESS */}

//         <div>

//           <h3 className="text-lg font-semibold mb-4 text-gray-700">
//             Address Details
//           </h3>

//           <div className="grid md:grid-cols-3 gap-4">

//             <Input name="addressLine1" placeholder="Address Line 1" handleChange={handleChange}/>
//             <Input name="addressLine2" placeholder="Address Line 2" handleChange={handleChange}/>
//             <Input name="city" placeholder="City" handleChange={handleChange}/>

//             <Input name="state" placeholder="State" handleChange={handleChange}/>
//             <Input name="country" placeholder="Country" handleChange={handleChange}/>
//             <Input name="pincode" placeholder="Pincode" handleChange={handleChange}/>

//           </div>

//         </div>


//         {/* ADMIN DETAILS */}

//         <div>

//           <h3 className="text-lg font-semibold mb-4 text-gray-700">
//             Admin Details
//           </h3>

//           <div className="grid md:grid-cols-3 gap-4">

//             <Input name="adminFullName" placeholder="Admin Full Name" handleChange={handleChange}/>
//             <Input name="adminEmail" placeholder="Admin Email" handleChange={handleChange}/>
//             <Input name="adminPassword" placeholder="Admin Password" type="password" handleChange={handleChange}/>

//             <Input name="adminContactNumber" placeholder="Admin Contact Number" handleChange={handleChange}/>

//           </div>

//         </div>


//         {/* SUBSCRIPTION */}

//         <div>

//           <h3 className="text-lg font-semibold mb-4 text-gray-700">
//             Subscription Details
//           </h3>

//           <div className="grid md:grid-cols-3 gap-4">

//             <select
//               name="subscriptionPlan"
//               onChange={handleChange}
//               className="input"
//             >
//               <option>BASIC</option>
//               <option>STANDARD</option>
//               <option>PREMIUM</option>
//             </select>

//             <Input name="studentCapacity" placeholder="Student Capacity" handleChange={handleChange}/>

//           </div>

//         </div>


//         {/* FEATURES */}

//         <div className="flex gap-6">

//           <label className="flex items-center gap-2 text-gray-700">

//             <input
//               type="checkbox"
//               name="enableSms"
//               onChange={handleChange}
//             />

//             Enable SMS

//           </label>

//           <label className="flex items-center gap-2 text-gray-700">

//             <input
//               type="checkbox"
//               name="enableMobileAppAccess"
//               defaultChecked
//               onChange={handleChange}
//             />

//             Enable Mobile App

//           </label>

//         </div>


//         {/* SUBMIT */}

//         <button
//           type="submit"
//           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02]"
//         >

//           {loading ? "Creating School..." : "Onboard School"}

//         </button>

//       </form>

//     </div>

//   );

// }


// /* INPUT COMPONENT */

// function Input({ name,placeholder,handleChange,type="text" }) {

//   return (

//     <input
//       type={type}
//       name={name}
//       placeholder={placeholder}
//       onChange={handleChange}
//       className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//     />

//   );

// }