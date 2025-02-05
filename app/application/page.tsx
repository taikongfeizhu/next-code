'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Package, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

type FormData = {
  box_type: 'regular' | 'halal';
  delivery_type: 'offline' | 'online';
  address?: string;
};

export default function ApplicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      box_type: 'regular',
      delivery_type: 'offline'
    }
  });

  const deliveryType = watch('delivery_type');

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.code === 200) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/status');
        }, 2000);
      } else {
        setError(result.msg);
      }
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-4"
          >
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</h2>
          <p className="text-gray-600">Redirecting to status page...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="https://image.coze.run/?prompt=Create%20an%20imaginative%20digital%20illustration%20featuring%20mooncake%20gift%20box%20with%20elegant%20packaging%20design&image_size=square"
            alt="Gift Box"
            width={100}
            height={100}
            className="mx-auto rounded-lg shadow-lg"
            data-testid="gift-box-image"
          />
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-3xl font-extrabold text-gray-900"
          >
            Moon Cake Application
          </motion.h2>
          <p className="mt-2 text-sm text-gray-600">
            Please select your preferences below
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="p-4 bg-white rounded-t-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Box Type</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    {...register("box_type")}
                    type="radio"
                    value="regular"
                    className="h-4 w-4 text-indigo-600 border-gray-300"
                    data-testid="regular-box-radio"
                  />
                  <label className="ml-3 block text-sm text-gray-700">Regular Box</label>
                </div>
                <div className="flex items-center">
                  <input
                    {...register("box_type")}
                    type="radio"
                    value="halal"
                    className="h-4 w-4 text-indigo-600 border-gray-300"
                    data-testid="halal-box-radio"
                  />
                  <label className="ml-3 block text-sm text-gray-700">Halal Box</label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    {...register("delivery_type")}
                    type="radio"
                    value="offline"
                    className="h-4 w-4 text-indigo-600 border-gray-300"
                    data-testid="offline-delivery-radio"
                  />
                  <label className="ml-3 block text-sm text-gray-700">Offline Pickup</label>
                </div>
                <div className="flex items-center">
                  <input
                    {...register("delivery_type")}
                    type="radio"
                    value="online"
                    className="h-4 w-4 text-indigo-600 border-gray-300"
                    data-testid="online-delivery-radio"
                  />
                  <label className="ml-3 block text-sm text-gray-700">Online Delivery</label>
                </div>
              </div>
            </div>

            {deliveryType === 'online' && (
              <div className="p-4 bg-white rounded-b-md">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </label>
                <textarea
                  {...register("address", {
                    required: "Address is required for online delivery",
                    maxLength: {
                      value: 100,
                      message: "Address must be less than 100 characters"
                    }
                  })}
                  id="address"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Enter your delivery address"
                  data-testid="address-input"
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm flex items-center gap-1"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              data-testid="submit-button"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {deliveryType === 'online' ? (
                  <Truck className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                ) : (
                  <Package className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                )}
              </span>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
