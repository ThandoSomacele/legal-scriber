// src/components/SandboxTestInfo.jsx

import React from 'react';
import { InfoIcon } from 'lucide-react';
import { getSandboxTestCards } from '../services/subscriptionService';

export default function SandboxTestInfo() {
  const testCards = getSandboxTestCards();
  
  if (!testCards) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <InfoIcon className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            PayFast Sandbox Test Information
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p className="mb-2">Use these test card details for sandbox testing:</p>
            <div className="space-y-2">
              <div>
                <p className="font-semibold">Successful Payment:</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Card Number: {testCards.successful.number}</li>
                  <li>Expiry: {testCards.successful.expiry}</li>
                  <li>CVV: {testCards.successful.cvv}</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Failed Payment:</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Card Number: {testCards.failed.number}</li>
                  <li>Expiry: {testCards.failed.expiry}</li>
                  <li>CVV: {testCards.failed.cvv}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
