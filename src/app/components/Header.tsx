'use client';

import { useAuth } from '../auth/AuthContext';

export default function Header() {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <header className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
      <div className="text-xl font-bold">ICP Who Am I</div>
      <div>
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Log out
          </button>
        ) : (
          <button
            onClick={login}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Log in with Internet Identity
          </button>
        )}
      </div>
    </header>
  );
} 