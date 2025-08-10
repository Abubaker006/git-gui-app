import React, { useState } from "react";

interface Repo {
  name: string;
  path: string;
}

const RepoList: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([
    { name: "Repo1", path: "/home/abubaker/projects/repo1" },
    { name: "Repo2", path: "/home/abubaker/projects/repo2" },
  ]);
  const [selectedRepoIndex, setSelectedRepoIndex] = useState<number | null>(
    null
  );

  const handleAddRepo = () => {
    const name = prompt("Enter repo name:");
    const path = prompt("Enter repo path:");
    if (name && path) {
      setRepos([...repos, { name, path }]);
    }
  };

  return (
    <>
      <div className="flex h-screen">
        <div className="w-64 bg-gray-100 border-r p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Repositories</h2>
          <div className="flex-1 overflow-auto">
            {repos.length === 0 && <p>No repos added yet.</p>}
            {repos.map((repo, i) => (
              <div
                key={repo.path}
                onClick={() => setSelectedRepoIndex(i)}
                className={`p-2 rounded cursor-pointer mb-1 ${
                  selectedRepoIndex === i
                    ? "bg-blue-400 text-white"
                    : "hover:bg-blue-200"
                }`}
              >
                {repo.name}
              </div>
            ))}
          </div>
          <button
            onClick={handleAddRepo}
            className="mt-4 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Repo
          </button>
        </div>
        <div className="flex-1 p-6">
          {selectedRepoIndex === null ? (
            <p>Select a repo to see details</p>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">
                {repos[selectedRepoIndex].name}
              </h1>
              <p>Path: {repos[selectedRepoIndex].path}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RepoList;
