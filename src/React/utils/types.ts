export interface Repo {
  id?: number;
  name: string;
  path: string;
}

export type RepoStatus = {
  branch?: string;
  commits?: string[];
  error?: string;
};

export type pathType = {
  canceled: boolean;
  path?: string;
  isGitRepo?: boolean;
};
