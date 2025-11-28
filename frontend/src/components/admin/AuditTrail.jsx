import React, { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AuditTrail() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudit();
  }, []);

  async function loadAudit() {
    try {
      const res = await api.get("/reports/audit");
      setRecords(res.data || []);
    } catch (err) {
      console.error("Failed to load audit trail:", err.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-paper/80 rounded-xl border border-primary/30 p-6">
      <h3 className="text-lg sm:text-2xl font-bold text-primary mb-4">📋 Activity Logs</h3>
      {loading && <div className="text-gray-400 text-sm">Loading audit records...</div>}
      {!loading && records.length === 0 && <div className="text-gray-400 text-sm">No activity recorded yet</div>}
      {!loading && records.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {records.map((record) => (
            <div key={record.id} className="bg-deep/50 p-3 rounded-lg border border-primary/20">
              <div className="text-sm font-semibold text-primary">{record.action}</div>
              <div className="text-xs text-gray-400 mt-1">{record.tableName} - ID: {record.recordId}</div>
              <div className="text-xs text-gray-500 mt-1">{new Date(record.createdAt).toLocaleString()}</div>
              {record.changes && <div className="text-xs text-gray-500 mt-2 bg-deep p-2 rounded overflow-x-auto">{record.changes.slice(0, 200)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
