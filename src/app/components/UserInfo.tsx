'use client';

import { useAuth } from '../auth/AuthContext';
import { formatPrincipal } from '../utils/icp';

export default function UserInfo() {
  const { isAuthenticated, principal } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Not Authenticated</h2>
        <p className="text-gray-600">
          Please log in to see your identity information.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Identity</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Principal ID:</h3>
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
          <p className="break-all font-mono text-sm">{principal}</p>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Shortened: {formatPrincipal(principal)}
        </p>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>
          Your principal is a unique identifier associated with your Internet Identity.
          It can be used to authenticate you across different applications on the Internet Computer.
        </p>
      </div>
    </div>
  );
} 