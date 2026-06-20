import { Suspense } from "react";
import DigilockerCallbackClient from "./DigilockerCallbackClient";

export default function DigilockerCallbackPage() {
  return (
    <Suspense
      fallback={(
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-200 p-10 text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
      )}
    >
      <DigilockerCallbackClient />
    </Suspense>
  );
}
