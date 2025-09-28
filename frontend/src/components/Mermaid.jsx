import React, { useState } from 'react';
import axios from 'axios';

// This component assumes Tailwind CSS is set up in your project.
function Mermaid() {
  const [prompt, setPrompt] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMermaidCode('');

    try {
      // Call our backend API
      const response = await axios.post('https://mermaidapi.onrender.com/api/generate-mermaid', {
        prompt,
      });
      setMermaidCode(response.data.mermaidCode);
    } catch (err) {
      console.error('Error fetching Mermaid code:', err);
      setError('Failed to generate diagram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-indigo-900">
        AI Mermaid Syntax Generator 🧜‍♀️
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Enter a prompt to generate a diagram (e.g., "flowchart for user login" or "database schema").
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the diagram you want to create..."
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-md resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="py-3 px-6 bg-indigo-600 text-white font-bold rounded-md cursor-pointer transition-colors duration-200 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Diagram'}
        </button>
      </form>

      {error && <p className="text-center text-red-600 font-medium mt-4">{error}</p>}

      {mermaidCode && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated Mermaid Syntax:</h2>
          <textarea
            readOnly
            value={mermaidCode.trim()}
            rows="15"
            className="w-full p-3 bg-indigo-50 text-indigo-900 font-mono rounded-md border border-gray-300"
          />
        </div>
      )}
    </div>
  );
}

export default Mermaid;
