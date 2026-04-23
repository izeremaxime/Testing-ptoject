import app from './app.js';
import connectDB from './config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running in ${PORT}`);
        });
});
