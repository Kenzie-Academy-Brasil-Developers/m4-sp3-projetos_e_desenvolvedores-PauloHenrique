import express, { Application, json } from "express";
import { startDatabase } from "./database";
import {
  deleteDeveloper,
  getADeveloper,
  getAllDevelopers,
  getDeveloperProjects,
  patchDeveloper,
  patchDeveloperInfo,
  postDeveloper,
  postDeveloperInfo,
} from "./logic/developers";
import {
  deleteProject,
  getAllProjects,
  getAProject,
  patchProject,
  postProject,
} from "./logic/projects";

import { middlewareGetDataBase, middlewareGetProjects } from "./middlewares";
const app: Application = express();
app.use(json());

app.post("/developers", middlewareGetDataBase, postDeveloper);
app.get("/developers", middlewareGetDataBase, getAllDevelopers);
app.get("/developers/:id", middlewareGetDataBase, getADeveloper);
app.get("/developers/:id/projects", getDeveloperProjects);
app.post("/developers/:id/infos", middlewareGetDataBase, postDeveloperInfo);
app.delete("/developers/:id", middlewareGetDataBase, deleteDeveloper);
app.patch("/developers/:id", patchDeveloper);
app.patch("/developers/:id/infos", patchDeveloperInfo);

app.post("/projects", middlewareGetDataBase, postProject);
app.get("/projects", middlewareGetProjects, getAllProjects);
app.get("/projects/:id", middlewareGetProjects, getAProject);
app.patch("/projects/:id", patchProject);
app.delete("/projects/:id", deleteProject);

const PORT: number = 3000;
const runningMsg: string = `Server running on http://localhost:${PORT}`;
app.listen(PORT, async () => {
  await startDatabase();
  console.log(runningMsg);
});
