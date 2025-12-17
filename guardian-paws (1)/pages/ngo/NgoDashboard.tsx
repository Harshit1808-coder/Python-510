
import React, { useState, useEffect } from 'react';
import { NGO, RescueReport } from '../../types';
import * as mockApi from '../../services/mockApiService';
import Spinner from '../../components/Spinner';

interface NgoDashboardProps {
  ngo: NGO;
  onNavigate: (view: { name: 'reportDetails', reportId: string }) => void;
}

const statusColorMap: { [key: string]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-indigo-100 text-indigo-800',
  Rescued: 'bg-green-100 text-green-800',
  Declined: 'bg-red-100 text-red-800',
  Closed: 'bg-gray-100 text-gray-800',
};

const NgoDashboard: React.FC<NgoDashboardProps> = ({ ngo, onNavigate }) => {
  const [reports, setReports] = useState<RescueReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      // NGOs see pending reports and reports assigned to them
      const [pending, assigned] = await Promise.all([
        mockApi.getPendingReports(),
        mockApi.getReportsByNgoId(ngo.id)
      ]);
      // Simple de-duplication
      const allReports = [...pending, ...assigned];
      const uniqueReports = Array.from(new Map(allReports.map(item => [item.id, item])).values());
      setReports(uniqueReports.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setLoading(false);
    };
    fetchReports();
  }, [ngo.id]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Welcome, {ngo.name}!</h2>
        <p className="text-gray-600">Here are the latest rescue requests.</p>
      </div>

      <h3 className="text-2xl font-bold text-gray-700 mb-6">Incoming Reports</h3>

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {reports.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {reports.map((report) => (
                <li
                  key={report.id}
                  onClick={() => onNavigate({ name: 'reportDetails', reportId: report.id })}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-2 md:mb-0">
                      <img src={report.animalPhoto} alt="Animal" className="h-16 w-16 rounded-md object-cover mr-4" />
                      <div>
                        <p className="font-semibold text-gray-800">Report #{report.id.substring(0, 6)}</p>
                        <p className="text-sm text-gray-600">{report.description.substring(0, 50)}...</p>
                        <p className="text-xs text-gray-500">
                          Reported on: {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 text-sm font-medium rounded-full ${statusColorMap[report.status]}`}>
                      {report.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-12">
              <p className="text-gray-500">No active reports at the moment. Great job!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NgoDashboard;
