import React, { useState } from 'react';
import { triggerMockSMS, triggerMockIVR, getAlerts } from '../services/api';
import { Phone, MessageSquare, CloudLightning, RefreshCw, Send, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SimulationPanel = ({ onSimulationTriggered }) => {
  const { t } = useLanguage();
  
  // SMS States
  const [smsMessage, setSmsMessage] = useState('HELP FLOOD HIGH 15 NEAR RASULGARH');
  const [smsPhone, setSmsPhone] = useState('+91 98765 43210');
  const [smsResult, setSmsResult] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);

  // IVR States
  const [ivrPhone, setIvrPhone] = useState('+91 88990 01122');
  const [ivrType, setIvrType] = useState('1'); // 1 = Flood
  const [ivrSeverity, setIvrSeverity] = useState('2'); // 2 = High
  const [ivrPeople, setIvrPeople] = useState('8');
  const [ivrLocality, setIvrLocality] = useState('Patia');
  const [ivrResult, setIvrResult] = useState('');
  const [ivrLoading, setIvrLoading] = useState(false);

  // IMD Alert
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertResult, setAlertResult] = useState('');

  const handleSendSMS = async () => {
    setSmsLoading(true);
    setSmsResult('');
    try {
      const response = await triggerMockSMS(smsMessage, smsPhone);
      setSmsResult(response.reply);
      if (onSimulationTriggered) onSimulationTriggered();
    } catch (error) {
      setSmsResult('SMS Gateway Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSmsLoading(false);
    }
  };

  const handleDialIVR = async () => {
    setIvrLoading(true);
    setIvrResult('');
    try {
      const response = await triggerMockIVR({
        from_phone: ivrPhone,
        disaster_type_key: ivrType,
        severity_key: ivrSeverity,
        people_affected: parseInt(ivrPeople, 10),
        locality: ivrLocality
      });
      setIvrResult(`IVR Server: ${response.message}. Created ${response.incident_id}`);
      if (onSimulationTriggered) onSimulationTriggered();
    } catch (error) {
      setIvrResult('IVR System Failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIvrLoading(false);
    }
  };

  const handleSyncAlerts = async () => {
    setAlertLoading(true);
    setAlertResult('');
    try {
      const alerts = await getAlerts();
      setAlertResult(`Synced ${alerts.length} IMD Weather Advisories successfully!`);
      if (onSimulationTriggered) onSimulationTriggered();
    } catch (error) {
      setAlertResult('Advisory Sync Failed: ' + error.message);
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-800 space-y-6">
      <div className="border-b border-slate-200 pb-3 flex items-center space-x-2">
        <CloudLightning className="h-5 w-5 text-blue-600" />
        <h2 className="text-sm font-extrabold text-slate-900">Developer Simulation Tools</h2>
      </div>

      {/* SMS Fallback Section */}
      <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold flex items-center space-x-2 text-indigo-600">
          <MessageSquare className="h-4 w-4" />
          <span>{t('smsSim')} (No-Internet Fallback)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Simulated Sender Number</label>
            <input
              type="text"
              value={smsPhone}
              onChange={(e) => setSmsPhone(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Raw SMS Message</label>
            <input
              type="text"
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-semibold"
            />
          </div>
        </div>

        <button
          onClick={handleSendSMS}
          disabled={smsLoading}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow disabled:opacity-50"
        >
          {smsLoading ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
          <span>Transmit SMS Request</span>
        </button>

        {smsResult && (
          <div className="bg-indigo-50/40 border border-indigo-200 p-3 rounded-lg text-xs text-indigo-750 text-indigo-700 font-semibold font-mono">
            <strong>Incoming Reply: </strong> {smsResult}
          </div>
        )}
      </div>

      {/* IVR Fallback Section */}
      <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold flex items-center space-x-2 text-emerald-600">
          <Phone className="h-4 w-4" />
          <span>{t('ivrSim')} (Voice Hotline)</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Caller Phone</label>
            <input
              type="text"
              value={ivrPhone}
              onChange={(e) => setIvrPhone(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Type Option (Keypad)</label>
            <select
              value={ivrType}
              onChange={(e) => setIvrType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-bold cursor-pointer"
            >
              <option value="1">1 - Flood</option>
              <option value="2">2 - Cyclone</option>
              <option value="3">3 - Landslide</option>
              <option value="4">4 - Fire</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Severity Option</label>
            <select
              value={ivrSeverity}
              onChange={(e) => setIvrSeverity(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-bold cursor-pointer"
            >
              <option value="1">1 - Critical</option>
              <option value="2">2 - High</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - Low</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Affected Count</label>
            <input
              type="number"
              value={ivrPeople}
              onChange={(e) => setIvrPeople(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-semibold"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-500 font-bold mb-1">Spoken Locality Name (Speech-to-Text)</label>
            <select
              value={ivrLocality}
              onChange={(e) => setIvrLocality(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-bold cursor-pointer"
            >
              <option value="Patia">Patia (Bhubaneswar)</option>
              <option value="Rasulgarh">Rasulgarh (Bhubaneswar)</option>
              <option value="Nayapalli">Nayapalli (Bhubaneswar)</option>
              <option value="Cuttack">Cuttack (Mahanadi Basin)</option>
              <option value="Puri">Puri (Coastal Area)</option>
              <option value="Balasore">Balasore (Coastal Region)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleDialIVR}
          disabled={ivrLoading}
          className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow disabled:opacity-50"
        >
          {ivrLoading ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          <span>Dial Emergency Hotline</span>
        </button>

        {ivrResult && (
          <div className="bg-emerald-50/40 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-700 font-semibold font-mono">
            <strong>Hotline Log: </strong> {ivrResult}
          </div>
        )}
      </div>

      {/* IMD Advisories Trigger */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
        <div className="text-xs">
          <h4 className="font-extrabold text-slate-800">IMD Alert Sync Feed</h4>
          <p className="text-slate-500 text-[10px] font-semibold mt-0.5">Triggers fetch from IMD weather advisory feeds</p>
        </div>
        <button
          onClick={handleSyncAlerts}
          disabled={alertLoading}
          className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-blue-600 border border-slate-350 border-slate-300 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm"
        >
          {alertLoading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span>Sync Feeds</span>
        </button>
      </div>
      {alertResult && (
        <p className="text-[11px] text-blue-600 font-bold text-center font-mono mt-1">{alertResult}</p>
      )}
    </div>
  );
};

export default SimulationPanel;

