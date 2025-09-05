export interface ReqUser{
  id: number,
  email: string,
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string | null;
  loginType: 'local' | 'google';
  imageUrl: string | null;
  lastSeen: Date;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}
