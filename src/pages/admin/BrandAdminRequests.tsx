import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    ShieldAlert,
    FileCheck,
    User,
    Building,
    Calendar
} from "lucide-react";
import { adminApi } from "../../api/admin";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "../../components/ui/sheet";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { toastError, toastSuccess } from "../../utils/toast";

const BrandAdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Debounce search to avoid refetch on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Sheet State
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Reject Logic inside Sheet (simple prompt for now, or state)
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, debouncedSearch, currentPage]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getBrandAdminRequests({
                status: statusFilter,
                search: debouncedSearch,
                page: currentPage,
                limit: 10
            });
            console.log("data", data);
            setRequests(data.requests);
            setTotalPages(Math.ceil(data.total / 10));
        } catch (err) {
            console.error("Failed to fetch requests", err);
            setError("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleReview = (request: any) => {
        setSelectedRequest(request);
        setRejectReason("");
        setShowRejectInput(false);
        setIsSheetOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;
        try {
            setActionLoading(true);
            await adminApi.approveBrandAdmin(selectedRequest.user_id);
            setIsSheetOpen(false);
            toastSuccess("Brand admin request approved successfully");
            fetchRequests(); // Refresh list
        } catch (err: any) {
            toastError(err.message || "Failed to approve");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!showRejectInput) {
            setShowRejectInput(true);
            return;
        }
        if (!rejectReason.trim()) {
            toastError("Please provide a rejection reason.");
            return;
        }

        try {
            setActionLoading(true);
            await adminApi.rejectBrandAdmin(selectedRequest.user_id, rejectReason);
            setIsSheetOpen(false);
            toastSuccess("Brand admin request rejected");
            fetchRequests(); // Refresh list
        } catch (err: any) {
            toastError(err.message || "Failed to reject");
        } finally {
            setActionLoading(false);
        }
    };

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
            case "active":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
            case "rejected":
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
            case "pending":
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>; // Use yellow/orange for attention
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Brand Admin Requests</h1>
                <p className="text-gray-600">Review and approve Brand Admin registration requests</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by brand name, brand admin name, or work email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-48">
                            <select
                                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option>All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Registration Requests</h2>
                    <span className="text-sm text-gray-500">{requests.length} requests found</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 font-medium text-gray-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Brand / Organization</th>
                                <th className="px-6 py-4">Brand Admin Name</th>
                                <th className="px-6 py-4">Work Email</th>
                                <th className="px-6 py-4">Signup Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading requests...
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No requests found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req: any) => (
                                    <tr key={req.user_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{req.brand_name}</td>
                                        <td className="px-6 py-4">{req.firstName} {req.lastName}</td>
                                        <td className="px-6 py-4 text-blue-600 hover:underline">
                                            <a href={`mailto:${req.email}`}>{req.email}</a>
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2 ml-auto"
                                                onClick={() => handleReview(req)}
                                            >
                                                <Eye className="w-4 h-4" /> Review
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified) */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
                        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                        <span className="self-center text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                    </div>
                )}
            </div>

            {/* Review Drawer (Sheet) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-xl">Brand Admin Request Review</SheetTitle>
                            {selectedRequest && getStatusBadge(selectedRequest.status)}
                        </div>
                        <SheetDescription>
                            Review registration details and consent acknowledgements before approval.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            {/* Brand Admin Details */}
                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                                    <User className="w-4 h-4" /> Brand Admin Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-gray-500 text-xs">Full Name</p>
                                        <p className="font-medium text-gray-900">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Work Email</p>
                                        <p className="font-medium text-gray-900">{selectedRequest.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Organization / Brand Name</p>
                                        <p className="font-medium text-gray-900">{selectedRequest.brand_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Signup Date</p>
                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(selectedRequest.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            {/* Consent & Compliance */}
                            {/* <section className="space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                                    <FileCheck className="w-4 h-4" /> Consent & Compliance
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 border rounded-lg border-gray-100">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Terms & Conditions</p>
                                            <p className="text-xs text-gray-500">Accepted</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 border rounded-lg border-gray-100">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Privacy Policy</p>
                                            <p className="text-xs text-gray-500">Accepted</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 border rounded-lg border-gray-100">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">AI / Compliance Consent</p>
                                            <p className="text-xs text-gray-500">Acknowledged</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 pl-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Consent timestamp: {new Date(selectedRequest.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </section> */}

                            {/* Security Notice */}
                            {selectedRequest.status === 'pending' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                    <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-amber-900">Security Notice</h4>
                                        <p className="text-xs text-amber-800 mt-1">
                                            This account will remain inactive until approved. Approval will grant Brand Admin access to manage the brand and its users.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Reject Input (Conditional) */}
                            {selectedRequest.status === 'pending' && showRejectInput && (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Reason for Rejection *</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                        rows={3}
                                        placeholder="Please explain why this request is being rejected..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <SheetFooter className="mt-8 flex-col sm:flex-col gap-3 sm:space-x-0">
                        {/* <div className="bg-gray-50 p-3 rounded text-center text-xs text-gray-400 border border-gray-100 w-full mb-2">
                            All approval actions are recorded in the Audit Log.
                        </div> */}

                        {selectedRequest && selectedRequest.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <Button
                                    variant="default"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? "Processing..." : "Approve Request"}
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                >
                                    {showRejectInput ? (actionLoading ? "Rejecting..." : "Confirm Reject") : "Reject Request"}
                                </Button>
                            </div>
                        )}

                        {showRejectInput && (
                            <Button variant="ghost" size="sm" onClick={() => setShowRejectInput(false)} className="mx-auto block">
                                Cancel Rejection
                            </Button>
                        )}
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default BrandAdminRequests;
