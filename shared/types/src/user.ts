export interface ReqUser{
  id: number,
  email: string,
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  password: string | null;
  authProvider: 'local' | 'google';
  googleId: string | null;
  imageUrl: string | null;
  lastSeen: Date;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}
