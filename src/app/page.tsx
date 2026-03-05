"use client";

import { useState } from "react";
import { ProtectedPage } from "../components/ProtectedPage";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import useSWR from "swr";
import { Api } from "../lib/api";
import Link from "next/link";
import { Avatar } from "../components/Avatar";
import RecentComments from "../components/RecentComments";

export default function DashboardPage() {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: dashboardResponse, error } = useSWR(
    token ? ["taskStats", token, startDate, endDate] : null,
    ([_, t, start, end]) => Api.getTaskStats(t, start, end),
  );

  // Convert API response
  const byStatus = dashboardResponse?.byStatus || [];
  const globalStats = dashboardResponse?.global || {
    total: 0,
    completed: 0,
    pending: 0,
    processing: 0,
    qa: 0,
    canceled: 0,
  };
  const userStats = dashboardResponse?.users || []; // test edit

  // const globalStats = {
  //   total: totals.total || 0,
  //   pending: byStatus.find((s: any) => s.status === "pending")?.count || 0,
  //   processing:
  //     byStatus.find((s: any) => s.status === "processing")?.count || 0,
  //   qa: byStatus.find((s: any) => s.status === "qa")?.count || 0,
  //   completed: totals.completed || 0,
  //   canceled: byStatus.find((s: any) => s.status === "canceled")?.count || 0,
  // };

  const statItems = [
    { label: "Total Tasks", value: globalStats.total, color: "text-blue-400" },
    { label: "Pending", value: globalStats.pending, color: "text-yellow-400" },
    {
      label: "In Progress",
      value: globalStats.processing,
      color: "text-purple-400",
    },
    { label: "QA", value: globalStats.qa, color: "text-teal-400" },
    {
      label: "Completed",
      value: globalStats.completed,
      color: "text-green-400",
    },
    { label: "Canceled", value: globalStats.canceled, color: "text-red-400" },
  ];

  return (
    <ProtectedPage>
      <DashboardLayout>
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

        {/* Date Range Filter */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <label className="text-sm text-slate-300 flex items-center gap-2">
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-rose-500"
            />
          </label>
          <label className="text-sm text-slate-300 flex items-center gap-2">
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-rose-500"
            />
          </label>
        </div>

        {/* Overall Task Summary */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 mb-6">
          <p className="text-xl font-semibold text-white mb-4">
            Overall Task Summary
          </p>
          {error ? (
            <div className="text-rose-400 text-center py-8">
              Failed to load task statistics: {error.message || error}
            </div>
          ) : !dashboardResponse ? (
            <div className="text-slate-400 text-center py-8">
              {token
                ? "Loading overall task statistics..."
                : "Please log in to see task statistics"}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {statItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/5 bg-slate-900/40 p-4 text-center"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                    {item.label}
                  </p>
                  <p className={`text-2xl font-semibold ${item.color}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Team Member Task Breakdown */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 mb-6">
          <p className="text-xl font-semibold text-white mb-4">
            Team Member Task Breakdown
          </p>
          {error ? (
            <div className="text-rose-400 text-center py-8">
              Failed to load user task breakdown.
            </div>
          ) : !dashboardResponse ? (
            <div className="text-slate-400 text-center py-8">
              Loading user task breakdown...
            </div>
          ) : userStats.length === 0 ? (
            <div className="text-slate-500 text-center py-8 italic">
              No tasks assigned to team members in this period.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userStats.map((userStat: any) => (
                <div
                  key={userStat.assignee._id || "unassigned"}
                  className="rounded-xl border border-white/5 bg-slate-900/40 p-4 flex items-center gap-4"
                >
                  <Avatar
                    src={userStat.assignee?.profilePicture}
                    alt={userStat.assignee?.fullName || "Unassigned"}
                    size={48}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">
                      {userStat.assignee.fullName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {userStat.assignee.role || "N/A"}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <span className="bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">
                        Total: {userStat.total}
                      </span>
                      <span className="bg-yellow-500/10 text-yellow-300 px-2 py-0.5 rounded">
                        Pend: {userStat.pending}
                      </span>
                      <span className="bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded">
                        Proc: {userStat.processing}
                      </span>
                      <span className="bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded">
                        QA: {userStat.qa}
                      </span>
                      <span className="bg-green-500/10 text-green-300 px-2 py-0.5 rounded">
                        Comp: {userStat.completed}
                      </span>
                      <span className="bg-red-500/10 text-red-300 px-2 py-0.5 rounded">
                        Canc: {userStat.canceled}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Comments
          </h2>
          <RecentComments />
        </section>

        <div className="text-sm text-slate-400 text-center py-4">
          <p>Need to review your details? Head to your profile page.</p>
          <Link
            href="/profile"
            className="text-rose-300 hover:text-rose-200 mt-1 block"
          >
            Go to profile →
          </Link>
        </div>
      </DashboardLayout>
    </ProtectedPage>
  );
}
