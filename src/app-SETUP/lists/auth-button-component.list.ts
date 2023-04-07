export const authButtonComponent: [ButtonComponent] = [
  {
    type: 2,
    label: 'Start authentication with Auth0',
    style: 5,
    url: 'to populate in code...',
  },
];

export type ButtonComponent = {
  type: number;
  label: string;
  style: number;
  url: string;
};
