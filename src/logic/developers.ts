import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  IDeveloperRequest,
  TInfoDevKeys,
  TPreferOSKeys,
  TQueryGetDataBase,
  IDeveloperResponse,
} from "../interfaces";

const validateDataPostDeveloper = (
  payload: any,
  database: any
): IDeveloperRequest => {
  const keys: Array<String> = Object.keys(payload);
  const requiredKeys: any = ["name", "email"];
  const containRequired: Boolean = requiredKeys.every((key: String) => {
    return keys.includes(key);
  });

  keys.forEach((e: any) => {
    if (!requiredKeys.includes(e)) {
      delete payload[e];
    }
  });

  const dataBaseIncluds: boolean = database.rows.every(
    (e: IDeveloperResponse) => {
      if (e.email === payload.email) {
        return false;
      } else {
        return true;
      }
    }
  );
  if (!containRequired) {
    throw new Error(`Required keys are ${requiredKeys}`);
  }
  if (!dataBaseIncluds) {
    throw new Error(`email already exists`);
  }

  return payload;
};

export const postDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const dataBase = request.DataBase.queryResult;
    const newData: IDeveloperRequest = validateDataPostDeveloper(
      request.body,
      dataBase
    );
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
  const containOSRequired: boolean = preferredOSKeys.includes(keysOS);

  keys.forEach((e: any) => {
    if (!requiredKeys.includes(e)) {
      delete payload[e];
    }
  });

  const containRequired: boolean = requiredKeys.every((key: string) => {
    return keys.includes(key);
  });

  if (!containRequired) {
    throw new Error(`Required keys: ${requiredKeys[0]}, ${requiredKeys[1]}.`);
  }
  if (!containOSRequired) {
    throw new Error(
      `Required OS: ${preferredOSKeys[0]}, ${preferredOSKeys[1]}, ${preferredOSKeys[2]}.`
    );
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
const validadePatchDeveloper = (payload: any): IDeveloperRequest => {
  const keys: Array<String> = Object.keys(payload);
  const requiredKeys: any = ["name", "email"];

  keys.forEach((e: any) => {
    if (!requiredKeys.includes(e)) {
      delete payload[e];
    }
  });

  return payload;
};

export const patchDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const validatedData = validadePatchDeveloper(request.body);
    const id: number = parseInt(request.params.id);
    const newData = Object.values(validatedData);
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

const validatePatchDeveloperInfo = (payload: any): IDeveloperRequest => {
  const keys: Array<String> = Object.keys(payload);
  const requiredKeys: any = ["preferredos"];
  const preferredOSKeys: Array<TPreferOSKeys> = ["Linux", "Windows", "MacOS"];
  const keysOS = payload.preferredOS;
  const containOSRequired: boolean = preferredOSKeys.includes(keysOS);

  if (!containOSRequired) {
    throw new Error(
      `Required OS: ${preferredOSKeys[0]}, ${preferredOSKeys[1]}, ${preferredOSKeys[2]}.`
    );
  }

  keys.forEach((e: any) => {
    if (!requiredKeys.includes(e)) {
      delete payload[e];
    }
  });

  return payload;
};

export const patchDeveloperInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const validatedData = validatePatchDeveloperInfo(request.body);
    const id: number = parseInt(request.params.id);
    const newData = Object.values(validatedData);
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

export const getDeveloperProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(request.params.id);
    const queryString = `SELECT
    d."id" as "developerID",
    d."name" as "developerName",
    d."email" as "developerEmail",
    d."developerinfoid" as "developerInfoID",
    di."developersince" as "developerInfoDeveloperSince",
    di."preferredos" as "developerInfoPreferredOS",
    pr."id" as "projectID",
    pr."name" as "projectName",
    pr."description" as "projectDescription",
    pr."estimatedTime" as "projectEstimatedTime",
    pr."repository" as "projectRepository",
    pr."startDate" as "projectStartDate",
    pr."endDate" as "projectEndDate",
    t."id" as "technologyId",
    t."name" as "technologyName"
   FROM
   projects pr
   FULL JOIN
   developers d ON pr."developerId" = d.id
   LEFT JOIN 
   developer_infos di ON d.developerinfoid = di.id
   LEFT JOIN 
   technologies t ON pr.id = t.id 
   WHERE
   pr."developerId" = $1
   ; `;
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };
    const queryResult = await client.query(queryConfig);
    if (!queryResult.rowCount) {
      return response.status(404).json({ message: "Projects not found." });
    }

    return response.status(201).json(queryResult.rows);
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
