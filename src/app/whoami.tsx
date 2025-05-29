"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { AuthClient } from "@dfinity/auth-client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// For local development, you might need to use a different URL
// const identityProvider = process.env.NODE_ENV === 'production'
//   ? 'https://identity.ic0.app'
//   : 'http://localhost:8000?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai';

const identityProvider = "https://identity.ic0.app";

// Reusable button component with proper types
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = "primary",
  className = "",
}) => {
  const baseStyles =
    "px-6 py-3 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-sm text-base";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500",
    secondary:
      "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Loading fallback for Suspense
const LoadingFallback = () => (
  <div className="flex min-h-screen bg-gray-900 text-white">
    <div className="max-w-4xl mx-auto w-full px-6 py-12">
      <div className="flex items-center justify-center mb-8">
        <div className="animate-pulse h-16 w-16 bg-gray-700 rounded-full"></div>
      </div>
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Inner component that uses useSearchParams
const WhoAmIInner = () => {
  const searchParams = useSearchParams();
  const redirectScheme = searchParams.get("redirectScheme");

  const [state, setState] = useState<{
    authClient: AuthClient | undefined;
    isAuthenticated: boolean;
    principal: string | null;
    error: string | null;
    isClientSide: boolean;
    isLoading: boolean;
  }>({
    authClient: undefined,
    isAuthenticated: false,
    principal: null,
    error: null,
    isClientSide: false,
    isLoading: false,
  });

  // Memoize fetchPrincipalId with useCallback
  const fetchPrincipalId = useCallback(async () => {
    if (!state.authClient) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const principal = state.authClient
        .getIdentity()
        .getPrincipal()
        .toString();
      setState((prev) => ({
        ...prev,
        principal,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching principal ID:", error);
      setState((prev) => ({
        ...prev,
        error: `Failed to fetch principal ID: ${
          error instanceof Error ? error.message : String(error)
        }`,
        isLoading: false,
      }));
    }
  }, [state.authClient]);

  // First, check if we're running in the browser
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isClientSide: true,
    }));
  }, []);

  useEffect(() => {
    if (state.principal) {
      navigator.clipboard.writeText(`zapx_auth:${state.principal}`);
      alert("Authentication successful!. Return to the app.");

      window.close();
    }
  }, [state.principal]);

  // Fetch principal ID whenever authentication status changes
  useEffect(() => {
    if (state.isAuthenticated && state.authClient) {
      fetchPrincipalId();
    }
  }, [state.isAuthenticated, state.authClient, fetchPrincipalId]);

  // Update URL with principal ID when it becomes available
  useEffect(() => {
    if (state.principal && typeof window !== "undefined") {
      // Get current URL
      const url = new URL(window.location.href);

      // Add or update principalId parameter
      url.searchParams.set("principalId", state.principal);

      // Update the URL without reloading the page
      window.history.replaceState({}, "", url.toString());

      // If redirectScheme is present, the user can click "Complete Authentication" to trigger the redirect
    }
  }, [state.principal, redirectScheme]);

  // Then initialize auth client only on the client side
  useEffect(() => {
    // Only run this effect if we're on the client side
    if (!state.isClientSide) return;

    const init = async () => {
      try {
        console.log("Initializing auth client...");
        await initAuth();
        console.log("Auth client initialized successfully");
      } catch (error) {
        console.error("Error initializing auth client:", error);
        setState((prev) => ({
          ...prev,
          error: `Auth initialization failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        }));
      }
    };

    init();
  }, [state.isClientSide]); // Only run when isClientSide changes to true

  const initAuth = async () => {
    try {
      // Ensure we're in a browser environment with crypto support
      if (typeof window === "undefined" || !window.crypto) {
        throw new Error("SubtleCrypto is not available in this environment");
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();
      console.log("Authentication status:", isAuthenticated);

      setState((prev) => ({
        ...prev,
        authClient,
        isAuthenticated,
        error: null,
        isLoading: false,
      }));

      return authClient;
    } catch (error) {
      console.error("Error in initAuth:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const login = async () => {
    if (!state.authClient) {
      console.error("Auth client not initialized");
      setState((prev) => ({
        ...prev,
        error: "Cannot login: Auth client not initialized",
      }));
      return;
    }

    console.log("Starting login process...");
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      await state.authClient.login({
        identityProvider,
        onSuccess: () => {
          console.log("Login successful");
          initAuth();
        },
        onError: (error) => {
          console.error("Login error:", error);
          setState((prev) => ({
            ...prev,
            error: `Login failed: ${error}`,
            isLoading: false,
          }));
        },
      });
    } catch (error) {
      console.error("Exception during login:", error);
      setState((prev) => ({
        ...prev,
        error: `Login exception: ${
          error instanceof Error ? error.message : String(error)
        }`,
        isLoading: false,
      }));
    }
  };

  const logout = async () => {
    if (!state.authClient) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await state.authClient.logout();
      await initAuth();
      setState((prev) => ({
        ...prev,
        principal: null,
        isLoading: false,
      }));

      // Remove principalId from URL
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("principalId");
        window.history.replaceState({}, "", url.toString());
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setState((prev) => ({
        ...prev,
        error: `Logout failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        isLoading: false,
      }));
    }
  };

  // Complete auth and redirect back to the app with principal ID

  const finishAuth = () => {
    if (state.principal) {
      navigator.clipboard.writeText(`zapx_auth:${state.principal}`);
      alert("Authentication successful!. Return to the app.");

      window.close();
    }

    if (state.principal && redirectScheme) {
      // let finalRedirectUrl;

      navigator.clipboard.writeText(`zapx_auth:${state.principal}`);
      alert("Authentication successful!. Return to the app.");

      window.close();

      try {
        // Decode the redirectScheme in case it's URL encoded
        // const decodedRedirectScheme = decodeURIComponent(redirectScheme);
        // // Check if it already includes the full redirect URL
        // if (decodedRedirectScheme.includes("://auth")) {
        //   // If it's already a full URL like "zap-x://auth", just append the principalId
        //   finalRedirectUrl = `${decodedRedirectScheme}?principalId=${state.principal}`;
        // } else {
        //   // If it's just a scheme like "zap-x", construct the full URL
        //   const scheme = decodedRedirectScheme.replace("://", "");
        //   finalRedirectUrl = `${scheme}://auth?principalId=${state.principal}`;
        // }
        // console.log("Redirecting to:", finalRedirectUrl);
        // window.location.href = finalRedirectUrl;
      } catch (error) {
        console.error("Error processing redirect:", error);
        // Fallback to original behavior
        window.location.href = `${redirectScheme}://auth?principalId=${state.principal}`;
      }
    }
  };

  // Display a loading state if we're not on the client side yet
  if (!state.isClientSide) {
    return <LoadingFallback />;
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-20 h-20 mb-4">
            <Image
              src="/zap.png"
              alt="Zap Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-center">Zap Authentication</h1>
          <p className="mt-2 text-xl text-center text-blue-400">
            Fast payments with Internet Computer
          </p>
        </div>

        {state.error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="font-medium text-red-300">
              <strong>Error:</strong> {state.error}
            </p>
            <p className="mt-2 text-red-300">
              <strong>Note:</strong> This could be because the SubtleCrypto API
              is not available. Make sure you&apos;re accessing this page over
              HTTPS, as some browsers require a secure context for cryptographic
              operations.
            </p>
          </div>
        )}

        <div className="mb-8 p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="relative w-8 h-8 mr-3">
              <Image
                src="/icp.png"
                alt="Internet Computer Protocol"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <h2 className="text-2xl font-semibold text-blue-400">
              Zap Payment App
            </h2>
          </div>
          <p className="mb-3 text-gray-300">
            Welcome to the Zap app - your fast and secure solution for payments
            with ICP (Internet Computer Protocol).
          </p>
          <p className="mb-3 text-gray-300">
            {!state.isAuthenticated ? (
              <>
                To start making payments, please log in with Internet Identity.
                This secure authentication system will generate your unique
                principal ID.
              </>
            ) : (
              <>
                You&apos;re now logged in and ready to make fast payments with
                ICP. Your unique principal ID is displayed below.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {state.isLoading ? (
            <div className="px-6 py-3 rounded-md bg-gray-700 text-gray-400">
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            </div>
          ) : !state.isAuthenticated ? (
            <Button onClick={login} className="flex items-center">
              <div className="relative w-5 h-5 mr-2">
                <Image
                  src="/icp.png"
                  alt="ICP"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              Login with Internet Identity
            </Button>
          ) : (
            <>
              <Button onClick={logout} variant="secondary">
                Logout
              </Button>
              {redirectScheme && (
                <Button onClick={finishAuth}>Complete Authentication</Button>
              )}
            </>
          )}
        </div>

        {state.principal && (
          <div className="p-6 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">
              Your principal ID is:
            </h2>
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-md overflow-x-auto">
              <code className="font-mono text-green-400 break-all">
                {state.principal}
              </code>
            </div>
            <div className="mt-4 flex items-center text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Authenticated with Internet Identity</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap the component in Suspense
const WhoAmI = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WhoAmIInner />
    </Suspense>
  );
};

export default WhoAmI;
