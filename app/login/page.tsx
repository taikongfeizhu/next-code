'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle } from 'lucide-react';
import Image from 'next/image';

type FormData = {
  employee_id: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.code === 200) {
        router.push(result.data.role === 'admin' ? '/admin/dashboard' : '/application');
      } else {
        setError(result.msg);
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="https://image.coze.run/?prompt=Create%20an%20imaginative%20digital%20illustration%20featuring%20traditional%20mooncake%20with%20modern%20minimalist%20style&image_size=square"
            alt="Moon Cake Logo"
            width={100}
            height={100}
            className="mx-auto rounded-full shadow-lg"
            data-testid="login-logo"
          />
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-3xl font-extrabold text-gray-900"
          >
            Moon Cake Distribution
          </motion.h2>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="employee_id" className="sr-only">Employee ID</label>
              <input
                {...register("employee_id", {
                  required: "Employee ID is required",
                  pattern: {
                    value: /^(admin|e\d{4})$/,
                    message: "Invalid employee ID format"
                  }
                })}
                id="employee_id"
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Employee ID (e.g., e0001)"
                data-testid="employee-id-input"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 5,
                    message: "Password must be at least 5 characters"
                  }
                })}
                id="password"
                type="password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                data-testid="password-input"
              />
            </div>
          </div>

          {(errors.employee_id || errors.password || error) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm flex items-center gap-1"
            >
              <AlertCircle size={16} />
              <span>{errors.employee_id?.message || errors.password?.message || error}</span>
            </motion.div>
          )}

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              data-testid="login-button"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
              </span>
              Sign in
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
