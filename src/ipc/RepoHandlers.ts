import { ipcMain, dialog } from "electron";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { getRepos, addRepo, deleteRepo } from "../database";

export interface RepoFolderResult {
  canceled: boolean;
  path?: string;
  isGitRepo?: boolean;
}

export class RepoHandlers {
  register(): void {
    ipcMain.handle("select-repo-folder", this.selectRepoFolder.bind(this));
    ipcMain.handle("get-repo-status", this.getRepoStatus.bind(this));
    ipcMain.handle("git-pull", this.gitPull.bind(this));
    ipcMain.handle("git-push", this.gitPush.bind(this));
    ipcMain.handle("get-repos", () => getRepos());
    ipcMain.handle("add-repo", (_, name: string, path: string) => {
      addRepo(name, path);
      return getRepos();
    });
    ipcMain.handle("delete-repo", (_, id: number) => {
      deleteRepo(id);
      return getRepos();
    });
    ipcMain.handle("git-fetch", (_, path: string) => {
      if (!path) return;
      return this.gitFetch(_, path);
    });
    ipcMain.handle("list-branches", async (_, repoPath: string) => {
      return this.listBranches(_, repoPath);
    });

    ipcMain.handle(
      "checkout-branch",
      async (_, repoPath: string, branch: string) => {
        return this.checkoutBranch(_, repoPath, branch);
      }
    );

    ipcMain.handle("branch-graph", async (_, repoPath: string) => {
      return this.getGraph(_, repoPath);
    });
  }

  private async selectRepoFolder(): Promise<RepoFolderResult> {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (result.canceled) {
      return { canceled: true };
    }

    const selectedPath = result.filePaths[0];
    const isGitRepo = fs.existsSync(path.join(selectedPath, ".git"));

    return {
      canceled: false,
      path: selectedPath,
      isGitRepo,
    };
  }

  private runGitCommand(repoPath: string, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`git -C "${repoPath}" ${command}`, (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  private async getRepoStatus(_: any, repoPath: string) {
    try {
      const branch = await this.runGitCommand(
        repoPath,
        "rev-parse --abbrev-ref HEAD"
      );
      const commits = await this.runGitCommand(repoPath, "log --oneline -n 10");
      return { branch, commits: commits.split("\n") };
    } catch (err) {
      return { error: err };
    }
  }

  private async gitPull(_: any, repoPath: string) {
    try {
      const result = await this.runGitCommand(repoPath, "pull");
      return { success: true, output: result };
    } catch (err: any) {
      if (String(err).toLowerCase().includes("authentication failed")) {
        return {
          success: false,
          error: "Authentication failed. Please check your Git credentials.",
        };
      }
      return { success: false, error: err };
    }
  }

  private async gitPush(_: any, repoPath: string) {
    try {
      const result = await this.runGitCommand(repoPath, "push");
      return { success: true, output: result };
    } catch (err: any) {
      if (String(err).toLowerCase().includes("authentication failed")) {
        return {
          success: false,
          error: "Authentication failed. Please check your Git credentials.",
        };
      }
      return { success: false, error: err };
    }
  }

  private async gitFetch(_: any, repoPath: string) {
    try {
      const result = await this.runGitCommand(repoPath, "fetch");
      return { success: true, output: result };
    } catch (err) {
      if (String(err).toLowerCase().includes("authentication failed")) {
        return {
          success: false,
          error: "Authentication failed. Please check your Git credentials.",
        };
      }
      return { success: false, error: err };
    }
  }

  private async listBranches(_, repoPath) {
    try {
      const branches = await this.runGitCommand(
        repoPath,
        "branch --all --color=never"
      );
      return {
        success: true,
        branches: branches.split("\n").map((b) => b.trim()),
      };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  private async checkoutBranch(_, repoPath, branch) {
    try {
      await this.runGitCommand(repoPath, `checkout ${branch}`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  private async getGraph(_, repoPath) {
    try {
      const graph = await this.runGitCommand(
        repoPath,
        `log --graph --decorate --oneline --all --color=never`
      );
      return { success: true, graph: graph.split("\n") };
    } catch (err) {
      return { success: false, error: err };
    }
  }
}
