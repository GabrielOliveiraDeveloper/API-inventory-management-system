import 'dotenv/config';
import express from 'express';
import connectToDB from './db/connectToDB.js';
import authRoutes from './routes/authRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import movementRoutes from './routes/movementRoutes.js';
import { globalLimiter } from './middlewares/RateLimiter.js';

import cors from 'cors';

const app = express();
connectToDB();

app.use(cors());
app.use(express.json());
app.use(globalLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/movements', movementRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

