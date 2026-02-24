const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

let db;
let mode = 'mysql';

async function initDB() {
    if (db) return db;

    if (process.env.DB_TYPE === 'sqlite') {
        db = await open({
            filename: path.join(__dirname, 'database.sqlite'),
            driver: sqlite3.Database
        });
        console.log(`✅ SQLite connected (Direct Mode) to: ${path.basename(path.join(__dirname, 'database.sqlite'))}`);
        mode = 'sqlite';
        return db;
    }

    if (process.env.DB_TYPE === 'postgres') {
        try {
            const pool = new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
            });
            // Test connection
            await pool.query('SELECT NOW()');
            console.log(`✅ PostgreSQL connected to database: ${process.env.DB_NAME}`);
            db = pool;
            mode = 'postgres';
            return db;
        } catch (err) {
            console.warn("⚠️ PostgreSQL connection failed, falling back to SQLite:", err.message);
            db = await open({
                filename: path.join(__dirname, 'database.sqlite'),
                driver: sqlite3.Database
            });
            console.log(`✅ SQLite connected (Failover Mode) to: ${path.basename(path.join(__dirname, 'database.sqlite'))}`);
            mode = 'sqlite';
            return db;
        }
    }

    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            connectTimeout: 2000 // Fast fail for connection
        });
        // Test connection
        const conn = await pool.getConnection();
        conn.release();
        console.log("✅ MySQL connected.");
        db = pool;
        mode = 'mysql';
    } catch (err) {
        console.warn("⚠️ MySQL connection failed, falling back to SQLite:", err.message);
        db = await open({
            filename: path.join(__dirname, 'database.sqlite'),
            driver: sqlite3.Database
        });
        console.log("✅ SQLite connected (Failover Mode).");
        mode = 'sqlite';
    }
    return db;
}

const wrapper = {
    execute: async (sql, params = []) => {
        if (!db) await initDB();

        if (mode === 'mysql') {
            return await db.execute(sql, params);
        } else if (mode === 'postgres') {
            // Postgres uses $1, $2, etc. instead of ?
            let postgresSql = sql.trim();
            let count = 1;
            while (postgresSql.includes('?')) {
                postgresSql = postgresSql.replace('?', `$${count++}`);
            }

            // Automatically add RETURNING id for INSERT queries if not present
            const isInsert = postgresSql.toLowerCase().startsWith('insert');
            if (isInsert && !postgresSql.toLowerCase().includes('returning')) {
                postgresSql += ' RETURNING id';
            }

            const result = await db.query(postgresSql, params);
            const normalizedSql = sql.trim().toLowerCase();
            const isQuery = normalizedSql.startsWith('select');

            if (isQuery) {
                return [result.rows, null];
            } else {
                return [{
                    insertId: result.rows[0]?.id || (result.rowCount > 0 ? true : null),
                    affectedRows: result.rowCount
                }, null];
            }
        } else {
            const normalizedSql = sql.trim().toLowerCase();
            const isQuery = normalizedSql.startsWith('select');

            if (isQuery) {
                const rows = await db.all(sql, params);
                return [rows, null];
            } else {
                const result = await db.run(sql, params);
                return [{
                    insertId: result.lastID,
                    affectedRows: result.changes
                }, null];
            }
        }
    }
};

module.exports = wrapper;
