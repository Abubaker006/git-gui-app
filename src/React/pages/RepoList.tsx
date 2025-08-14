import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Plus,
  GitBranch,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { Repo, RepoStatus, pathType } from "../utils/types";
import CommitList from "../components/CommitsList";
import GitActions from "../components/GithubActions";
import RepoItem from "../components/RepoItem";
import StatusBadge from "../components/StatusBadge";
import Button from "../Resused-Components/Button";
import Card from "../Resused-Components/Card";
import { toast } from "sonner";
import { branchColors } from "../utils/array";
import EnhancedGitGraph from "../components/GitGraph";

interface GraphCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  branch?: string;
  refs?: string[];
}

const RepoList: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepoIndex, setSelectedRepoIndex] = useState<number | null>(
    null
  );
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>("");

  const [graph, setGraph] = useState<GraphCommit[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);

  const Electron = (window as any).Electron;

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
    if (selectedRepoIndex === null) {
      toast.error("Please select a repository first.");
      return;
    }
    try {
      setLoading(true);
      const repoPath = repos[selectedRepoIndex].path;
      const result = await Electron.ipcRenderer.invoke(action, repoPath);

      if (result.success) {
        toast.success(`${actionName} completed successfully!`);
        await refreshRepoStatus();
        if (branches.length > 0) {
          await loadBranches();
        }
        if (showGraph) {
          await loadBranchGraph();
        }
      } else {
        toast.error(`${actionName} failed: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Error while ${actionName}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGitFetch = () => handleGitAction("git-fetch", "Fetch");
  const handleGitPull = () => handleGitAction("git-pull", "Pull");
  const handleGitPush = () => handleGitAction("git-push", "Push");

  const loadBranches = async () => {
    if (selectedRepoIndex === null) return;

    setBranchLoading(true);
    try {
      const result = await Electron.ipcRenderer.invoke(
        "list-branches",
        repos[selectedRepoIndex].path
      );
      if (result.success) {
        setBranches(result.branches);
        const current = result.branches.find((b: string) => b.startsWith("* "));
        if (current) {
          setCurrentBranch(current.replace("* ", ""));
        }
      }
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setBranchLoading(false);
    }
  };

  const switchBranch = async (branch: string) => {
    if (selectedRepoIndex === null || branch === currentBranch) return;

    setBranchLoading(true);
    try {
      const result = await Electron.ipcRenderer.invoke(
        "checkout-branch",
        repos[selectedRepoIndex].path,
        branch
      );

      if (result.success) {
        setCurrentBranch(branch);
        toast.success(`Switched to ${branch}`);
        await Promise.all([
          refreshRepoStatus(),
          loadBranches(),
          showGraph ? loadBranchGraph() : Promise.resolve(),
        ]);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to switch branch");
      console.error(error);
    } finally {
      setBranchLoading(false);
    }
  };

  const loadBranchGraph = async () => {
    if (selectedRepoIndex === null) return;

    setGraphLoading(true);
    try {
      const result = await Electron.ipcRenderer.invoke(
        "branch-graph",
        repos[selectedRepoIndex].path
      );
      if (result.success) {
        setGraph(result.graph);
      }
    } catch (error) {
      console.error("Error loading git graph:", error);
    } finally {
      setGraphLoading(false);
    }
  };

  const refreshRepoStatus = async () => {
    if (selectedRepoIndex === null) return;

    const repoPath = repos[selectedRepoIndex].path;
    try {
      const newStatus = await Electron.ipcRenderer.invoke(
        "get-repo-status",
        repoPath
      );
      setRepoStatus(newStatus);
    } catch (error) {
      console.error("Error refreshing repo status:", error);
    }
  };

  const toggleGraph = async () => {
    if (!showGraph) {
      setShowGraph(true);
      await loadBranchGraph();
    } else {
      setShowGraph(false);
      setGraph([]);
    }
  };


  useEffect(() => {
    (async () => {
      setLoading(true);
      const savedRepos = await Electron.ipcRenderer.invoke("get-repos");
      setRepos(savedRepos);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selectedRepoIndex !== null) {
      setLoading(true);
      const repoPath = repos[selectedRepoIndex].path;

      Promise.all([
        Electron.ipcRenderer.invoke("get-repo-status", repoPath),
        loadBranches(),
      ])
        .then(([status]) => {
          setRepoStatus(status);
          if (status?.branch) {
            setCurrentBranch(status.branch);
          }
        })
        .finally(() => {
          setLoading(false);
        });

      setShowGraph(false);
      setGraph([]);
    }
  }, [selectedRepoIndex, repos]);



  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200">
      <div className="flex h-screen">
        <div className="w-80 bg-[#15181e] border-r border-gray-800 shadow-lg flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold flex items-center gap-3 text-gray-100">
              <FolderGit2 className="w-6 h-6 text-purple-400" />
              Repositories
            </h2>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-2">
            {loading && repos.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
              </div>
            ) : repos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderGit2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
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

          <div className="p-4 border-t border-gray-800">
            <Button
              variant="success"
              icon={<Plus />}
              onClick={handleAddRepo}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              Add Repository
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {selectedRepoIndex === null ? (
              <Card className="text-center py-16 bg-[#1b1e25] border border-gray-800">
                <FolderGit2 className="w-14 h-14 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Select a Repository
                </h3>
                <p className="text-gray-500 text-sm">
                  Choose a repository from the sidebar to view details
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="bg-[#1b1e25] border border-gray-800">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {repos[selectedRepoIndex].name}
                    </h1>
                    <p className="text-gray-500 text-sm">
                      <span className="font-medium">Path:</span>{" "}
                      {repos[selectedRepoIndex].path}
                    </p>
                    {loading ? (
                      <div className="flex items-center gap-2 text-gray-400 mt-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                        Loading...
                      </div>
                    ) : repoStatus?.error ? (
                      <StatusBadge type="error">{repoStatus.error}</StatusBadge>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge type="info">
                          Branch:{" "}
                          {currentBranch || repoStatus?.branch || "Unknown"}
                        </StatusBadge>
                        {repoStatus?.commits && (
                          <StatusBadge type="success">
                            {repoStatus.commits.length} commits
                          </StatusBadge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
                <Card className="bg-[#1b1e25] border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-blue-400" />
                      Branch Management
                    </h2>
                    <Button
                      onClick={loadBranches}
                      variant="secondary"
                      icon={
                        <RefreshCw
                          className={branchLoading ? "animate-spin" : ""}
                        />
                      }
                      disabled={branchLoading}
                      size="sm"
                    >
                      Refresh
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Switch Branch
                      </label>
                      <select
                        className="w-full bg-[#0f1115] border border-gray-700 text-gray-200 rounded-lg p-2 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                        onChange={(e) => switchBranch(e.target.value)}
                        value={currentBranch}
                        disabled={branchLoading}
                      >
                        {branches.map((branch) => {
                          const cleanBranch = branch.replace("* ", "");
                          return (
                            <option key={cleanBranch} value={cleanBranch}>
                              {branch.startsWith("* ")
                                ? `${cleanBranch} (current)`
                                : cleanBranch}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Git Graph
                      </label>
                      <Button
                        onClick={toggleGraph}
                        variant={showGraph ? "primary" : "secondary"}
                        icon={showGraph ? <EyeOff /> : <Eye />}
                        disabled={graphLoading}
                      >
                        {showGraph ? "Hide Graph" : "Show Graph"}
                      </Button>
                    </div>
                  </div>

                  {showGraph && (
                    <div className="mt-6">
                      <div className="bg-[#0f1115] border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-300">
                            Git Graph
                          </h3>
                          {graphLoading && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                              Loading graph...
                            </div>
                          )}
                        </div>

                        {graph.length > 0 ? (
                          <div className="font-mono text-sm overflow-x-auto">
                            <div className="space-y-1">
                              <EnhancedGitGraph commits={graph} />
                            </div>
                          </div>
                        ) : !graphLoading ? (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No git graph data available
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="bg-[#1b1e25] border border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-200 mb-4">
                    Git Operations
                  </h2>
                  <GitActions
                    onFetch={handleGitFetch}
                    onPull={handleGitPull}
                    onPush={handleGitPush}
                    disabled={loading || branchLoading || !!repoStatus?.error}
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
