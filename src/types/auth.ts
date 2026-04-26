export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

export type AuthWorkspace = {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
};

export type AuthSessionPayload = {
  user: AuthUser;
  workspace: AuthWorkspace;
  accessToken: string;
};
