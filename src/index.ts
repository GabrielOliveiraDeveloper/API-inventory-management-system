import 'dotenv/config';

import express from 'express';
import connectToDB from './db/connectToDB.js';
import cors from 'cors';

const app = express();

connectToDB();

app.use(cors());
app.use(express.json());

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

