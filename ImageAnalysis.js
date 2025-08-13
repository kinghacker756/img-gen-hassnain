import React, { useState } from 'react';
import { analyzeImage } from '../services/imageService';

function ImageAnalysis() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    try {
      const analysisResults = await analyzeImage(file);
      setResults(analysisResults);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-analysis">
      <h2>Image Analysis</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </form>
      {results && (
        <div className="results">
          <h3>Analysis Results:</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ImageAnalysis;