import { useState } from 'react';
import { API_BASE_URL } from '../../config';

export default function OnboardingWizard({ onComplete, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    machineType: '',
    sensorData: {}
  });
  const [sensorInput, setSensorInput] = useState('');
  const [validation, setValidation] = useState(null);

  const machineTypes = [
    { value: '', label: 'Auto-detect', description: 'Let AI identify from sensors' },
    { value: 'gas_turbine', label: 'Gas Turbine', description: 'Power generation turbines' },
    { value: 'compressor', label: 'Compressor', description: 'Industrial air/gas compressors' },
    { value: 'pump', label: 'Pump', description: 'Fluid transfer pumps' },
    { value: 'motor', label: 'Electric Motor', description: 'Industrial motors' },
    { value: 'generator', label: 'Generator', description: 'Power generators' }
  ];

  const addSensor = () => {
    if (!sensorInput.trim()) return;
    const [name, value] = sensorInput.split('=').map(s => s.trim());
    if (name && !isNaN(parseFloat(value))) {
      setFormData(prev => ({
        ...prev,
        sensorData: {
          ...prev.sensorData,
          [name]: parseFloat(value)
        }
      }));
      setSensorInput('');
    }
  };

  const removeSensor = (name) => {
    setFormData(prev => {
      const newSensors = { ...prev.sensorData };
      delete newSensors[name];
      return { ...prev, sensorData: newSensors };
    });
  };

  const validateSensors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/onboarding/validate-sensors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.sensorData)
      });
      const data = await response.json();
      setValidation(data);
      if (data.ready_for_onboarding) {
        setStep(3);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        machine_name: formData.name,
        location: formData.location,
        ...(formData.machineType && { machine_type_hint: formData.machineType })
      });

      const response = await fetch(`${API_BASE_URL}/onboarding/discover?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.sensorData)
      });

      const data = await response.json();
      setResult(data);
      setStep(4);
      onComplete?.(data);
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Step 1: Machine Information</h3>
      
      <div>
        <label className="text-sm text-slate-400">Machine Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Turbine Alpha"
          className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          placeholder="e.g., Building A, Floor 2"
          className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400">Machine Type (Optional)</label>
        <select
          value={formData.machineType}
          onChange={(e) => setFormData({...formData, machineType: e.target.value})}
          className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white"
        >
          {machineTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label} - {type.description}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!formData.name || !formData.location}
        className="w-full px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 disabled:opacity-50"
      >
        Next: Add Sensors
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Step 2: Sensor Data</h3>
      <p className="text-sm text-slate-400">
        Enter sensor readings in format: name=value (e.g., temperature=75.5)
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={sensorInput}
          onChange={(e) => setSensorInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSensor()}
          placeholder="temperature=75.5"
          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white"
        />
        <button
          onClick={addSensor}
          className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
        >
          Add
        </button>
      </div>

      {/* Sensor List */}
      <div className="space-y-2">
        {Object.entries(formData.sensorData).map(([name, value]) => (
          <div key={name} className="flex items-center justify-between bg-slate-900/50 p-2 rounded">
            <span className="text-white">{name}: {value}</span>
            <button
              onClick={() => removeSensor(name)}
              className="text-rose-400 hover:text-rose-300"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {Object.keys(formData.sensorData).length >= 2 && (
        <button
          onClick={validateSensors}
          disabled={loading}
          className="w-full px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50"
        >
          {loading ? 'Validating...' : 'Validate & Continue'}
        </button>
      )}

      <button
        onClick={() => setStep(1)}
        className="w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
      >
        Back
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Step 3: Review Configuration</h3>

      {validation && (
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${validation.ready_for_onboarding ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-white">
              {validation.ready_for_onboarding ? 'Ready for onboarding' : 'Additional sensors recommended'}
            </span>
          </div>

          {validation.suggested_machine_type && (
            <div className="text-sm">
              <span className="text-slate-400">Detected Type:</span>
              <span className="text-cyan-400 ml-2">{validation.suggested_machine_type}</span>
            </div>
          )}

          <div className="text-sm text-slate-400">
            Sensors: {validation.sensor_count} detected
          </div>
        </div>
      )}

      <button
        onClick={submitOnboarding}
        disabled={loading}
        className="w-full px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 disabled:opacity-50"
      >
        {loading ? 'Setting up...' : 'Complete Onboarding'}
      </button>

      <button
        onClick={() => setStep(2)}
        className="w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
      >
        Back
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-xl font-semibold text-white">Machine Onboarded!</h3>
      
      {result && (
        <div className="bg-slate-900/50 rounded-lg p-4 text-left space-y-2">
          <div className="text-sm">
            <span className="text-slate-400">Machine ID:</span>
            <span className="text-cyan-400 ml-2 font-mono">{result.machine.machine_id}</span>
          </div>
          <div className="text-sm">
            <span className="text-slate-400">Sensors:</span>
            <span className="text-white ml-2">{result.configuration.detected_sensors.join(', ')}</span>
          </div>
          <div className="text-sm text-emerald-400">
            Setup completed in {result.machine.setup_time || '< 5 minutes'}
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30"
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add New Machine</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded ${
                s <= step ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
}
