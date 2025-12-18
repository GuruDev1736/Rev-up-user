"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import { getUserBikeRequests } from "@/api/requestBike";
import { useAuth } from "@/contexts/AuthContext";

export default function ManageRequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchRequests = async () => {
      if (!user?.userId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getUserBikeRequests(user.userId);
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setError(error.message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, isAuthenticated, router]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approve':
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'reject':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    try {
      let date;
      // Handle array format [year, month, day]
      if (Array.isArray(dateInput)) {
        const [year, month, day] = dateInput;
        // JavaScript Date months are 0-indexed, so subtract 1
        date = new Date(year, month - 1, day);
      } else {
        // Handle timestamp or string format
        date = new Date(dateInput);
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Container className="min-h-screen py-8 px-4 mt-24">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your requests...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="min-h-screen py-8 px-4 mt-24">
        <div className="text-center p-10 bg-red-50 rounded-2xl border-2 border-red-200 max-w-2xl mx-auto">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="min-h-screen py-8 px-4 mt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Manage Requests</h1>
          <p className="text-gray-600">View and track all your bike requests</p>
        </div>

        {/* Requests List */}
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col h-full"
              >
                <div className="p-6 flex flex-col flex-grow">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        {request.bike?.bikeName || 'Bike Request'}
                      </h3>
                      {request.bike?.place && (
                        <p className="text-xs text-gray-600 flex items-center gap-1 truncate">
                          <span>📍</span>
                          <span>{request.bike.place.placeName}</span>
                        </p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(request.status)}`}>
                      {request.status || 'Pending'}
                    </div>
                  </div>

                  {/* Bike Details */}
                  {request.bike && (
                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Brand</p>
                        <p className="text-xs font-semibold text-gray-900 truncate">{request.bike.brand || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Model</p>
                        <p className="text-xs font-semibold text-gray-900 truncate">{request.bike.bikeModel || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Engine</p>
                        <p className="text-xs font-semibold text-gray-900">{request.bike.engineCapacity}cc</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-xs font-semibold text-gray-900">₹{request.bike.pricePerDay}/day</p>
                      </div>
                    </div>
                  )}

                  {/* Request Note */}
                  <div className="mb-4 flex-grow">
                    <p className="text-sm font-medium text-gray-700 mb-1">Request Note:</p>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200 line-clamp-3">
                      {request.requestNote || 'No note provided'}
                    </p>
                  </div>

                  {/* Footer Row */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 mt-auto">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Requested:</span> {formatDate(request.createdAt)}
                    </div>
                    {request.updatedAt && request.updatedAt !== request.createdAt && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Updated:</span> {formatDate(request.updatedAt)}
                      </div>
                    )}
                    
                    {/* Book Now Button for Approved Requests */}
                    {request.status?.toUpperCase() === 'APPROVE' && request.bike?.id && (
                      <button
                        onClick={() => router.push(`/booking/${request.bike.id}?fromRequest=true`)}
                        className="mt-3 w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Requests Yet</h3>
            <p className="text-gray-500 mb-6">You haven't submitted any bike requests</p>
            <button
              onClick={() => router.push('/request-bike')}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-md"
            >
              Request a Bike
            </button>
          </div>
        )}
      </div>
    </Container>
  );
}
