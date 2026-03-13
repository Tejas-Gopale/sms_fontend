import { School, User, CreditCard } from "lucide-react";

const activities = [
  {
    icon: School,
    text: "New school registered",
    time: "2 min ago",
  },
  {
    icon: CreditCard,
    text: "Payment received",
    time: "10 min ago",
  },
  {
    icon: User,
    text: "New teacher added",
    time: "30 min ago",
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <Icon className="text-blue-500" />
              <div>
                <p className="text-gray-700">{item.text}</p>
                <p className="text-sm text-gray-400">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}