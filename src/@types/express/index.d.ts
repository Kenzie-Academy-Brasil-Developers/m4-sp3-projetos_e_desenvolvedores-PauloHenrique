import * as express from "express";
import { TQueryGetDataBase } from "../../interfaces";

declare global {
  namespace Express {
    interface Request {
      DataBase: {
        queryResult: TQueryGetDataBase;
      };
      Projects: {
        queryResult: IProjectResponse;
      };
    }
  }
}
