
CREATE TYPE os AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developer_infos(
"id" BIGSERIAL PRIMARY KEY,
"developersince" DATE NOT NULL,
"preferredos" os NOT NULL
);

CREATE TABLE IF NOT EXISTS developers(
"id"  BIGSERIAL PRIMARY KEY,
"name" VARCHAR(50) NOT NULL,
"email" VARCHAR(50) NOT NULL,
"developerinfoid" integer UNIQUE,
FOREIGN KEY ("developerinfoid") REFERENCES developer_infos("id")
);
	
CREATE TABLE IF NOT EXISTS projects(
"id"  BIGSERIAL PRIMARY KEY,
"name" VARCHAR(50) NOT NULL,
"description" VARCHAR(600) NOT NULL,
"estimatedTime" VARCHAR(20) NOT NULL ,
"repository" VARCHAR(120) NOT NULL,
"startDate" DATE NOT NULL,
"endDate" DATE,
"developerId" INTEGER NOT NULL, 
FOREIGN KEY ("developerId") REFERENCES developers("id")
);

    CREATE TABLE IF NOT EXISTS technologies_projects(
    "id" BIGSERIAL PRIMARY KEY,
    "addedIn" DATE NOT NULL,
    "projectId" integer NOT NULL,
    "technologyId" integer NOT NULL,
    FOREIGN KEY ("projectId") REFERENCES projects("id"),
    FOREIGN KEY ("technologyId") REFERENCES technologies("id")
    );  
    	
CREATE TABLE IF NOT EXISTS technologies(
"id"  BIGSERIAL PRIMARY KEY,
"name" VARCHAR(30) NOT NULL
);

INSERT INTO technologies (name)
values 
('JavaScript'),
('Python'),
('React'),
('Express.js'),
('HTML'),
('CSS'),
('Django'),
('PostgreSQL'),
('MongoDB')
RETURNING*;