export class AppUserDTO {
  dId: string;
  aId: string;
  username: string;
  email: string;
  authenticated: boolean;
  IdP: string;
  whitelisted: boolean;
  name: string;
  picture: string;
  // mentors: { id: string; username: string }[];
}
