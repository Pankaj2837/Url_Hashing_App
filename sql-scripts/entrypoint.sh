#!/bin/bash

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &
SQL_PID=$!

# Wait for SQL Server to start (up to 60 seconds)
echo "Waiting for SQL Server to start..."
counter=0
while [ $counter -lt 60 ]; do
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${MSSQL_SA_PASSWORD}" -Q "SELECT 1" -C 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "SQL Server is ready!"
        break
    fi
    counter=$((counter + 1))
    sleep 1
done

# Run the initialization script with error handling
echo "Running initialization script..."
if [ -f /usr/config/sql-scripts/init.sql ]; then
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${MSSQL_SA_PASSWORD}" -i /usr/config/sql-scripts/init.sql -C
    if [ $? -eq 0 ]; then
        echo "✓ Initialization script completed successfully"
    else
        echo "✗ Initialization script failed!"
    fi
else
    echo "✗ init.sql not found!"
fi

# Keep SQL Server running
wait $SQL_PID
