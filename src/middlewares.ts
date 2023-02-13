import { NextFunction, Request, Response } from "express";
import { client } from "./database";

export const middlewareGetDataBase = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const query: string = `
    SELECT
        *
    FROM
    developers
      `;
  const queryResult = await client.query(query);

  request.DataBase = {
    queryResult: queryResult,
  };

  return next();
};
export const middlewareGetProjects = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const query: string = `
    SELECT
        *
    FROM
    projects
      `;
  const queryResult = await client.query(query);

  request.Projects = {
    queryResult: queryResult,
  };

  return next();
};
