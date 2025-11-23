import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

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

// In-memory storage for conversions (last 10)
const conversionHistory: ConversionRecord[] = [];

// Country base mapping for conversion logic
const countryBaseRates: Record<string, number> = {
  US: 1.0,
  UK: 0.9,
  India: 0.8,
  Canada: 0.95
};

const validCountries = Object.keys(countryBaseRates);

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Convert credit score between countries
function convertScore(countryFrom: string, countryTo: string, score: number): number {
  // Normalize score to base (US as reference)
  const normalizedScore = score / countryBaseRates[countryFrom];
  // Convert to target country
  const convertedScore = normalizedScore * countryBaseRates[countryTo];
  return Math.round(convertedScore * 100) / 100; // Round to 2 decimal places
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// POST /api/convert - Convert credit score between countries
app.post('/api/convert', (req: Request, res: Response) => {
  try {
    const { countryFrom, countryTo, score } = req.body;

    // Validation
    if (!countryFrom || !countryTo || typeof score !== 'number') {
      return res.status(400).json({
        error: 'Missing required fields: countryFrom, countryTo, score'
      });
    }

    if (!validCountries.includes(countryFrom)) {
      return res.status(400).json({
        error: `Invalid countryFrom. Must be one of: ${validCountries.join(', ')}`
      });
    }

    if (!validCountries.includes(countryTo)) {
      return res.status(400).json({
        error: `Invalid countryTo. Must be one of: ${validCountries.join(', ')}`
      });
    }

    if (score < 0 || score > 1000) {
      return res.status(400).json({
        error: 'Score must be between 0 and 1000'
      });
    }

    // Perform conversion
    const convertedScore = convertScore(countryFrom, countryTo, score);

    // Create conversion record
    const conversion: ConversionRecord = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      countryFrom,
      countryTo,
      originalScore: score,
      convertedScore
    };

    // Add to history (keep only last 10)
    conversionHistory.push(conversion);
    if (conversionHistory.length > 10) {
      conversionHistory.shift(); // Remove oldest record
    }

    res.status(201).json(conversion);
  } catch (error) {
    console.error('Error in /api/convert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/history - Get conversion history
app.get('/api/history', (req: Request, res: Response) => {
  try {
    // Return last 10 conversions (most recent first)
    const recentHistory = conversionHistory.slice(-10).reverse();
    res.json(recentHistory);
  } catch (error) {
    console.error('Error in /api/history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Global Wealth ID Backend running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Convert API: http://localhost:${PORT}/api/convert`);
  console.log(`📜 History API: http://localhost:${PORT}/api/history`);
});
