
import React, { useState, useEffect, useCallback } from 'react';
import { RescueReport, AuthenticatedUser, UserRole, ReportStatus } from '../types';
import * as mockApi from '../services/mockApiService';
import Spinner from '../components/Spinner';
import ChatWindow from '../components/ChatWindow';

interface ReportDetailsProps {
  reportId: string;
  currentUser: AuthenticatedUser;
  onBack: () => void;
}

const statusColorMap: { [key: string]: string } = {
  Pending: 'bg-yellow-200 text-yellow-800',
  Accepted: 'bg-blue-200 text-blue-800',
  'In Progress': 'bg-indigo-200 text-indigo-800',
  Rescued: 'bg-green-200 text-green-800',
  Declined: 'bg-red-200 text-red-800',
  Closed: 'bg-gray-200 text-gray-800',
};

const ReportDetails: React.FC<ReportDetailsProps> = ({ reportId, currentUser, onBack }) => {
  const [report, setReport] = useState<RescueReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    const fetchedReport = await mockApi.getReportById(reportId);
    setReport(fetchedReport);
  }, [reportId]);

  useEffect(() => {
    setLoading(true);
    fetchReport().finally(() => setLoading(false));
  }, [fetchReport]);

  const handleStatusUpdate = async (newStatus: ReportStatus) => {
    if (!report || currentUser?.role !== UserRole.NGO) return;
    setLoading(true);
    await mockApi.updateReportStatus(report.id, newStatus, currentUser.id);
    await fetchReport();
    setLoading(false);
  };

  const handleSendMessage = async (text: string) => {
    if(!report || !currentUser) return;
    await mockApi.addChatMessage(report.id, currentUser.id, text);
    await fetchReport();
  };

  if (loading || !report) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  const isNgo = currentUser?.role === UserRole.NGO;
  const canNgoAct = isNgo && report.status === ReportStatus.PENDING;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <button onClick={onBack} className="text-emerald-600 hover:text-emerald-800 mb-4">&larr; Back to Dashboard</button>
      
      <div className="bg-white p-8 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image and Details */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Report Details</h2>
            <img src={report.animalPhoto} alt="Injured Animal" className="w-full h-auto rounded-lg shadow-lg mb-4" />
            <div className="space-y-3">
              <p><strong>Status:</strong> <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColorMap[report.status]}`}>{report.status}</span></p>
              <p><strong>Description:</strong> <span className="text-gray-700">{report.description}</span></p>
              <p><strong>Location:</strong> <span className="text-gray-700">{report.location.latitude.toFixed(5)}, {report.location.longitude.toFixed(5)}</span></p>
              <p><strong>Reported:</strong> <span className="text-gray-700">{new Date(report.createdAt).toLocaleString()}</span></p>
            </div>
          </div>

          {/* Right Column: AI Analysis, Actions, Chat */}
          <div>
            {report.geminiAnalysis && (
              <div className="bg-emerald-50 p-4 rounded-lg mb-6 border border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">AI Analysis</h3>
                <div className="text-sm text-emerald-700 whitespace-pre-wrap">{report.geminiAnalysis}</div>
              </div>
            )}
            
            {isNgo && (
                <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">NGO Actions</h3>
                {canNgoAct ? (
                     <div className="flex space-x-2">
                     <button onClick={() => handleStatusUpdate(ReportStatus.ACCEPTED)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Accept</button>
                     <button onClick={() => handleStatusUpdate(ReportStatus.DECLINED)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Decline</button>
                   </div>
                ) : report.status === ReportStatus.ACCEPTED ? (
                    <div className="flex space-x-2">
                        <button onClick={() => handleStatusUpdate(ReportStatus.IN_PROGRESS)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Mark In Progress</button>
                        <button onClick={() => handleStatusUpdate(ReportStatus.RESCUED)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Mark as Rescued</button>
                    </div>
                ): report.status === ReportStatus.IN_PROGRESS ? (
                    <button onClick={() => handleStatusUpdate(ReportStatus.RESCUED)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Mark as Rescued</button>
                ): (
                    <p className="text-sm text-gray-500">No actions available for this status.</p>
                )}
                </div>
            )}

            <ChatWindow messages={report.chat} currentUser={currentUser} onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
