export class AppUserDTO {
  dId: string;
  aId: string;
  username: string;
  email: string;
  authenticated: boolean;
  IdP: string;
  whitelisted: boolean;
  // mentors: { id: string; username: string }[];
}
