// scripts/test-db-connection.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

db.users.updateOne({ email: 'admin@example.com' }, { $set: { role: 'admin' } });
