import React, { useState, useEffect } from 'react';

interface ConversionRecord {
  id: string;
  timestamp: string;
  countryFrom: string;
  countryTo: string;
  originalScore: number;
  convertedScore: number;
}

interface ConversionFormData {
  countryFrom: string;
  countryTo: string;
  score: number;
}

const COUNTRIES = ['US', 'UK', 'India', 'Canada'];
const BACKEND_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;

function App() {
  const [formData, setFormData] = useState<ConversionFormData>({
    countryFrom: 'US',
    countryTo: 'UK',
    score: 750
  });
  
  const [convertedScore, setConvertedScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionRecord[]>([]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleInputChange = (field: keyof ConversionFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear previous results when form changes
    setConvertedScore(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const result = await response.json();
      setConvertedScore(result.convertedScore);
      
      // Refresh history after successful conversion
      await fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setConvertedScore(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🌍 Global Wealth ID</h1>
        <p style={styles.subtitle}>Convert credit scores between countries</p>
      </header>

      <main style={styles.main}>
        <div style={styles.formCard}>
          <h2 style={styles.cardTitle}>Credit Score Conversion</h2>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                From Country:
                <select
                  value={formData.countryFrom}
                  onChange={(e) => handleInputChange('countryFrom', e.target.value)}
                  style={styles.select}
                  required
                >
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                To Country:
                <select
                  value={formData.countryTo}
                  onChange={(e) => handleInputChange('countryTo', e.target.value)}
                  style={styles.select}
                  required
                >
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Credit Score:
                <input
                  type="number"
                  value={formData.score}
                  onChange={(e) => handleInputChange('score', parseInt(e.target.value))}
                  style={styles.input}
                  min="0"
                  max="1000"
                  required
                />
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
            >
              {isLoading ? 'Converting...' : 'Convert Score'}
            </button>
          </form>

          {error && (
            <div style={styles.error}>
              ❌ {error}
            </div>
          )}

          {convertedScore !== null && !error && (
            <div style={styles.result}>
              <h3 style={styles.resultTitle}>Conversion Result</h3>
              <p style={styles.resultText}>
                {formData.score} {formData.countryFrom} → <strong>{convertedScore}</strong> {formData.countryTo}
              </p>
            </div>
          )}
        </div>

        <div style={styles.historyCard}>
          <h2 style={styles.cardTitle}>📋 Recent Checks</h2>
          
          {history.length === 0 ? (
            <p style={styles.emptyHistory}>No conversions yet. Try converting a score!</p>
          ) : (
            <div style={styles.historyList}>
              {history.map((record) => (
                <div key={record.id} style={styles.historyItem}>
                  <div style={styles.historyMain}>
                    <span style={styles.historyScore}>
                      {record.originalScore} {record.countryFrom} → {record.convertedScore} {record.countryTo}
                    </span>
                    <span style={styles.historyTime}>
                      {formatTimestamp(record.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 10px 0'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#7f8c8d',
    margin: '0'
  },
  main: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  formCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    height: 'fit-content'
  },
  historyCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    height: 'fit-content',
    maxHeight: '600px',
    overflow: 'auto'
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 20px 0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontWeight: 'bold',
    color: '#34495e',
    fontSize: '0.9rem'
  },
  input: {
    padding: '12px',
    border: '2px solid #e1e8ed',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
    outline: 'none'
  },
  select: {
    padding: '12px',
    border: '2px solid #e1e8ed',
    borderRadius: '6px',
    fontSize: '1rem',
    backgroundColor: 'white',
    transition: 'border-color 0.3s',
    outline: 'none'
  },
  button: {
    padding: '15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed'
  },
  error: {
    padding: '15px',
    backgroundColor: '#fdf2f2',
    color: '#dc3545',
    border: '1px solid #f5c6cb',
    borderRadius: '6px',
    marginTop: '20px'
  },
  result: {
    padding: '20px',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '6px',
    marginTop: '20px'
  },
  resultTitle: {
    margin: '0 0 10px 0',
    color: '#155724',
    fontSize: '1.2rem'
  },
  resultText: {
    margin: '0',
    color: '#155724',
    fontSize: '1.1rem'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  historyItem: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '6px'
  },
  historyMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  historyScore: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '1rem'
  },
  historyTime: {
    fontSize: '0.85rem',
    color: '#7f8c8d'
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    padding: '40px 20px'
  }
};

// Media query for mobile responsiveness
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  if (mediaQuery.matches) {
    styles.main = {
      ...styles.main,
      gridTemplateColumns: '1fr',
      gap: '20px'
    };
  }
}

export default App;
