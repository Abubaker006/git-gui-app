import React from "react";
import { Gitgraph } from "@gitgraph/react";

interface GraphCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  branch?: string;
  refs?: string[];
}

interface Props {
  commits: GraphCommit[];
}

const GitGraphView: React.FC<Props> = ({ commits }) => {
  function parseGitLog(lines: string[]) {
    const commits: any[] = [];
    

    // eslint-disable-next-line no-useless-escape
    const commitRegex = /^[\|\*\\/\s]*([a-f0-9]{7,})\s+\(([^)]+)\)\s*(.*)$/;
     // eslint-disable-next-line no-useless-escape
    const commitNoRefRegex = /^[\|\*\\/\s]*([a-f0-9]{7,})\s+(.*)$/;

    for (const line of lines) {
      let match = line.match(commitRegex);
      if (match) {
        const [, hash, refs, message] = match;
        commits.push({
          hash,
          refs: refs.split(",").map((r) => r.trim()),
          message,
          branch: refs.split(",")[0] || "master",
        });
        continue;
      }

      match = line.match(commitNoRefRegex);
      if (match) {
        const [, hash, message] = match;
        commits.push({
          hash,
          message,
          branch: "master",
        });
      }
    }

    return commits;
  }

  const parsedCommits = parseGitLog(commits);
  return (
    <div className="bg-[#0d1117] p-6 rounded-lg border border-gray-700 font-mono text-sm">
      <Gitgraph>
        {(gitgraph) => {
          const branchMap: Record<string, any> = {};

          parsedCommits.forEach((c) => {
            const branchName = c.branch || c.refs?.[0] || "master";

            if (!branchMap[branchName]) {
              branchMap[branchName] =
                branchName === "master"
                  ? gitgraph.branch(branchName)
                  : branchMap["master"]
                    ? branchMap["master"].branch(branchName)
                    : gitgraph.branch(branchName);
            }

            branchMap[branchName].commit({
              subject: c.message || c.subject || "(no message)",
              author: c.author?.name || "Unknown",
              body: `${c.author?.timestamp || ""}`,
            });
          });
        }}
      </Gitgraph>
    </div>
  );
};

export default GitGraphView;
