import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import { IProjectResponse, TProjectsKeys } from "../interfaces";

// export const validateData = (payload: any, database: any) => {
//   const keys: Array<String> = Object.keys(payload);
//   const requiredKeys: Array<TProjectsKeys> = [
//     "name",
//     "description",
//     "repository",
//     "estimatedTime",
//     "startDate",
//   ];

//   const containRequired: boolean = requiredKeys.every((key: string) => {
//     return keys.includes(key);
//   });

//   if (!containRequired) {
//     throw new Error(
//       `Required keys: ${requiredKeys[0]}, ${requiredKeys[1]}, ${requiredKeys[2]}, ${requiredKeys[3]}, ${requiredKeys[4]}. `
//     );
//   }
//   return payload;
// };

export const postProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const data = request.body;
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
export const getAllProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const queryString = `
    SELECT
  pr."id" as "developerID",
  pr."name" as "developerName",
  pr."description",
  pr."estimatedTime",
  pr."repository",
  pr."startDate",
  pr."endDate",
  pr."developerId",
  tec."id",
  tec."name"
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
    const dataProjects = request.Projects.queryResult;
    const id = request.params.id;
    const findId = dataProjects.rows.find((e: IProjectResponse) => e.id === id);
    if (findId === undefined) {
      return response.status(404).json({ message: "Project not found." });
    }
    return response.status(200).json(findId);
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

export const patchProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const keysData = Object.keys(request.body);
    const id: number = parseInt(request.params.id);
    const newData = Object.values(request.body);
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

// export const postTecnoProject = async (
//   request: Request,
//   response: Response
// ): Promise<Response> => {
//   try {
// const queryString =

//   } catch (error) {
//     if (error instanceof Error) {
//       return response.status(400).json({
//         message: error.message,
//       });
//     }
//     return response.status(500).json({
//       message: "internal server error",
//     });
//   }
// };
