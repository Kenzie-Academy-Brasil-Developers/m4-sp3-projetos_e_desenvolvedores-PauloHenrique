import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  IDeveloperRequest,
  TInfoDevKeys,
  TPreferOSKeys,
  TQueryGetDataBase,
} from "../interfaces";

export const postDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const database = request.DataBase.queryResult;
    const newData: IDeveloperRequest = request.body;
    const queryString: string = format(
      `
  INSERT INTO 
  developers (%I)
VALUES(%L)
RETURNING *;
  `,
      Object.keys(newData),
      Object.values(newData)
    );
    const queryResult: TQueryGetDataBase = await client.query(queryString);

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

export const getAllDevelopers = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const dataBase = request.DataBase.queryResult;
  const queryString = `
  SELECT
  de.*,
  dein."developersince",
  dein."preferredos"
FROM
   developers de
LEFT JOIN
   developer_infos dein ON de."developerinfoid" = dein.id;
  `;

  const queryResult = await client.query(queryString);
  return response.status(200).json(queryResult.rows);
};

export const getADeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: Number = parseInt(request.params.id);

  const queryString = `
  SELECT
  de.*,
  dein."developersince",
  dein."preferredos"
FROM
   developers de
FULL JOIN
   developer_infos dein ON de."developerinfoid" = dein.id
  WHERE 
  de.id = $1;  
 `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult = await client.query(queryConfig);
  if (queryResult.rowCount === 0) {
    return response.status(404).json({ message: "Developer not found" });
  }
  return response.status(200).json(queryResult.rows[0]);
};

export const validateInfoDev = async (payload: any, database: any) => {
  const keys: Array<String> = Object.keys(payload);
  const keysOS = payload.preferredOS;
  const requiredKeys: Array<TInfoDevKeys> = ["developerSince", "preferredOS"];
  const preferredOSKeys: Array<TPreferOSKeys> = ["Linux", "Windows", "MacOS"];

  const containRequired: boolean = requiredKeys.every((key: string) => {
    return keys.includes(key);
  });

  const containOSRequired: boolean = preferredOSKeys.includes(keysOS);

  if (!containRequired || keys.length > 2 || keys.length < 2) {
    throw new Error(`Required keys: ${requiredKeys[0]}, ${requiredKeys[1]}. `);
  }

  return payload;
};

export const postDeveloperInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const database = request.DataBase.queryResult;
    const newData = await validateInfoDev(request.body, database);

    const queryString: string = `
    INSERT INTO 
        developer_infos(developerSince, preferredOS)
  VALUES 
      ($1, $2)
  RETURNING *;
    `;
    const queryConfig: QueryConfig = {
      text: queryString,
      values: Object.values(newData),
    };
    const queryResult: TQueryGetDataBase = await client.query(queryConfig);

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

export const deleteDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
  DELETE FROM 
  developers
    WHERE
    id = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult = await client.query(queryConfig);

  if (!queryResult.rowCount) {
    return response.status(404).json({ message: "Developer not found." });
  }

  return response.status(201).json();
};

export const patchDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(request.params.id);
    const newData = Object.values(request.body);
    const keysData = Object.keys(request.body);

    const formatString: string = format(
      `
    UPDATE 
    developers
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

export const patchDeveloperInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(request.params.id);
    const newData = Object.values(request.body);
    const keysData = Object.keys(request.body);

    const formatString: string = format(
      `
    UPDATE 
    developer_infos
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

// export const getDeveloperProjects = async (
//   request: Request,
//   response: Response
// ): Promise<Response> => {
//   try {

//     const queryString = `SELECT
// de.*,
// dein."developersince",
// dein."preferredos"
// FROM
//  developers de
// FULL JOIN
//  developer_infos dein ON de."developerinfoid" = dein.id
// WHERE
// de.id = $1; `;

//     return response.status(201);
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
