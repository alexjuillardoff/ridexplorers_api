import "express";

declare module "express-serve-static-core" {
  interface Request {
    isAuthenticated?: () => boolean;
    logout?: (callback: (err?: any) => void) => void;
  }
}
