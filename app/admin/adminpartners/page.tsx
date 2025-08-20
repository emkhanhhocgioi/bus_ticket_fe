'use client';

import { useState, useEffect } from 'react';
import { getPartners, getPartnerById, verifyPartner } from '../../../api/admin';

interface Partner {
  _id: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  businessLicense: string;
  vehicleCount: number;
  operatingYears: number;
  routes: string;
  website: string;
  description: string;
  isVerified: boolean;
  profilePicture: string;
  walletAddress: string;
  walletBalance: number;
  createdAt: string;
}

interface PartnerResponse {
  data: any;
  partners: Partner[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPartners: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function PartnersManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const queryParams: any = {};
      
      if (statusFilter) {
        queryParams.status = statusFilter;
      }
      
      if (searchTerm) {
        queryParams.search = searchTerm;
      }

      const response: PartnerResponse = await getPartners(queryParams);
      console.log("Fetched partners:", response);
      setPartners(response.data.partners);
      setPagination(response.data.pagination);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPartner = async (partnerId: string, isVerified: boolean) => {
    try {
      await verifyPartner(partnerId, { isVerified });
      setPartners(partners.map(partner => 
        partner._id === partnerId ? { ...partner, isVerified } : partner
      ));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to verify partner');
    }
  };

  const handleViewPartner = async (partnerId: string) => {
    try {
      const response = await getPartnerById(partnerId);
      setSelectedPartner(response);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch partner details');
    }
  };

  const filteredPartners = partners.filter(partner =>
    partner.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Partner Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all partners and their verification status
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Partners
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, email, or address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Partners</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchPartners}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">Loading partners...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPartners.map((partner) => (
                  <tr key={partner._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{partner.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.vehicleCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        partner.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {partner.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(partner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPartner(partner._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {!partner.isVerified && (
                          <button
                            onClick={() => handleVerifyPartner(partner._id, true)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Verify
                          </button>
                        )}
                        {partner.isVerified && (
                          <button
                            onClick={() => handleVerifyPartner(partner._id, false)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Info */}
            {pagination && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <span className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((pagination.currentPage - 1) * 10) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * 10, pagination.totalPartners)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.totalPartners}</span> results
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Partner Details Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Partner Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner.company}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Business License</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner.businessLicense}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Count</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner.vehicleCount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Operating Years</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner.operatingYears}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Routes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner.routes}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedPartner.isVerified ? 'Verified' : 'Pending Verification'}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              {!selectedPartner.isVerified && (
                <button
                  onClick={() => {
                    handleVerifyPartner(selectedPartner._id, true);
                    setSelectedPartner(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Verify
                </button>
              )}
              <button
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
