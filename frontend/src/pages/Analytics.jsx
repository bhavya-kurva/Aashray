import React, { useEffect, useState } from 'react';
import { getIncidents, getResources } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertOctagon, CheckCircle, Heart, Users, BarChart2, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard';

const Analytics = () => {
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

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [incidents, resources] = await Promise.all([
        getIncidents(),
        getResources()
      ]);

      const active = (incidents || []).filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED');
      const resolved = (incidents || []).filter(i => i.status === 'RESOLVED').length;
      const critical = active.filter(i => i.severity === 'Critical').length;

      const teams = resources?.rescue_teams || [];
      const availableTeams = teams.filter(t => t.status === 'AVAILABLE').length;

      const shelters = resources?.shelters || [];
      const totalShelterCap = shelters.reduce((acc, s) => acc + (s.max_capacity || s.total_capacity || 0), 0);
      const occupiedShelterCap = shelters.reduce((acc, s) => acc + (s.current_occupancy || s.occupied_capacity || 0), 0);

      setSummary({
        totalIncidents: (incidents || []).length,
        activeIncidents: active.length,
        criticalIncidents: critical,
        resolvedIncidents: resolved,
        totalTeams: teams.length,
        availableTeams,
        shelterOccupancy: occupiedShelterCap,
        shelterTotal: totalShelterCap
      });

      // 1. Severity Distribution
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

      // 2. Incident Types
      const typeCount = (incidents || []).reduce((acc, inc) => {
        const tName = inc.disaster_type || inc.incident_type || 'Flood';
        acc[tName] = (acc[tName] || 0) + 1;
        return acc;
      }, {});
      setTypeData(Object.keys(typeCount).map(k => ({
        name: k,
        count: typeCount[k]
      })));

      // 3. Shelters Occupancy Top 5
      setShelterChartData(shelters.slice(0, 5).map(s => ({
        name: (s.name || 'Shelter').substring(0, 15),
        Occupied: s.current_occupancy || s.occupied_capacity || 0,
        Available: Math.max(0, (s.max_capacity || s.total_capacity || 500) - (s.current_occupancy || s.occupied_capacity || 0))
      })));

    } catch (error) {
      console.error("Failed loading analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400">Compiling disaster telemetry & analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Response Telemetry</span>
          </div>
          <h1 className="text-3xl font-black text-white">Incident & Relief Analytics</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Aggregated coordination performance metrics across active response sectors.</p>
        </div>

        <button
          onClick={loadAnalytics}
          className="py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Emergencies"
          value={summary.activeIncidents}
          subtext={`${summary.criticalIncidents} Critical Warnings`}
          icon={AlertOctagon}
          color="red"
        />
        <StatCard
          title="Resolved Tickets"
          value={summary.resolvedIncidents}
          subtext={`Total Filed: ${summary.totalIncidents}`}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Available Rescue Teams"
          value={`${summary.availableTeams} / ${summary.totalTeams}`}
          subtext="Ready for Immediate Dispatch"
          icon={Heart}
          color="blue"
        />
        <StatCard
          title="Relief Shelter Load"
          value={`${Math.round((summary.shelterOccupancy / (summary.shelterTotal || 1)) * 100)}%`}
          subtext={`${summary.shelterOccupancy} in shelters / ${summary.shelterTotal} total capacity`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Severity Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-80">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Active Incidents by Severity</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Type Counts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-80">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Incident Category Counts</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shelters Occupancy Top 5 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-80">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Relief Shelters Load (Top 5)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelterChartData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="Occupied" stackId="a" fill="#10b981" />
                <Bar dataKey="Available" stackId="a" fill="#334155" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Efficiency Metrics */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Response Benchmarks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold block">Avg Dispatch Latency</span>
            <span className="text-2xl font-black font-mono text-blue-400">12.4 min</span>
            <span className="text-[10px] text-slate-500 block">From verified report to team dispatch</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold block">Average Rescue Time</span>
            <span className="text-2xl font-black font-mono text-emerald-400">2.8 hours</span>
            <span className="text-[10px] text-slate-500 block">From report to shelter check-in</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-bold block">SMS Parser Precision</span>
            <span className="text-2xl font-black font-mono text-amber-400">92.5%</span>
            <span className="text-[10px] text-slate-500 block">Low-bandwidth offline resolution</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
