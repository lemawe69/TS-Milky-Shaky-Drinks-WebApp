import React from "react";
import LookupManager from "../components/admin/LookupManager";
import AuditTrail from "../components/admin/AuditTrail";
import ReportsDashboard from "../components/admin/ReportsDashboard";

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-deep via-paper to-deep p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl border border-primary/30 p-4 sm:p-6 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">📊 Manager Dashboard</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-400">Monitor business metrics, manage products, and review activity</p>
        </div>

        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-primary mb-3 sm:mb-4">Analytics & Reports</h2>
          <ReportsDashboard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <LookupManager />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-primary mb-3 sm:mb-4">📋 Activity Logs</h2>
            <AuditTrail />
          </div>
        </div>
      </div>
    </div>
  );
}
