import app from './app.js';

import connectDB from './config/database.js';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
