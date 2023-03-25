export class UserDTO {
  id: string;
  username: string;
  connections: { id: string; username: string }[];
}
