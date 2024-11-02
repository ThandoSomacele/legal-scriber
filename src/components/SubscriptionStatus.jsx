import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export function SubscriptionStatus() {
  const { subscription, loading, error } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="animate-spin h-5 w-5 text-indigo-600" />
        <span className="ml-2 text-gray-600">Checking subscription status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 text-red-700 rounded-md">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  const { active, subscription: details } = subscription;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center">
          {active ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span className="text-gray-700">
            Status: <span className={active ? "text-green-600" : "text-red-600"}>
              {active ? "Active" : "Inactive"}
            </span>
          </span>
        </div>

        {active && details && (
          <>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700">
                Plan: {details.planId.charAt(0).toUpperCase() + details.planId.slice(1)}
              </span>
            </div>
            
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Usage This Month</h3>
              <div className="space-y-2">
                <div className="relative pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        Transcription Hours
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {/* Add actual usage tracking here */}
                        5/10 hours
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-indigo-200">
                    <div
                      className="w-1/2 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!active && (
          <div className="mt-4">
            <a
              href="/subscribe"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Plans
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
