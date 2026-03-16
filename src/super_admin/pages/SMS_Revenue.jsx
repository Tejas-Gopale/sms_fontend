import { useEffect, useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import API from "../../common/services/api";

export default function Revenue(){

  const [schools,setSchools] = useState([]);

  useEffect(()=>{

    const fetchSchools = async ()=>{
      try{
        const res = await API.get("/super-admin/getAllSchoolList");
        setSchools(res.data);
      }catch(err){
        console.error("Error loading schools",err);
      }
    }

    fetchSchools();

  },[]);

  const activeSchools = schools.filter(s => s.active).length;
  const inactiveSchools = schools.length - activeSchools;

  const monthlySubscription = 3000; // example SaaS price per school
  const monthlyRevenue = activeSchools * monthlySubscription;
  const yearlyRevenue = monthlyRevenue * 12;

  return(

    <div className="flex">

      <SuperAdminSidebar/>

      <div className="flex-1 p-8 bg-gray-100 min-h-screen">

        <h1 className="text-3xl font-bold mb-8">
          Revenue & Business Analytics
        </h1>

        {/* Revenue Cards */}

        <div className="grid grid-cols-4 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Schools</p>
            <h2 className="text-3xl font-bold">
              {schools.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Active Schools</p>
            <h2 className="text-3xl font-bold text-green-600">
              {activeSchools}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Monthly Revenue</p>
            <h2 className="text-3xl font-bold">
              ₹ {monthlyRevenue.toLocaleString()}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Estimated Yearly Revenue</p>
            <h2 className="text-3xl font-bold">
              ₹ {yearlyRevenue.toLocaleString()}
            </h2>
          </div>

        </div>


        {/* Revenue Breakdown */}

        <div className="grid grid-cols-2 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">
              Subscription Model
            </h2>

            <p className="text-gray-600 mb-2">
              Price per School / Month
            </p>

            <h3 className="text-2xl font-bold">
              ₹ {monthlySubscription}
            </h3>

            <p className="text-sm text-gray-500 mt-3">
              Increasing this by ₹500 increases revenue by ₹
              {(activeSchools * 500).toLocaleString()} per month.
            </p>

          </div>

          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">
              School Activity
            </h2>

            <p className="mb-2">
              Active Schools: 
              <span className="font-semibold text-green-600 ml-2">
                {activeSchools}
              </span>
            </p>

            <p>
              Inactive Schools: 
              <span className="font-semibold text-red-600 ml-2">
                {inactiveSchools}
              </span>
            </p>

          </div>

        </div>


        {/* Growth Strategies */}

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4">
            Business Growth Strategies
          </h2>

          <ul className="list-disc pl-6 space-y-2 text-gray-700">

            <li>
              Introduce **tier based pricing** (Basic, Pro, Enterprise).
            </li>

            <li>
              Add **SMS / WhatsApp notification paid add-ons**.
            </li>

            <li>
              Charge extra for **mobile app access for parents**.
            </li>

            <li>
              Offer **data analytics dashboards for schools** as premium feature.
            </li>

            <li>
              Provide **online fee payment gateway integration** and take a small commission.
            </li>

            <li>
              Create **white label ERP solution** for large school groups.
            </li>

          </ul>

        </div>

      </div>

    </div>

  )

}