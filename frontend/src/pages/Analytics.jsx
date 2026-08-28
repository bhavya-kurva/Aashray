import React, { useEffect, useState } from 'react';
import { getIncidents, getResources } from '../services/api';
import Navbar from '../components/Navbar';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Shield, CheckCircle, AlertOctagon, Heart, Home, Package,
  TrendingUp, Clock, Users 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981'];

const Analytics = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncidents: 0,
    activeIncidents: 0,
    criticalIncidents: 0,
    resolvedIncidents: 0,
    totalTeams: 0,
    availableTeams: 0,
    shelterOccupancy: 0,
    shelterTotal: 0
  });

  const [severityData, setSeverityData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [shelterChartData, setShelterChartData] = useState([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const incidents = await getIncidents();
        const resources = await getResources();

        const active = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED');
        const resolved = incidents.filter(i => i.status === 'RESOLVED').length;
        const critical = active.filter(i => i.severity === 'Critical').length;
        
        const teams = resources.rescue_teams || [];
        const availableTeams = teams.filter(t => t.status === 'AVAILABLE').length;

        const shelters = resources.shelters || [];
        const totalShelterCap = shelters.reduce((acc, s) => acc + s.total_capacity, 0);
        const occupiedShelterCap = shelters.reduce((acc, s) => acc + s.occupied_capacity, 0);

        setSummary({
          totalIncidents: incidents.length,
          activeIncidents: active.length,
          criticalIncidents: critical,
          resolvedIncidents: resolved,
          totalTeams: teams.length,
          availableTeams: availableTeams,
          shelterOccupancy: occupiedShelterCap,
          shelterTotal: totalShelterCap
        });

        // 1. Severity Distribution Data
        const sevCount = active.reduce((acc, inc) => {
          acc[inc.severity] = (acc[inc.severity] || 0) + 1;
          return acc;
        }, {});
        setSeverityData([
          { name: 'Critical', value: sevCount['Critical'] || 0, color: '#ef4444' },
          { name: 'High', value: sevCount['High'] || 0, color: '#f97316' },
          { name: 'Medium', value: sevCount['Medium'] || 0, color: '#eab308' },
          { name: 'Low', value: sevCount['Low'] || 0, color: '#3b82f6' }
        ]);

        // 2. Incident Types Data
        const typeCount = incidents.reduce((acc, inc) => {
          acc[inc.incident_type] = (acc[inc.incident_type] || 0) + 1;
          return acc;
        }, {});
        setTypeData(Object.keys(typeCount).map(k => ({
          name: k,
          count: typeCount[k]
        })));

        // 3. Shelters Occupancy Data
        setShelterChartData(shelters.slice(0, 5).map(s => ({
          name: s.name.replace(" Relief Center", "").replace(" Multi-Purpose Cyclone Shelter", "").substring(0, 15),
          Occupied: s.occupied_capacity,
          Available: s.total_capacity - s.occupied_capacity
        })));

      } catch (error) {
        console.error("Failed loading analytics", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center">
        <span className="h-10 w-10 border-4 border-blue-205 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm text-slate-600 font-semibold mt-3">Compiling disaster database logs...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col max-w-6xl mx-auto px-6 py-8 space-y-8 overflow-y-auto bg-slate-50">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-blue-700">
          Incident Response & Relief Analytics
        </h1>
        <p className="text-xs text-slate-500 font-bold">Aggregated coordination performance counters</p>
      </div>

      {/* Analytics KPI cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center space-x-4 shadow-sm">
          <div className="bg-red-50 text-red-655 text-red-600 p-3 rounded-lg border border-red-100">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Disasters</span>
            <h3 className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5">{summary.activeIncidents}</h3>
            <p className="text-[10px] text-red-600 font-bold mt-0.5">{summary.criticalIncidents} Critical Warnings</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center space-x-4 shadow-sm">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg border border-emerald-100">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Resolved Incidents</span>
            <h3 className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5">{summary.resolvedIncidents}</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Total tickets: {summary.totalIncidents}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center space-x-4 shadow-sm">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg border border-blue-100">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rescue Units</span>
            <h3 className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5">
              {summary.availableTeams} <span className="text-xs text-slate-500">/ {summary.totalTeams}</span>
            </h3>
            <p className="text-[10px] text-blue-605 text-blue-600 font-bold mt-0.5">Units Ready for Dispatch</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center space-x-4 shadow-sm">
          <div className="bg-teal-50 text-teal-600 p-3 rounded-lg border border-teal-100">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Camp Shelter Load</span>
            <h3 className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5">
              {Math.round((summary.shelterOccupancy / (summary.shelterTotal || 1)) * 100)}%
            </h3>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">{summary.shelterOccupancy} in camps / {summary.shelterTotal} cap</p>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Severity Breakdown (Pie) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-80">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Active Incidents by Severity
          </h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(val) => <span className="text-slate-600 text-[10px] font-bold">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Type counts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-80">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Historical Incident Type Counts
          </h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Shelters Occupancy ratios */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-80">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Shelters Occupancy (Top 5)
          </h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelterChartData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={9} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={24} iconType="square" formatter={(v) => <span className="text-slate-655 text-slate-600 text-[10px] font-bold">{v}</span>} />
                <Bar dataKey="Occupied" stackId="a" fill="#14b8a6" />
                <Bar dataKey="Available" stackId="a" fill="#e2e8f0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Efficiency performance metrics */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col space-y-4 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Operational Efficiency Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-inner">
            <div>
              <strong className="text-slate-800 block">Avg Dispatch Latency</strong>
              <span className="text-[10px] text-slate-500 font-semibold">From verified to team en route</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold font-mono text-blue-600">12.4 min</span>
              <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Odisha regional avg</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-inner">
            <div>
              <strong className="text-slate-800 block">Average Response Time</strong>
              <span className="text-[10px] text-slate-500 font-semibold">From report to safety camp arrival</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold font-mono text-emerald-600">2.8 hours</span>
              <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Targets: &lt; 4 hours</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-inner">
            <div>
              <strong className="text-slate-800 block">SMS Parsing Success</strong>
              <span className="text-[10px] text-slate-500 font-semibold">Locality resolution rate</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold font-mono text-blue-600">92.5%</span>
              <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Using regional lookup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

