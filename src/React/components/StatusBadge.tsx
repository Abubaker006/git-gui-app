import { AlertCircle, CheckCircle, GitBranch } from "lucide-react";

const StatusBadge: React.FC<{
  type: "error" | "success" | "info";
  children: React.ReactNode;
}> = ({ type, children }) => {
  const variants = {
    error: "bg-red-100 text-red-800 border-red-200",
    success: "bg-green-100 text-green-800 border-green-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const icons = {
    error: <AlertCircle className="w-4 h-4" />,
    success: <CheckCircle className="w-4 h-4" />,
    info: <GitBranch className="w-4 h-4" />,
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${variants[type]}`}
    >
      {icons[type]}
      {children}
    </div>
  );
};

export default StatusBadge;
