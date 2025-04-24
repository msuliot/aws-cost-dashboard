import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/costs', async (req, res) => {
    try {
        const { stdout } = await execAsync('python ../app.py --json');
        const costs = JSON.parse(stdout);
        res.json(costs);
    } catch (error) {
        console.error('Error fetching costs:', error);
        res.status(500).json({ error: 'Failed to fetch cost data' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 