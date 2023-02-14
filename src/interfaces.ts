import { QueryResult } from "pg";

export interface IDeveloperRequest {
  name: string;
  email: string;
}
export interface IDeveloperResponse extends IDeveloperRequest {
  id: string;
}

export interface IProjectRequest {
  name: string;
  description: string;
  repository: string;
  estimatedTime: string;
  startDate: string;
}

export interface IProjectResponse extends IProjectRequest {
  id: string;
}

export type TQueryGetDataBase = QueryResult<IDeveloperResponse>;

export type TQueryGetProjects = QueryResult<IProjectResponse>;

export type TRequiredPostKeys = "email" | "name";

export type TInfoDevKeys = "developerSince" | "preferredOS";

export type TPreferOSKeys = "Linux" | "Windows" | "MacOS";

export type TProjectsKeys =
  | "name"
  | "description"
  | "estimatedTime"
  | "repository"
  | "startDate"
  | "developerId";
export type TPrimaryKeys =
  | "name"
  | "description"
  | "estimatedTime"
  | "repository"
  | "startDate"
  | "endDate"
  | "developerId";
