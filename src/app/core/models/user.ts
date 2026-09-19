export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}

export const MOCK_USER: User = {
  id: 'usr_001',
  firstName: 'Sarah',
  lastName: 'Martin',
  email: 'sarah.martin@example.com',
  role: 'user',
  avatarUrl: null,
};
