import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import { TPrimaryKeys, TProjectsKeys } from "../interfaces";

const validadeConstData = (payload: any): TProjectsKeys => {
  const keys: Array<String> = Object.keys(payload);
  const requiredKeys: Array<TProjectsKeys> = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "developerId",
  ];
  const primaryKeys: Array<TPrimaryKeys> = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "endDate",
    "developerId",
  ];
  const containRequired: Boolean = requiredKeys.every((key: String) => {
    return keys.includes(key);
  });
  if (!containRequired) {
    throw new Error(`Required keys are ${requiredKeys}.`);
  }
  keys.forEach((e: any) => {
    if (!primaryKeys.includes(e)) {
      delete payload[e];
    }
  });

  return payload;
};

export const postProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const data = validadeConstData(request.body);
    const queryString: string = format(
      `
    INSERT INTO 
    projects(%I)
  VALUES 
  (%L)
  RETURNING *;
    `,
      Object.keys(data),
      Object.values(data)
    );

    const queryResult = await client.query(queryString);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (
      error.message.includes(
        'insert or update on table "projects" violates foreign'
      )
    ) {
      return response.status(404).json({
        message: "Developer not found",
      });
    }

    if (error instanceof Error) {
      return response.status(400).json({
        message: error.message,
      });
    }

    return response.status(500).json({
      message: "internal server error",
    });
  }
};
export const getAllProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const queryString = `
    SELECT
  pr."id" as "projectID",
  pr."name" as "projectName",
  pr."description",
  pr."estimatedTime",
  pr."repository",
  pr."startDate",
  pr."endDate",
  pr."developerId",
  tec."id" as "tecID",
  tec."name" as "tecName"
FROM
technologies_projects tp
FULL JOIN
projects pr ON tp."projectId" = pr.id
LEFT JOIN
technologies tec ON tp."technologyId" = tec.id;
 `;

    const queryResult = await client.query(queryString);
    return response.status(200).json(queryResult.rows);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({
        message: error.message,
      });
    }
    return response.status(500).json({
      message: "internal server error",
    });
  }
};
export const getAProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(request.params.id);

    const queryString = `
    SELECT
    pr."id" as "projectID",
    pr."name" as "projectName",
    pr."description",
    pr."estimatedTime",
    pr."repository",
    pr."startDate",
    pr."endDate",
    pr."developerId",
    tec."id" as "tecID",
    tec."name" as "tecName"
  FROM
  technologies_projects tp
  FULL JOIN
  projects pr ON tp."projectId" = pr.id
  LEFT JOIN
  technologies tec ON tp."technologyId" = tec.id
  WHERE
  pr.id = $1
  ;  `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };
    const queryResult = await client.query(queryConfig);
    if (!queryResult.rowCount) {
      return response.status(404).json({ message: "Project not found." });
    }

    return response.status(200).json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({
        message: error.message,
      });
    }
    return response.status(500).json({
      message: "internal server error",
    });
  }
};

const validatePatchProject = (payload: any) => {
  const keys: Array<String> = Object.keys(payload);
  const primaryKeys: Array<TPrimaryKeys> = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "endDate",
    "developerId",
  ];

  keys.forEach((e: any) => {
    if (!primaryKeys.includes(e)) {
      delete payload[e];
    }
  });

  return payload;
};
export const patchProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const validatedData = validatePatchProject(request.body);
    const keysData = Object.keys(request.body);
    const id: number = parseInt(request.params.id);
    const newData = Object.values(validatedData);
    const formatString: string = format(
      `
    UPDATE 
    projects
    SET(%I) = ROW(%L)
    WHERE 
    id = $1
    RETURNING *;
    `,
      keysData,
      newData
    );

    const queryConfig: QueryConfig = {
      text: formatString,
      values: [id],
    };
    const queryResult = await client.query(queryConfig);
    if (!queryResult.rowCount) {
      return response.status(404).json({ message: "Developer not found." });
    }
    return response.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("syntax error at or near")) {
      return response.status(404).json({
        message:
          "RequiredKeys are: name, description, estimatedTime, repository, startDate, endDate, developerId",
      });
    }
    if (error instanceof Error) {
      return response.status(400).json({
        message: error.message,
      });
    }
    return response.status(500).json({
      message: "internal server error",
    });
  }
};

export const deleteProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(request.params.id);
    const queryString: string = `
    DELETE FROM 
    projects
      WHERE
      id = $1;
    `;
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };
    const queryResult = await client.query(queryConfig);

    if (!queryResult.rowCount) {
      return response.status(404).json({ message: "Project not found." });
    }

    return response.status(201).json();
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({
        message: error.message,
      });
    }
    return response.status(500).json({
      message: "internal server error",
    });
  }
};
