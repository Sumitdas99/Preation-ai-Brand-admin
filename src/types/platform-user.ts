export interface PlatformUser {
  id: string;
  name: string;
  email: string;

  role: string;
  status: "active" | "deactivated";
  createdAt: Date;
  lastLogin: Date;
}

