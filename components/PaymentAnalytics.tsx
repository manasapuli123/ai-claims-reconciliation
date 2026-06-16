"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const monthlyTrends = [
  { month: "Jan", denialRate: 7.1, reimbursement: 1.9, paymentDays: 23, appealSuccess: 74 },
  { month: "Feb", denialRate: 7.8, reimbursement: 2.0, paymentDays: 22, appealSuccess: 75 },
  { month: "Mar", denialRate: 8.5, reimbursement: 2.1, paymentDays: 21, appealSuccess: 76 },
  { month: "Apr", denialRate: 8.0, reimbursement: 2.2, paymentDays: 20, appealSuccess: 78 },
  { month: "May", denialRate: 7.6, reimbursement: 2.1, paymentDays: 21, appealSuccess: 77 },
  { month: "Jun", denialRate: 8.2, reimbursement: 2.1, paymentDays: 21, appealSuccess: 76 },
];

const payerScorecard = [
  { payer: "Aetna", claims: 5200, denialRate: 5.4, avgDays: 16, appealSuccess: 82, reimbursementRate: 96 },
  { payer: "Blue Cross", claims: 6100, denialRate: 7.2, avgDays: 19, appealSuccess: 78, reimbursementRate: 94 },
  { payer: "UnitedHealthcare", claims: 4800, denialRate: 11.5, avgDays: 27, appealSuccess: 68, reimbursementRate: 89 },
  { payer: "Cigna", claims: 3900, denialRate: 6.8, avgDays: 18, appealSuccess: 80, reimbursementRate: 95 },
];

const denialReasons: Record<string, { reason: string; count: number }[]> = {
  UnitedHealthcare: [
    { reason: "Prior Authorization Missing", count: 320 },
    { reason: "Medical Necessity", count: 180 },
    { reason: "Eligibility Issue", count: 145 },
  ],
  "Blue Cross": [
    { reason: "Coding Error", count: 210 },
    { reason: "Duplicate Claim", count: 90 },
    { reason: "Eligibility Issue", count: 80 },
  ],
};

const financialImpact = [
  { payer: "Aetna", denied: 180, recovered: 145, outstanding: 35 },
  { payer: "UHC", denied: 620, recovered: 320, outstanding: 300 },
  { payer: "BCBS", denied: 410, recovered: 295, outstanding: 115 },
];

type TrendKey = "denialRate" | "reimbursement" | "paymentDays" | "appealSuccess";

const trendConfig: Record<TrendKey, { label: string; color: string; unit: string }> = {
  denialRate:      { label: "Denial Rate", color: "#E24B4A", unit: "%" },
  reimbursement:   { label: "Reimbursement ($M)", color: "#185FA5", unit: "M" },
  paymentDays:     { label: "Avg Payment Days", color: "#BA7517", unit: "d" },
  appealSuccess:   { label: "Appeal Success Rate", color: "#3B6D11", unit: "%" },
};

export default function PaymentAnalytics() {
  const [activeTrend, setActiveTrend] = useState<TrendKey>("denialRate");
  const [activeDenialPayer, setActiveDenialPayer] = useState("UnitedHealthcare");

  const { color, unit } = trendConfig[activeTrend];

  return (
    <div className="space-y-6">

      {/* Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Claims Submitted", value: "25,430", color: "" },
          { label: "Total Reimbursed", value: "$12.4M", color: "text-blue-600" },
          { label: "Overall Denial Rate", value: "8.2%", color: "text-amber-600" },
          { label: "Avg Days to Payment", value: "21 days", color: "" },
          { label: "Recovery Rate", value: "76%", color: "text-green-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <h2 className={`text-2xl font-bold ${color}`}>{value}</h2>
          </div>
        ))}
      </div>

      {/* Payer Scorecard */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <h3 className="font-semibold text-lg mb-4">Payer Performance Scorecard</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              {["Payer","Claims","Denial Rate","Avg Days","Appeal Success","Reimbursement Rate"].map(h => (
                <th key={h} className="p-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payerScorecard.map((row) => (
              <tr key={row.payer} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{row.payer}</td>
                <td className="p-3">{row.claims.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.denialRate > 10 ? "bg-red-100 text-red-700"
                    : row.denialRate > 7 ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                  }`}>{row.denialRate}%</span>
                </td>
                <td className="p-3">{row.avgDays}</td>
                <td className="p-3">{row.appealSuccess}%</td>
                <td className="p-3">{row.reimbursementRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trends + Denial Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Trends */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Monthly Trends</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(trendConfig) as TrendKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTrend(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                  activeTrend === key
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {trendConfig[key].label}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}${unit}`} />
              <Tooltip formatter={(v: number) => `${v}${unit}`} />
              <Line type="monotone" dataKey={activeTrend} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Denial Reasons */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Top Denial Reasons by Payer</h3>
          <div className="flex gap-2 mb-4">
            {Object.keys(denialReasons).map((payer) => (
              <button
                key={payer}
                onClick={() => setActiveDenialPayer(payer)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                  activeDenialPayer === payer
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {payer}
              </button>
            ))}
          </div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left text-gray-500 font-medium">Reason</th>
                <th className="p-3 text-left text-gray-500 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {denialReasons[activeDenialPayer].map((row) => (
                <tr key={row.reason} className="border-b hover:bg-gray-50">
                  <td className="p-3">{row.reason}</td>
                  <td className="p-3 font-medium">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Impact */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-lg mb-4">Financial Impact</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                {["Payer","Denied Amount","Recovered","Outstanding"].map(h => (
                  <th key={h} className="p-3 text-left text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {financialImpact.map((row) => (
                <tr key={row.payer} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{row.payer}</td>
                  <td className="p-3">${row.denied}K</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      ${row.recovered}K
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.outstanding > 200 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                    }`}>${row.outstanding}K</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={financialImpact}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="payer" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}K`} />
              <Tooltip formatter={(v: number) => `$${v}K`} />
              <Legend />
              <Bar dataKey="recovered" name="Recovered" fill="#639922" stackId="a" />
              <Bar dataKey="outstanding" name="Outstanding" fill="#E24B4A" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
