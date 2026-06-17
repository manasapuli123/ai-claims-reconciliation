"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import claims from "@/data/claims.json";

const PROVIDERS = ["UnitedHealth Group", "Aetna", "BCBS", "Cigna"];

const SHORT_LABEL: Record<string, string> = {
  "UnitedHealth Group": "UHG",
  Aetna: "Aetna",
  BCBS: "BCBS",
  Cigna: "Cigna",
};

const PROVIDER_COLORS: Record<string, string> = {
  "UnitedHealth Group": "#2563eb",
  Aetna: "#7c3aed",
  BCBS: "#0891b2",
  Cigna: "#059669",
};

const STATUS_COLORS: Record<string, string> = {
  "Under Review": "#f59e0b",
  Escalated: "#ef4444",
  "Discrepancy Detected": "#f97316",
  Submitted: "#6366f1",
  "Pending Validation": "#3b82f6",
  Completed: "#22c55e",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics">("dashboard");
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const highPriorityClaims = claims.filter((c) => c.priority === "High").length;

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch = claim.claimId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || claim.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || claim.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchTerm, statusFilter, priorityFilter]);

  // Per-provider analytics, covering all four: UnitedHealth Group (UHG), Aetna, BCBS, Cigna
  const providerAnalytics = useMemo(() => {
    return PROVIDERS.map((provider) => {
      const pc = claims.filter((c: any) => c.insuranceProvider === provider);
      const totalClaimed = pc.reduce((s, c) => s + c.claimAmount, 0);
      const totalApproved = pc.reduce((s, c) => s + c.approvedAmount, 0);
      const variance =
        totalClaimed > 0
          ? parseFloat((((totalApproved - totalClaimed) / totalClaimed) * 100).toFixed(1))
          : 0;
      const avgRisk =
        pc.length > 0
          ? Math.round(pc.reduce((s, c: any) => s + c.riskScore, 0) / pc.length)
          : 0;
      const highPriority = pc.filter((c) => c.priority === "High").length;
      const statusBreakdown = pc.reduce((acc: Record<string, number>, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {});
      return {
        provider,
        shortProvider: SHORT_LABEL[provider] || provider,
        totalClaimed,
        totalApproved,
        variance,
        avgRisk,
        highPriority,
        claimCount: pc.length,
        statusBreakdown,
        claims: pc,
      };
    });
  }, []);

  const overallData = providerAnalytics.map((p) => ({
    provider: p.provider,
    shortProvider: p.shortProvider,
    claimed: p.totalClaimed,
    approved: p.totalApproved,
    variance: p.variance,
  }));

  const formatK = (v: number) => "$" + (v / 1000).toFixed(1) + "k";

  return (
    <main className="min-h-screen bg-[#f6f8fb] flex">

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-6 z-50 bg-white border border-gray-200 shadow-sm rounded-r-md px-1.5 py-2 transition-all duration-300 hover:bg-gray-100 ${sidebarOpen ? "left-64" : "left-0"}`}
      >
        <span className="text-xs text-gray-600 font-medium">{sidebarOpen ? "◀" : "▶"}</span>
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white border-r shadow-sm p-6 z-40 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <h2 className="text-3xl font-bold mb-6">ClaimsAI</h2>
        <p className="text-sm text-gray-600 leading-6 mb-6">
          AI-assisted pharmacy claims reconciliation platform designed to help operations analysts
          identify payment discrepancies, investigate claim anomalies, prioritize high-risk claims,
          and reduce manual review effort.
        </p>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">AI Capabilities</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Claims risk scoring</li>
              <li>• Duplicate claim detection</li>
              <li>• Reimbursement variance analysis</li>
              <li>• Workflow prioritization</li>
              <li>• AI investigation summaries</li>
            </ul>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Operational Goals</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Reduce manual reconciliation effort</li>
              <li>• Improve payment accuracy</li>
              <li>• Accelerate claim investigations</li>
              <li>• Prioritize high-risk discrepancies</li>
            </ul>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold mb-2">AI Workflow</h3>
            <p className="text-sm text-gray-600">
              Claims are analyzed using operational rules, reimbursement variance detection,
              historical adjudication patterns, and AI-assisted workflow prioritization.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">AI-Assisted Revenue Cycle Operations</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Claims Reconciliation Dashboard
          </h1>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "dashboard"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "analytics"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Payment Analytics
          </button>
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-5">
                <p className="text-sm text-gray-500">Total Claims</p>
                <h2 className="text-3xl font-bold">{claims.length}</h2>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <p className="text-sm text-gray-500">High Priority</p>
                <h2 className="text-3xl font-bold text-red-600">{highPriorityClaims}</h2>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <p className="text-sm text-gray-500">Escalated Claims</p>
                <h2 className="text-3xl font-bold text-orange-500">
                  {claims.filter((c) => c.status === "Escalated").length}
                </h2>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <p className="text-sm text-gray-500">Pending Validation</p>
                <h2 className="text-3xl font-bold text-blue-600">
                  {claims.filter((c) => c.status === "Pending Validation").length}
                </h2>
              </div>
            </div>

            {/* Payment Analytics Summary */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Analytics by Insurance Provider
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Claimed vs. approved amounts across UnitedHealth Group, Aetna, BCBS, and Cigna
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {providerAnalytics.map((p) => (
                  <div key={p.provider} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1" title={p.provider}>
                      {p.shortProvider}
                    </p>
                    <p className="text-lg font-bold text-gray-900">{formatK(p.totalApproved)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">of {formatK(p.totalClaimed)} claimed</p>
                    <p className={`text-xs font-semibold mt-1 ${p.variance < -15 ? "text-red-600" : p.variance < 0 ? "text-amber-600" : "text-green-600"}`}>
                      {p.variance > 0 ? "+" : ""}{p.variance}% variance
                    </p>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={overallData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="shortProvider" tick={{ fontSize: 13, fill: "#6b7280" }} />
                  <YAxis tickFormatter={formatK} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip
                    formatter={(v: number, name: string) => [formatK(v), name === "claimed" ? "Claimed" : "Approved"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                  />
                  <Legend
                    formatter={(v) => (v === "claimed" ? "Claimed amount" : "Approved amount")}
                    wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
                  />
                  <Bar dataKey="claimed" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="approved" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Search + Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search Claim ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-4 py-2 w-64"
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-4 py-2">
                <option>All</option>
                <option>Submitted</option>
                <option>Under Review</option>
                <option>Escalated</option>
                <option>Pending Validation</option>
                <option>Discrepancy Detected</option>
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border rounded-lg px-4 py-2">
                <option>All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b text-left bg-gray-100">
                    <th className="p-3">Claim ID</th>
                    <th className="p-3">Pharmacy</th>
                    <th className="p-3">Drug</th>
                    <th className="p-3">Insurance</th>
                    <th className="p-3">Issue</th>
                    <th className="p-3">Reconciliation Status</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Variance %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => (
                    <tr key={claim.claimId} onClick={() => setSelectedClaim(claim)} className="border-b hover:bg-gray-50 cursor-pointer">
                      <td className="p-3 font-medium">{claim.claimId}</td>
                      <td className="p-3">{claim.pharmacy}</td>
                      <td className="p-3">{claim.drug}</td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {SHORT_LABEL[(claim as any).insuranceProvider] || (claim as any).insuranceProvider}
                        </span>
                      </td>
                      <td className="p-3">{claim.issue}</td>
                      <td className="p-3">
                        <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium ${claim.status === "Escalated" ? "bg-red-100 text-red-700" : claim.status === "Discrepancy Detected" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${claim.priority === "High" ? "bg-red-100 text-red-700" : claim.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {claim.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        {(() => {
                          const variance = (((claim.approvedAmount - claim.claimAmount) / claim.claimAmount) * 100).toFixed(1);
                          return (
                            <span className={`text-xs font-semibold ${Number(variance) < -15 ? "text-red-600" : Number(variance) < 0 ? "text-yellow-600" : "text-green-600"}`}>
                              {variance}%
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && (
          <>
            {/* Provider summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {providerAnalytics.map((p) => (
                <div key={p.provider} className="bg-white rounded-xl shadow p-5">
                  <p className="text-sm text-gray-500" title={p.provider}>{p.shortProvider}</p>
                  <h2 className="text-3xl font-bold" style={{ color: PROVIDER_COLORS[p.provider] }}>
                    {formatK(p.totalApproved)}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">of {formatK(p.totalClaimed)} claimed</p>
                  <p className={`text-xs font-semibold mt-1 ${p.variance < -15 ? "text-red-600" : p.variance < 0 ? "text-amber-600" : "text-green-600"}`}>
                    {p.variance > 0 ? "+" : ""}{p.variance}% variance
                  </p>
                </div>
              ))}
            </div>

            {/* Claimed vs Approved — all providers */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Claimed vs. Approved — All Providers</h2>
              <p className="text-sm text-gray-500 mb-5">Side-by-side comparison across UnitedHealth Group, Aetna, BCBS, and Cigna</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={overallData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="shortProvider" tick={{ fontSize: 13, fill: "#6b7280" }} />
                  <YAxis tickFormatter={formatK} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip
                    formatter={(v: number, name: string) => [formatK(v), name === "claimed" ? "Claimed" : "Approved"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                  />
                  <Legend formatter={(v) => (v === "claimed" ? "Claimed amount" : "Approved amount")} wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }} />
                  <Bar dataKey="claimed" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="approved" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Variance % chart */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Reimbursement Variance by Provider</h2>
              <p className="text-sm text-gray-500 mb-5">Percentage difference between approved and claimed amounts</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={overallData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="shortProvider" tick={{ fontSize: 13, fill: "#6b7280" }} />
                  <YAxis tickFormatter={(v) => v + "%"} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip formatter={(v: number) => [v.toFixed(1) + "%", "Variance"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }} />
                  <Bar dataKey="variance" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {overallData.map((entry) => (
                      <Cell key={entry.provider} fill={entry.variance < -15 ? "#ef4444" : entry.variance < 0 ? "#f59e0b" : "#22c55e"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-provider breakdown cards */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Per-Provider Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {providerAnalytics.map((p) => {
                const statusData = Object.entries(p.statusBreakdown).map(([status, count]) => ({ status, count }));
                const pieData = [
                  { name: "Approved", value: p.totalApproved },
                  { name: "Unpaid", value: p.totalClaimed - p.totalApproved },
                ];
                return (
                  <div key={p.provider} className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: PROVIDER_COLORS[p.provider] }}>{p.provider}</h3>
                        <p className="text-xs text-gray-400">{p.claimCount} claim{p.claimCount !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Avg Risk Score</p>
                        <p className={`text-lg font-bold ${p.avgRisk >= 80 ? "text-red-600" : p.avgRisk >= 50 ? "text-amber-600" : "text-green-600"}`}>{p.avgRisk}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Claimed</p>
                        <p className="font-semibold text-sm">{formatK(p.totalClaimed)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Approved</p>
                        <p className="font-semibold text-sm">{formatK(p.totalApproved)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Variance</p>
                        <p className={`font-semibold text-sm ${p.variance < -15 ? "text-red-600" : p.variance < 0 ? "text-amber-600" : "text-green-600"}`}>
                          {p.variance}%
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="flex-shrink-0">
                        <p className="text-xs text-gray-500 mb-1 text-center">Approval rate</p>
                        <PieChart width={110} height={110}>
                          <Pie data={pieData} cx={50} cy={50} innerRadius={30} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
                            <Cell fill={PROVIDER_COLORS[p.provider]} />
                            <Cell fill="#e5e7eb" />
                          </Pie>
                          <Tooltip formatter={(v: number) => formatK(v)} contentStyle={{ fontSize: "12px", borderRadius: "6px" }} />
                        </PieChart>
                        <p className="text-xs text-center text-gray-500 -mt-1">
                          {p.totalClaimed > 0 ? Math.round((p.totalApproved / p.totalClaimed) * 100) : 0}% paid
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-2">Claims by status</p>
                        <div className="space-y-1.5">
                          {statusData.map(({ status, count }) => (
                            <div key={status} className="flex items-center gap-2">
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                                style={{ backgroundColor: (STATUS_COLORS[status] || "#6b7280") + "20", color: STATUS_COLORS[status] || "#6b7280" }}
                              >
                                {status}
                              </span>
                              <span className="text-xs text-gray-500 ml-auto">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 border-t pt-4">
                      <p className="text-xs text-gray-500 mb-2">Claims</p>
                      <div className="space-y-2">
                        {p.claims.map((c: any) => (
                          <div key={c.claimId} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700">{c.claimId}</span>
                            <span className="text-gray-500">{c.drug}</span>
                            <span className={`font-semibold ${c.priority === "High" ? "text-red-600" : c.priority === "Medium" ? "text-amber-600" : "text-green-600"}`}>
                              {c.priority}
                            </span>
                            <span className="text-gray-700">{formatK(c.approvedAmount)} <span className="text-gray-400">/ {formatK(c.claimAmount)}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Risk Radar */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Risk Profile by Provider</h2>
              <p className="text-sm text-gray-500 mb-5">Average risk score, high-priority claims, and variance exposure</p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  data={providerAnalytics.map((p) => ({
                    provider: p.shortProvider,
                    "Avg Risk Score": p.avgRisk,
                    "High Priority": p.highPriority * 25,
                    "Variance Exposure": Math.abs(p.variance),
                    "Claim Volume": p.claimCount * 20,
                  }))}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="provider" tick={{ fontSize: 13 }} />
                  <PolarRadiusAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Radar name="Risk Profile" dataKey="Avg Risk Score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />
                  <Radar name="Variance Exposure" dataKey="Variance Exposure" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                  <Legend wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Claim Investigation Modal */}
        {selectedClaim && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[850px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-8 relative">
              <button onClick={() => setSelectedClaim(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl">✕</button>
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-2">AI-Assisted Claim Investigation</p>
                <h2 className="text-3xl font-bold text-gray-900">{selectedClaim.claimId}</h2>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div><p className="text-sm text-gray-500">Patient</p><p className="font-medium">{selectedClaim.patient}</p></div>
                <div><p className="text-sm text-gray-500">Pharmacy</p><p className="font-medium">{selectedClaim.pharmacy}</p></div>
                <div><p className="text-sm text-gray-500">Drug</p><p className="font-medium">{selectedClaim.drug}</p></div>
                <div><p className="text-sm text-gray-500">Insurance Provider</p><p className="font-medium">{selectedClaim.insuranceProvider}</p></div>
                <div><p className="text-sm text-gray-500">Adjudication Status</p><p className="font-medium">{selectedClaim.adjudicationStatus}</p></div>
                <div><p className="text-sm text-gray-500">Claim Amount</p><p className="font-medium">${selectedClaim.claimAmount}</p></div>
                <div><p className="text-sm text-gray-500">Approved Amount</p><p className="font-medium">${selectedClaim.approvedAmount}</p></div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="font-semibold mb-3">AI Investigation Summary</h3>
                <p className="text-sm text-gray-700 leading-6">{selectedClaim.investigationSummary}</p>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Detected Issues</h3>
                <div className="space-y-3">
                  {selectedClaim.detectedIssues?.map((issue: string, index: number) => (
                    <div key={index} className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">{issue}</div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-5 mb-6">
                <h3 className="font-semibold mb-3">AI Recommendation</h3>
                <p className="text-sm text-gray-700 leading-6">{selectedClaim.aiRecommendation}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Suggested Actions</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedClaim.suggestedActions?.map((action: string, index: number) => (
                    <button key={index} className="bg-gray-100 hover:bg-gray-200 transition rounded-xl px-4 py-2 text-sm">{action}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
