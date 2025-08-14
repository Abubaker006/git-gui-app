import { GitBranch } from "lucide-react";
import Card from "../Resused-Components/Card";

const CommitList: React.FC<{
  commits: string[];
}> = ({ commits }) => {
  return (
    <Card className="mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5" />
        Recent Commits
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {commits.map((commit, idx) => (
          <div
            key={idx}
            className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
          >
            <p className="text-sm text-gray-700 font-mono">{commit}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
export default CommitList;
