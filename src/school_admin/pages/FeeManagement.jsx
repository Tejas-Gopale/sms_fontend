import { useState } from "react";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import { Plus, Trash2 } from "lucide-react";

export default function FeeManagement() {

  const [feeStructures, setFeeStructures] = useState([]);

  const [form, setForm] = useState({
    className: "",
    feeItems: []
  });

  // ✅ Add new fee row
  const addFeeItem = () => {
    setForm({
      ...form,
      feeItems: [
        ...form.feeItems,
        { type: "", amount: "", frequency: "Monthly" }
      ]
    });
  };

  // ✅ Remove fee row
  const removeFeeItem = (index) => {
    const updated = [...form.feeItems];
    updated.splice(index, 1);
    setForm({ ...form, feeItems: updated });
  };

  // ✅ Handle change
  const handleChange = (index, field, value) => {
    const updated = [...form.feeItems];
    updated[index][field] = value;
    setForm({ ...form, feeItems: updated });
  };

  // ✅ Save structure (dummy)
  const handleSubmit = () => {
    setFeeStructures([...feeStructures, form]);
    setForm({ className: "", feeItems: [] });
  };

  return (
    <div className="flex">

      <SchoolAdminSidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Fee Management
          </h1>
        </div>

        {/* CREATE FORM */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">

          <h2 className="text-lg font-semibold mb-4">
            Create Fee Structure
          </h2>

          {/* CLASS SELECT */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Class</label>
            <input
              type="text"
              placeholder="e.g. 10-A"
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* FEE ITEMS */}
          <div className="space-y-3">

            {form.feeItems.map((item, index) => (

              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
              >

                {/* TYPE */}
                <select
                  value={item.type}
                  onChange={(e) => handleChange(index, "type", e.target.value)}
                  className="border px-3 py-2 rounded"
                >
                  <option value="">Select Fee Type</option>
                  <option value="Tuition">Tuition Fee</option>
                  <option value="Classroom">Classroom Fee</option>
                  <option value="Bus">Bus Fee</option>
                  <option value="Exam">Exam Fee</option>
                  <option value="Other">Other</option>
                </select>

                {/* AMOUNT */}
                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => handleChange(index, "amount", e.target.value)}
                  className="border px-3 py-2 rounded"
                />

                {/* FREQUENCY */}
                <select
                  value={item.frequency}
                  onChange={(e) => handleChange(index, "frequency", e.target.value)}
                  className="border px-3 py-2 rounded"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="One-Time">One-Time</option>
                </select>

                {/* DELETE */}
                <button
                  onClick={() => removeFeeItem(index)}
                  className="text-red-500 flex justify-center"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            ))}

          </div>

          {/* ADD BUTTON */}
          <button
            onClick={addFeeItem}
            className="mt-4 flex items-center gap-2 text-blue-600"
          >
            <Plus size={16} /> Add Fee Type
          </button>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Structure
          </button>

        </div>

        {/* EXISTING STRUCTURES */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-lg font-semibold mb-4">
            Fee Structures
          </h2>

          {feeStructures.length === 0 ? (
            <p className="text-gray-400">No fee structures created yet.</p>
          ) : (

            <div className="space-y-4">

              {feeStructures.map((fs, index) => (

                <div
                  key={index}
                  className="border rounded-lg p-4"
                >

                  <h3 className="font-semibold mb-2">
                    Class: {fs.className}
                  </h3>

                  <table className="w-full text-sm">

                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Amount</th>
                        <th className="p-2 text-left">Frequency</th>
                      </tr>
                    </thead>

                    <tbody>

                      {fs.feeItems.map((item, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{item.type}</td>
                          <td className="p-2">₹{item.amount}</td>
                          <td className="p-2">{item.frequency}</td>
                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}