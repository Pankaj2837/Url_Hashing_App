/* Create the database */
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'UrlShortenerDB')
BEGIN
  CREATE DATABASE UrlShortenerDB;
END
GO

USE UrlShortenerDB;
GO

/* Create the Login for the server */
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'shortener_app')
BEGIN
    CREATE LOGIN shortener_app WITH PASSWORD = 'DevShorten@2026!', CHECK_POLICY = OFF;
END
GO

/* Create the User for this specific database */
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'shortener_app')
BEGIN
    CREATE USER shortener_app FOR LOGIN shortener_app;
    ALTER ROLE db_owner ADD MEMBER shortener_app;
END
GO
USE UrlShortenerDB;
GO

-- 1. Users Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE Users (
        id INT PRIMARY KEY IDENTITY(1,1),
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        passwordHash VARCHAR(MAX) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- 2. URLs Table (Optimized for High-Read)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[URLs]') AND type in (N'U'))
BEGIN
    CREATE TABLE URLs (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        long_url VARCHAR(2048) NOT NULL,
        short_code VARCHAR(10) COLLATE Latin1_General_BIN NOT NULL UNIQUE, -- Binary collation for case-sensitive Base62
        user_id INT FOREIGN KEY REFERENCES Users(id),
        created_at DATETIME DEFAULT GETDATE(),
        created_by INT FOREIGN KEY REFERENCES Users(id),
        clicks BIGINT DEFAULT 0
    );

    -- Optimized Index for Redirection Lookups
    CREATE UNIQUE INDEX IX_URLs_ShortCode ON URLs(short_code);
END
GO