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
        UserId INT PRIMARY KEY IDENTITY(1,1),
        Username VARCHAR(50) NOT NULL UNIQUE,
        PasswordHash VARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END

-- 2. Urls Table (Optimized for High-Read)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Urls]') AND type in (N'U'))
BEGIN
    CREATE TABLE Urls (
        UrlId BIGINT PRIMARY KEY IDENTITY(1,1),
        OriginalUrl VARCHAR(2048) NOT NULL,
        ShortCode VARCHAR(10) COLLATE Latin1_General_BIN NOT NULL, -- Binary collation for case-sensitive Base62
        CreatedBy INT FOREIGN KEY REFERENCES Users(UserId),
        CreatedAt DATETIME DEFAULT GETDATE(),
        ClickCount BIGINT DEFAULT 0
    );

    -- Optimized Index for Redirection Lookups
    CREATE UNIQUE INDEX IX_Urls_ShortCode ON Urls(ShortCode);
END
GO