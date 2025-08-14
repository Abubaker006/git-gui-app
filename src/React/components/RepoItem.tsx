import { FolderGit2 } from "lucide-react";
import { Repo } from "../utils/types";

const RepoItem: React.FC<{  
  repo: Repo;
  isSelected: boolean;
  onClick: () => void;
}> = ({ repo, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer mb-2 transition-all duration-200 border-2 ${
        isSelected
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-lg"
          : "hover:bg-gray-50 border-transparent hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        <FolderGit2 className="w-5 h-5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{repo.name}</p>
          <p
            className={`text-sm truncate ${isSelected ? "text-blue-100" : "text-gray-500"}`}
          >
            {repo.path}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RepoItem;
