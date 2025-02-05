'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, Truck, AlertCircle, CheckCircle, MapPin, Search, RefreshCw } from 'lucide-react';
import Image from 'next/image';

type Application = {
  id: number;
  employee_id: string;
  box_type: 'regular' | 'halal';
  delivery_type: 'offline' | 'online';
  status: 'pending' | 'completed';
  address?: string;
  tracking_number?: string;
  courier_company?: string;
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications');
      const result = await response.json();

      if (result.code === 401) {
        router.push('/login');
        return;
      }

      if (result.code === 200) {
        setApplications(result.data);
      } else {
        setError(result.msg);
      }
    } catch (err) {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedApplication) return;

    const formData = new FormData(e.currentTarget);
    const trackingNumber = formData.get('tracking_number') as string;
    const courierCompany = formData.get('courier_company') as string;

    if (!trackingNumber || !courierCompany) {
      setUpdateError('Please fill in all fields');
      return;
    }

    setUpdateLoading(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedApplication.id,
          tracking_number: trackingNumber,
          courier_company: courierCompany
        })
      });

      const result = await response.json();

      if (result.code === 200) {
        setUpdateSuccess(true);
        fetchApplications();
        setTimeout(() => setSelectedApplication(null), 2000);
      } else {
        setUpdateError(result.msg);
      }
    } catch (err) {
      setUpdateError('Failed to update tracking information');
    } finally {
      setUpdateLoading(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Package className="h-8 w-8 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Image
              src="https://image.coze.run/?prompt=Create%20an%20imaginative%20digital%20illustration%20featuring%20mooncake%20gift%20box%20management%20dashboard%20with%20modern%20minimalist%20style&image_size=square"
              alt="Admin Dashboard"
              width={64}
              height={64}
              className="rounded-lg shadow-lg mb-4"
              data-testid="dashboard-image"
            />
            <h1 className="text-3xl font-bold text-gray-900">Gift Box Applications</h1>
            <p className="mt-2 text-sm text-gray-600">Manage and track all moon cake gift box applications</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Employee ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                data-testid="search-input"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchApplications()}
              className="p-2 text-gray-600 hover:text-indigo-600"
              data-testid="refresh-button"
            >
              <RefreshCw className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700 mb-4"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </motion.div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Box Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.employee_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.box_type === 'halal' ? 'Halal Box' : 'Regular Box'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          {app.delivery_type === 'online' ? (
                            <>
                              <Truck className="h-4 w-4 text-indigo-500" />
                              <span>Online</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 text-green-500" />
                              <span>Offline</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          app.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <Package className="h-4 w-4 mr-1" />
                          )}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.delivery_type === 'online' && app.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedApplication(app)}
                            className="text-indigo-600 hover:text-indigo-900"
                            data-testid="update-tracking-button"
                          >
                            Update Tracking
                          </motion.button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedApplication && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Tracking Information
              </h3>

              {updateSuccess ? (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-green-800">Tracking information updated successfully!</p>
                </div>
              ) : (
                <form onSubmit={handleUpdateTracking}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="courier_company" className="block text-sm font-medium text-gray-700">
                        Courier Company
                      </label>
                      <input
                        type="text"
                        name="courier_company"
                        id="courier_company"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        data-testid="courier-company-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="tracking_number" className="block text-sm font-medium text-gray-700">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        name="tracking_number"
                        id="tracking_number"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        data-testid="tracking-number-input"
                      />
                    </div>

                    {updateError && (
                      <div className="text-red-600 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{updateError}</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedApplication(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                        data-testid="cancel-button"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                          updateLoading
                            ? 'bg-indigo-400'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                        data-testid="submit-tracking-button"
                      >
                        {updateLoading ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
