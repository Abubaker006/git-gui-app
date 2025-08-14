import React, { useState, useEffect } from "react";
import { FolderGit2, Plus } from "lucide-react";
import { Repo, RepoStatus, pathType } from "../utils/types";
import CommitList from "../components/CommitsList";
import GitActions from "../components/GithubActions";
import RepoItem from "../components/RepoItem";
import StatusBadge from "../components/StatusBadge";
import Button from "../Resused-Components/Button";
import Card from "../Resused-Components/Card";

const RepoList: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepoIndex, setSelectedRepoIndex] = useState<number | null>(
    null
  );
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null);
  const [loading, setLoading] = useState(false);



  const Electron = (window as any).Electron;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const savedRepos = await Electron.ipcRenderer.invoke("get-repos");
      setRepos(savedRepos);
      console.log(savedRepos);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selectedRepoIndex !== null) {
      const repoPath = repos[selectedRepoIndex].path;
      setLoading(true);
      Electron.ipcRenderer
        .invoke("get-repo-status", repoPath)
        .then(setRepoStatus)
        .finally(() => setLoading(false));
    }
  }, [selectedRepoIndex, repos]);

  const handleAddRepo = async () => {
    setLoading(true);
    const pathData: pathType =
      await Electron.ipcRenderer.invoke("select-repo-folder");

    if (!pathData.canceled && pathData.path) {
      const repoName = pathData.path.split(/[\\/]/).pop();
      const updatedRepos = await Electron.ipcRenderer.invoke(
        "add-repo",
        repoName || `Repo${repos.length + 1}`,
        pathData.path
      );
      setRepos(updatedRepos);
    }
    setLoading(false);
  };

  const handleGitAction = async (action: string, actionName: string) => {
    if (selectedRepoIndex !== null) {
      setLoading(true);
      const repoPath = repos[selectedRepoIndex].path;
      const result = await Electron.ipcRenderer.invoke(action, repoPath);

      const message = result.success
        ? `${actionName} completed successfully!`
        : `${actionName} failed: ${result.error}`;

      alert(message);

      if (result.success) {
        const newStatus = await Electron.ipcRenderer.invoke(
          "get-repo-status",
          repoPath
        );
        setRepoStatus(newStatus);
      }
      setLoading(false);
    }
  };

  const handleGitFetch = () => handleGitAction("git-fetch", "Fetch");
  const handleGitPull = () => handleGitAction("git-pull", "Pull");
  const handleGitPush = () => handleGitAction("git-push", "Push");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen">
        <div className="w-80 bg-white border-r border-gray-200 shadow-lg flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FolderGit2 className="w-8 h-8 text-blue-600" />
              Repositories
            </h2>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {loading && repos.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : repos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderGit2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No repositories yet</p>
                <p className="text-sm">Click "Add Repository" to get started</p>
              </div>
            ) : (
              repos.map((repo, i) => (
                <React.Fragment key={repo.path}>
                  <RepoItem
                    repo={repo}
                    isSelected={selectedRepoIndex === i}
                    onClick={() => setSelectedRepoIndex(i)}
                  />
                </React.Fragment>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="success"
              icon={<Plus />}
              onClick={handleAddRepo}
              disabled={loading}
              className="w-full"
            >
              Add Repository
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {selectedRepoIndex === null ? (
              <Card className="text-center py-16">
                <FolderGit2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a Repository
                </h3>
                <p className="text-gray-500">
                  Choose a repository from the sidebar to view its details and
                  manage Git operations
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {repos[selectedRepoIndex].name}
                      </h1>
                      <p className="text-gray-600 mb-4">
                        <span className="font-medium">Path:</span>{" "}
                        {repos[selectedRepoIndex].path}
                      </p>

                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-gray-500">Loading...</span>
                        </div>
                      ) : repoStatus?.error ? (
                        <StatusBadge type="error">
                          {repoStatus.error}
                        </StatusBadge>
                      ) : (
                        <StatusBadge type="info">
                          Branch: {repoStatus?.branch || "Unknown"}
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-xl font-semibold mb-4">Git Operations</h2>
                  <GitActions
                    onFetch={handleGitFetch}
                    onPull={handleGitPull}
                    onPush={handleGitPush}
                    disabled={loading || !!repoStatus?.error}
                  />
                </Card>

                {repoStatus?.commits && repoStatus.commits.length > 0 && (
                  <CommitList commits={repoStatus.commits} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoList;
