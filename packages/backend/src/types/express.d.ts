import express from 'express';
import { ReqUser } from '@/shared/types/user';

declare module 'express-serve-static-core' {
  interface Request {
    user?: ReqUser;
  }
}

declare module 'express' {
  interface Request {
    user?: ReqUser;
  }
}

declare global {
  namespace Express {
    interface User extends ReqUser {}
  }
}