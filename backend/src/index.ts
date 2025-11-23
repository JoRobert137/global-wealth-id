import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000; // one server for frontend + backend

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface ConversionRecord {
  id: string;
  timestamp: string;
  countryFrom: string;
  countryTo: string;
  originalScore: number;
  convertedScore: number;
}

const conversionHistory: ConversionRecord[] = [];

const countryBaseRates: Record<string, number> = {
  US: 1.0,
  UK: 0.9,
  India: 0.8,
  Canada: 0.95
};

const validCountries = Object.keys(countryBaseRates);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function convertScore(countryFrom: string, countryTo: string, score: number): number {
  const normalizedScore = score / countryBaseRates[countryFrom];
  const convertedScore = normalizedScore * countryBaseRates[countryTo];
  return Math.round(convertedScore * 100) / 100;
}

// ✅ Serve frontend (Docker places files in dist/public)
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Convert API
app.post('/api/convert', (req: Request, res: Response) => {
  try {
    const { countryFrom, countryTo, score } = req.body;

    if (!countryFrom || !countryTo || typeof score !== 'number') {
      return res.status(400).json({ error: 'Missing required fields: countryFrom, countryTo, score' });
    }

    if (!validCountries.includes(countryFrom)) {
      return res.status(400).json({ error: `Invalid countryFrom. Must be one of: ${validCountries.join(', ')}` });
    }

    if (!validCountries.includes(countryTo)) {
      return res.status(400).json({ error: `Invalid countryTo. Must be one of: ${validCountries.join(', ')}` });
    }

    if (score < 0 || score > 1000) {
      return res.status(400).json({ error: 'Score must be between 0 and 1000' });
    }

    const convertedScore = convertScore(countryFrom, countryTo, score);

    const conversion: ConversionRecord = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      countryFrom,
      countryTo,
      originalScore: score,
      convertedScore
    };

    conversionHistory.push(conversion);
    if (conversionHistory.length > 10) conversionHistory.shift();

    res.status(201).json(conversion);
  } catch (error) {
    console.error('Error in /api/convert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// History API
app.get('/api/history', (req: Request, res: Response) => {
  try {
    const recentHistory = conversionHistory.slice(-10).reverse();
    res.json(recentHistory);
  } catch (error) {
    console.error('Error in /api/history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SPA fallback — serve index.html
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    return res.status(404).json({ error: 'Endpoint not found' });
  }

  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Global Wealth ID (Frontend + Backend) running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Convert API: http://localhost:${PORT}/api/convert`);
  console.log(`📜 History API: http://localhost:${PORT}/api/history`);
  console.log(`🌍 Frontend: http://localhost:${PORT}/`);
});
