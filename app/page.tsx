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
} from "recharts";
import claims from "@/data/claims.json";

const PROVIDERS = ["UHG", "Aetna", "Blue Cross", "Cigna"];

export default function Home() {
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const highPriorityClaims = claims.filter(
    (claim) => claim.priority === "High"
  ).length;

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch = claim.claimId
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || claim.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || claim.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchTerm, statusFilter, priorityFilter]);

  // Build per-provider analytics from real claims data
  const providerAnalytics = useMemo(() => {
    return PROVIDERS.map((provider) => {
      const providerClaims = claims.filter(
        (c) => (c as any).insuranceProvider === provider
      );
      const totalClaimed = providerClaims.reduce(
        (sum, c) => sum + c.claimAmount,
        0
      );
      const totalApproved = providerClaims.reduce(
        (sum, c) => sum + c.approvedAmount,
        0
      );
      const variancePct =
        totalClaimed > 0
          ? (((totalApproved - totalClaimed) / totalClaimed) * 100).toFixed(1)
          : "0.0";
      return {
        provider,
        claimed: totalClaimed,
        approved: totalApproved,
        variance: parseFloat(variancePct),
        claimCount: providerClaims.length,
      };
    });
  }, []);

  const formatCurrency = (value: number) =>
    "$" + (value / 1000).toFixed(1) + "k";

  return (
    <main className="min-h-screen bg-[#f6f8fb] flex">

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-6 z-50 bg-white border border-gray-200 shadow-sm rounded-r-md px-1.5 py-2 transition-all duration-300 hover:bg-gray-100 ${
          sidebarOpen ? "left-64" : "left-0"
        }`}
      >
        <span className="text-xs text-gray-600 font-medium">
          {sidebarOpen ? "◀" : "▶"}
        </span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r shadow-sm p-6 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-3xl font-bold mb-6">ClaimsAI</h2>

        <p className="text-sm text-gray-600 leading-6 mb-6">
          AI-assisted pharmacy claims reconciliation platform designed to help
          operations analysts identify payment discrepancies, investigate claim
          anomalies, prioritize high-risk claims, and reduce manual review
          effort.
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
              Claims are analyzed using operational rules, reimbursement
              variance detection, historical adjudication patterns, and
              AI-assisted workflow prioritization.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">

        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">
            AI-Assisted Revenue Cycle Operations
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Claims Reconciliation Dashboard
          </h1>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">Total Claims</p>
            <h2 className="text-3xl font-bold">{claims.length}</h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">High Priority</p>
            <h2 className="text-3xl font-bold text-red-600">
              {highPriorityClaims}
            </h2>
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

        {/* Payment Analytics */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Analytics by Insurance Provider
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Claimed vs. approved amounts across UHG, Aetna, Blue Cross, and
              Cigna
            </p>
          </div>

          {/* Provider summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {providerAnalytics.map((p) => (
              <div
                key={p.provider}
                className="bg-gray-50 border border-gray-100 rounded-lg p-4"
              >
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {p.provider}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(p.approved)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  of {formatCurrency(p.claimed)} claimed
                </p>
                <p
                  className={`text-xs font-semibold mt-1 ${
                    p.variance < -15
                      ? "text-red-600"
                      : p.variance < 0
                      ? "text-amber-600"
                      : "text-green-600"
                  }`}
                >
                  {p.variance > 0 ? "+" : ""}
                  {p.variance}% variance
                </p>
              </div>
            ))}
          </div>

          {/* Recharts grouped bar chart */}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={providerAnalytics}
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="provider"
                tick={{ fontSize: 13, fill: "#6b7280" }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "claimed" ? "Claimed" : "Approved",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "claimed" ? "Claimed amount" : "Approved amount"
                }
                wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
              />
              <Bar
                dataKey="claimed"
                fill="#93c5fd"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
              <Bar
                dataKey="approved"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option>All</option>
            <option>Submitted</option>
            <option>Under Review</option>
            <option>Escalated</option>
            <option>Pending Validation</option>
            <option>Discrepancy Detected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
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
                <tr
                  key={claim.claimId}
                  onClick={() => setSelectedClaim(claim)}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-3 font-medium">{claim.claimId}</td>
                  <td className="p-3">{claim.pharmacy}</td>
                  <td className="p-3">{claim.drug}</td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      {(claim as any).insuranceProvider}
                    </span>
                  </td>
                  <td className="p-3">{claim.issue}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium ${
                        claim.status === "Escalated"
                          ? "bg-red-100 text-red-700"
                          : claim.status === "Discrepancy Detected"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        claim.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : claim.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {claim.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    {(() => {
                      const variance = (
                        ((claim.approvedAmount - claim.claimAmount) /
                          claim.claimAmount) *
                        100
                      ).toFixed(1);
                      return (
                        <span
                          className={`text-xs font-semibold ${
                            Number(variance) < -15
                              ? "text-red-600"
                              : Number(variance) < 0
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
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

        {/* Claim Investigation Modal */}
        {selectedClaim && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[850px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-8 relative">

              <button
                onClick={() => setSelectedClaim(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>

              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-2">
                  AI-Assisted Claim Investigation
                </p>
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedClaim.claimId}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{selectedClaim.patient}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pharmacy</p>
                  <p className="font-medium">{selectedClaim.pharmacy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Drug</p>
                  <p className="font-medium">{selectedClaim.drug}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Insurance Provider</p>
                  <p className="font-medium">
                    {selectedClaim.insuranceProvider}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Adjudication Status</p>
                  <p className="font-medium">
                    {selectedClaim.adjudicationStatus}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Claim Amount</p>
                  <p className="font-medium">${selectedClaim.claimAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approved Amount</p>
                  <p className="font-medium">${selectedClaim.approvedAmount}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="font-semibold mb-3">AI Investigation Summary</h3>
                <p className="text-sm text-gray-700 leading-6">
                  {selectedClaim.investigationSummary}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Detected Issues</h3>
                <div className="space-y-3">
                  {selectedClaim.detectedIssues?.map(
                    (issue: string, index: number) => (
                      <div
                        key={index}
                        className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm"
                      >
                        {issue}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-5 mb-6">
                <h3 className="font-semibold mb-3">AI Recommendation</h3>
                <p className="text-sm text-gray-700 leading-6">
                  {selectedClaim.aiRecommendation}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Suggested Actions</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedClaim.suggestedActions?.map(
                    (action: string, index: number) => (
                      <button
                        key={index}
                        className="bg-gray-100 hover:bg-gray-200 transition rounded-xl px-4 py-2 text-sm"
                      >
                        {action}
                      </button>
                    )
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}
