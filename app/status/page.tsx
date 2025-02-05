'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, Truck, AlertCircle, Clock, CheckCircle, MapPin } from 'lucide-react';
import Image from 'next/image';

type ApplicationStatus = {
  status: 'pending' | 'completed' | 'not_applied';
  box_type?: 'regular' | 'halal';
  delivery_type?: 'offline' | 'online';
  address?: string;
  tracking_number?: string;
  courier_company?: string;
  created_at?: string;
};

export default function StatusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<ApplicationStatus | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/applications/status');
      const result = await response.json();

      if (result.code === 401) {
        router.push('/login');
        return;
      }

      if (result.code === 200 || result.code === 404) {
        setApplication(result.data);
      } else {
        setError(result.msg);
      }
    } catch (err) {
      setError('Failed to fetch application status');
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusIcon = () => {
    switch (application?.status) {
      case 'completed':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-500" />;
      default:
        return <AlertCircle className="h-12 w-12 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (application?.status) {
      case 'completed':
        return 'Your application has been processed';
      case 'pending':
        return 'Your application is being processed';
      default:
        return 'You haven\'t applied for a moon cake box yet';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Image
            src="https://image.coze.run/?prompt=Create%20an%20imaginative%20digital%20illustration%20featuring%20mooncake%20status%20tracking%20with%20modern%20minimalist%20style&image_size=square"
            alt="Status Tracking"
            width={100}
            height={100}
            className="mx-auto rounded-lg shadow-lg"
            data-testid="status-image"
          />
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-3xl font-extrabold text-gray-900"
          >
            Application Status
          </motion.h2>
        </div>

        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-6 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {getStatusIcon()}
              </motion.div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {getStatusText()}
              </h3>
            </div>

            {application?.status !== 'not_applied' && (
              <div className="border-t border-gray-200 px-6 py-4">
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Box Type</dt>
                    <dd className="text-sm text-gray-900">
                      {application?.box_type === 'halal' ? 'Halal Box' : 'Regular Box'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Delivery Method</dt>
                    <dd className="text-sm text-gray-900 flex items-center gap-1">
                      {application?.delivery_type === 'online' ? (
                        <>
                          <Truck className="h-4 w-4" />
                          Online Delivery
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4" />
                          Offline Pickup
                        </>
                      )}
                    </dd>
                  </div>

                  {application?.delivery_type === 'online' && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
                        <dd className="text-sm text-gray-900 text-right">
                          {application?.address}
                        </dd>
                      </div>
                      {application?.status === 'completed' && (
                        <>
                          <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Courier</dt>
                            <dd className="text-sm text-gray-900">
                              {application?.courier_company}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
                            <dd className="text-sm text-gray-900">
                              {application?.tracking_number}
                            </dd>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Application Date</dt>
                    <dd className="text-sm text-gray-900">
                      {application?.created_at && new Date(application.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {application?.status === 'not_applied' && (
              <div className="px-6 py-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/application')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  data-testid="apply-now-button"
                >
                  Apply Now
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
