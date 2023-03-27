import {
  Table,
  Column,
  Model,
  Default,
  Unique,
  PrimaryKey,
} from 'sequelize-typescript';

@Table
export class AppUser extends Model {
  @Unique({ name: 'id', msg: 'Discord ID must be unique' })
  @Column
  dId: string;

  @Column
  aId: string;

  @Column
  username: string;

  @Column
  email: string;

  @Default(false)
  @Column
  authenticated: boolean;

  @Column
  IdP: string;

  @Default(false)
  @Column
  whitelisted: boolean;

  @Column
  name: string;

  @Column
  picture: string;

  // @BelongsToMany(() => Mentor, () => WhitelistedUserMentor)
  // mentors: Mentor[];
}

// sub: 'google-oauth2|109400188660500895432',
// given_name: 'Michał',
// family_name: 'Pawłowski',
// nickname: 'michalpawlowski2020',
// name: 'Michał Pawłowski',
// picture: 'https://lh3.googleusercontent.com/a/AGNmyxZY4RjiuRr8YU4A9uyNxJQGiTPqeYVtCjSmMhns=s96-c',
// locale: 'pl',
// updated_at: '2023-03-27T15:49:35.508Z',
// email: 'michalpawlowski2020@gmail.com',
// email_verified: true