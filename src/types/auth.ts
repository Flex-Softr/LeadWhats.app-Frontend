export type AuthUserRole = "ADMIN" | "CUSTOMER";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: AuthUserRole;
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
