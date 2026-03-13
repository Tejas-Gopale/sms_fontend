import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";

export default function DashboardCard({ title, value, icon: Icon, color ,link}) {

    const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
       onClick={() => link && navigate(link)}
       style={{ cursor: link ? "pointer" : "default" }}
      className={`p-6 rounded-2xl shadow-lg bg-white border-l-4 ${color}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>

          <h2 className="text-2xl font-bold text-gray-800">
             {value}
          </h2>
        </div>

        <div className="p-3 bg-gray-100 rounded-xl">
          {Icon && <Icon size={28} />}
        </div>
      </div>
    </motion.div>
  );
}