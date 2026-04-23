import express from 'express';
import cors from 'cors';
import todoRoutes from './routes/todoRoutes.js';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/todos', todoRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'SQA Course Environment is ready!',
        moduleType: 'ES modules',
        modeVersion: process.version
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});



app.use((error, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Server Error'
    });
});

export default app;
