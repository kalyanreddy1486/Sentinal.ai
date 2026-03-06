import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

function NASAValidation() {
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Placeholder - will be populated when NASA CMAPSS dataset is integrated
    fetchValidationData();
  }, []);

  const fetchValidationData = async () => {
    try {
      // This will be connected to actual NASA validation endpoint
      // For now, showing placeholder structure
      const mockData = {
        status: 'pending_integration',
        message: 'NASA CMAPSS dataset validation pending Step 27 completion',
        placeholder_metrics: {
          rmse: null,
          mae: null,
          prediction_accuracy: null,
          rul_correlation: null
        }
      };
      
      setValidationData(mockData);
    } catch (error) {
      console.error('Failed to fetch validation data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">NASA CMAPSS Validation</h2>
          <p className="text-gray-400 text-sm mt-1">
            Model validation against NASA turbofan degradation dataset
          </p>
        </div>
        
        <div className="flex gap-2">
          {['overview', 'accuracy', 'comparison', 'datasets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-slate-800 text-gray-400 border border-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Integration Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🚀</div>
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">
              Step 27 Pending: NASA CMAPSS Dataset Integration
            </h3>
            <p className="text-gray-300 mb-4">
              This dashboard will display validation metrics comparing SENTINEL AI's predictions 
              against the NASA CMAPSS (Commercial Modular Aero-Propulsion System Simulation) dataset.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-gray-500 mb-1">Dataset</div>
                <div className="text-white">NASA CMAPSS Turbofan Degradation</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-gray-500 mb-1">Status</div>
                <div className="text-amber-400">Pending Integration</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'RMSE', value: '—', desc: 'Root Mean Square Error' },
          { label: 'MAE', value: '—', desc: 'Mean Absolute Error' },
          { label: 'Accuracy', value: '—', desc: 'Prediction Accuracy' },
          { label: 'RUL Corr', value: '—', desc: 'RUL Correlation' }
        ].map((metric, idx) => (
          <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 opacity-50">
            <div className="text-gray-500 text-xs mb-1">{metric.label}</div>
            <div className="text-2xl font-bold text-white">{metric.value}</div>
            <div className="text-xs text-gray-500 mt-1">{metric.desc}</div>
          </div>
        ))}
      </div>

      {/* Placeholder Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Prediction vs Actual</h3>
          <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-lg">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>Chart will display after dataset integration</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">RUL Distribution</h3>
          <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-lg">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📈</div>
              <p>Chart will display after dataset integration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Information */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">About NASA CMAPSS Dataset</h3>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-cyan-400 font-medium mb-2">Dataset Overview</div>
            <p className="text-gray-400">
              The CMAPSS dataset contains simulated turbofan engine degradation data 
              under various operational conditions and fault modes.
            </p>
          </div>
          <div>
            <div className="text-cyan-400 font-medium mb-2">Validation Metrics</div>
            <ul className="text-gray-400 space-y-1">
              <li>• RUL Prediction Accuracy</li>
              <li>• Failure Time Estimation</li>
              <li>• Sensor Trend Correlation</li>
              <li>• False Positive/Negative Rates</li>
            </ul>
          </div>
          <div>
            <div className="text-cyan-400 font-medium mb-2">Expected Benefits</div>
            <ul className="text-gray-400 space-y-1">
              <li>• Benchmark against industry standard</li>
              <li>• Validate prediction accuracy</li>
              <li>• Improve model reliability</li>
              <li>• Build customer confidence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NASAValidation;
