"use client";

import React, { useState, useMemo } from "react";
import { useRole, PaluwaganApplication } from "@/context/RoleContext";
import { generatePaluwaganApplicationPDF } from "@/utils/pdfGenerator";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Download,
  FileCheck,
  Info,
  XCircle,
} from "lucide-react";

export default function PaluwaganApplicationsPage() {
  const {
    paluwaganApplications,
    paluwaganBatches,
    approvePaluwaganApplication,
    rejectPaluwaganApplication,
    updatePaluwaganApplicationStatus,
    showToast
  } = useRole();

  // Search/Filters states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selection states
  const [selectedApp, setSelectedApp] = useState<PaluwaganApplication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // PDF Viewer Modal State
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState<string>("");
  const [activePdfFileName, setActivePdfFileName] = useState<string>("");

  // Form states for approval/rejection
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [allowReapply, setAllowReapply] = useState(true);
  const [reqInfoRemarks, setReqInfoRemarks] = useState("");

  // Filtered applications list
  const filteredApps = useMemo(() => {
    return paluwaganApplications.filter((app) => {
      const matchesSearch =
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.mobileNumber.includes(searchTerm) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [paluwaganApplications, searchTerm, statusFilter]);

  const getOrGenerateDrivePdf = async (app: PaluwaganApplication): Promise<{ url: string; fileName: string; fileId: string }> => {
    const cleanId = app.id.startsWith("app-") ? app.id.replace("app-", "PA-").slice(0, 7) : app.id;
    const formattedCustomerName = app.fullName.trim().replace(/\s+/g, "_");
    const defaultFileName = app.pdfFileName || `Paluwagan_Application_${cleanId}_${formattedCustomerName}.pdf`;

    if (app.googleDriveFileId) {
      return {
        url: `/api/paluwagan/view-drive?fileId=${encodeURIComponent(app.googleDriveFileId)}`,
        fileName: defaultFileName,
        fileId: app.googleDriveFileId,
      };
    }

    // Fallback: Generate PDF and register Drive ID via Server API
    const pdfRes = await generatePaluwaganApplicationPDF(
      {
        applicationId: cleanId,
        dateSubmitted: app.dateSubmitted,
        status: app.status,
        fullName: app.fullName,
        birthdate: app.birthdate,
        age: app.age,
        civilStatus: app.civilStatus,
        mobileNumber: app.mobileNumber,
        emailAddress: app.customerEmail,
        completeAddress: app.completeAddress,
        barangay: app.barangay,
        municipalityCity: app.municipalityCity,
        province: app.province,
        emergencyContactName: app.emergencyContactName,
        emergencyContactRelationship: app.emergencyContactRelationship,
        emergencyContactNumber: app.emergencyContactNumber,
        occupation: app.occupation,
        employerName: app.employerName || "Self-Employed",
        monthlyIncomeRange: app.monthlyIncomeRange,
        idType: app.idType,
      },
      null
    );

    const uploadRes = await fetch("/api/paluwagan/upload-drive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pdfBase64: pdfRes.pdfUrl,
        fileName: defaultFileName,
        applicationId: cleanId,
        customerName: app.fullName,
      }),
    });

    let createdFileId = `gdrive_${cleanId}_${Math.random().toString(36).substring(2, 8)}`;
    if (uploadRes.ok) {
      const data = await uploadRes.json();
      if (data.googleDriveFileId) createdFileId = data.googleDriveFileId;
    }

    app.googleDriveFileId = createdFileId;

    return {
      url: `/api/paluwagan/view-drive?fileId=${encodeURIComponent(createdFileId)}`,
      fileName: defaultFileName,
      fileId: createdFileId,
    };
  };

  const handleViewPdf = async (app: PaluwaganApplication) => {
    const { url, fileName } = await getOrGenerateDrivePdf(app);
    setActivePdfUrl(url);
    setActivePdfFileName(fileName);
    setIsPdfViewerOpen(true);
  };

  const handleDownloadPdf = async (app: PaluwaganApplication) => {
    const { url, fileName } = await getOrGenerateDrivePdf(app);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("PDF Downloaded", `Downloaded application document ${fileName} from Private Drive.`, "success");
  };

  const handleOpenDetails = (app: PaluwaganApplication) => {
    setSelectedApp(app);
    setIsDetailsOpen(true);
  };

  const handleOpenApprove = () => {
    if (!selectedApp) return;
    const activeBatches = paluwaganBatches.filter((b) => b.status === "Active");
    if (activeBatches.length > 0) {
      setSelectedBatchId(activeBatches[0].id);
    } else {
      setSelectedBatchId("");
    }
    setIsApproveOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedApp || !selectedBatchId) return;
    const success = await approvePaluwaganApplication(selectedApp.id, selectedBatchId);
    if (success) {
      showToast("Application Approved", `Approved membership for ${selectedApp.fullName}.`, "success");
      setIsApproveOpen(false);
      setIsDetailsOpen(false);
      setSelectedApp(null);
    }
  };

  const handleOpenReject = () => {
    setRejectRemarks("");
    setAllowReapply(true);
    setIsRejectOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedApp || !rejectRemarks) return;
    const success = await rejectPaluwaganApplication(selectedApp.id, rejectRemarks, allowReapply);
    if (success) {
      showToast("Application Rejected", `Rejected membership application for ${selectedApp.fullName}.`, "warning");
      setIsRejectOpen(false);
      setIsDetailsOpen(false);
      setSelectedApp(null);
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedApp) return;
    const promptRemarks = prompt("Enter notes for the customer regarding additional information needed:", "Please provide an updated copy of your valid Government ID.");
    if (promptRemarks !== null) {
      await updatePaluwaganApplicationStatus(selectedApp.id, "Requires Additional Information", promptRemarks);
      showToast("Status Updated", `Requested additional info for ${selectedApp.fullName}.`, "info");
      setIsDetailsOpen(false);
      setSelectedApp(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Paluwagan Applications</h1>
        <p className="text-xs text-slate-500 font-medium">Review and process customer Paluwagan membership applications.</p>
      </div>

      {/* FILTER BAR */}
      <Card className="p-4 bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="All">All Applications</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* APPLICATIONS TABLE */}
      <Card className="overflow-hidden border border-slate-200/60 rounded-3xl bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10.5px]">Application ID</TableHead>
              <TableHead className="text-[10.5px]">Applicant Name</TableHead>
              <TableHead className="text-[10.5px]">Contact Number</TableHead>
              <TableHead className="text-[10.5px]">Govt ID Type</TableHead>
              <TableHead className="text-[10.5px]">Date Submitted</TableHead>
              <TableHead className="text-[10.5px]">Status</TableHead>
              <TableHead className="text-[10.5px]">PDF Available</TableHead>
              <TableHead className="text-[10.5px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-slate-400 font-medium">
                  No membership applications matches the filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredApps.map((app) => {
                const displayAppId = app.id.startsWith("app-") ? `PA-${app.id.slice(4, 8).toUpperCase()}` : app.id;
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs font-bold text-emerald-800">{displayAppId}</TableCell>
                    <TableCell className="font-extrabold text-slate-800 text-xs">{app.fullName}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600 font-mono">{app.mobileNumber}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600">{app.idType || "National ID"}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-500 font-mono">{app.dateSubmitted}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase border ${
                        app.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        app.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" :
                        app.status === "Requires Additional Information" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {app.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                        <FileCheck className="w-3 h-3 text-emerald-600" /> PDF Ready
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenDetails(app)}
                        className="cursor-pointer font-bold"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 1. APPLICATION DETAILS MODAL */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Paluwagan Membership Application Details"
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Header Status Badge */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Application ID & Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg">
                    {selectedApp.id.startsWith("app-") ? `PA-${selectedApp.id.slice(4, 8).toUpperCase()}` : selectedApp.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border inline-block ${
                    selectedApp.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    selectedApp.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    selectedApp.status === "Requires Additional Information" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {selectedApp.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Date Submitted</span>
                <span className="font-extrabold text-slate-800 font-mono">{selectedApp.dateSubmitted}</span>
              </div>
            </div>

            {/* CONSOLIDATED APPLICATION PDF ACTION BAR */}
            <div className="p-4 bg-[#1B4332] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600/30 text-emerald-300 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Consolidated Application Document (ONE PDF)</h4>
                  <p className="text-[10px] text-emerald-100/80">Contains all form data & compressed Government ID inside a single document record.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewPdf(selectedApp)}
                  className="font-bold bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  VIEW APPLICATION PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadPdf(selectedApp)}
                  className="font-bold bg-[#D4AF37] hover:bg-[#c29d2f] text-emerald-950 border-transparent cursor-pointer"
                  icon={<Download className="w-3.5 h-3.5 text-emerald-950" />}
                >
                  DOWNLOAD PDF
                </Button>
              </div>
            </div>

            {/* Form grid info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-850 uppercase tracking-widest text-[10px] border-l-2 border-emerald-500 pl-2">Personal & Contact</h4>
                <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Full Name</span>
                    <span className="font-extrabold text-slate-800">{selectedApp.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Age / Civil Status</span>
                    <span className="font-bold text-slate-700">{selectedApp.age} y/o | {selectedApp.civilStatus || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Birthdate</span>
                    <span className="font-bold text-slate-700 font-mono">{selectedApp.birthdate || "N/A"}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-100/60">
                    <span className="text-slate-400">Mobile</span>
                    <span className="font-bold text-slate-700 font-mono">{selectedApp.mobileNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email</span>
                    <span className="font-bold text-slate-700 block truncate max-w-[160px]">{selectedApp.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-850 uppercase tracking-widest text-[10px] border-l-2 border-emerald-500 pl-2">Residential Address</h4>
                <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 shrink-0">Street/House No</span>
                    <span className="font-bold text-slate-700 text-right">{selectedApp.completeAddress || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Barangay</span>
                    <span className="font-bold text-slate-700">{selectedApp.barangay || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Municipality</span>
                    <span className="font-bold text-slate-700">{selectedApp.municipalityCity || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Province</span>
                    <span className="font-bold text-slate-700">{selectedApp.province || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-850 uppercase tracking-widest text-[10px] border-l-2 border-emerald-500 pl-2">Employment & Income</h4>
                <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Occupation</span>
                    <span className="font-extrabold text-slate-800">{selectedApp.occupation || "N/A"}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-100/60">
                    <span className="text-slate-400">Income Range</span>
                    <span className="font-extrabold text-emerald-800">{selectedApp.monthlyIncomeRange || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Identity & emergency contact */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-850 uppercase tracking-widest text-[10px] border-l-2 border-emerald-500 pl-2">Verification & Storage Reference</h4>
                <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Govt ID Type</span>
                    <span className="font-bold text-slate-700">{selectedApp.idType || "National ID"}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>Google Drive File ID</span>
                    <span className="font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {selectedApp.googleDriveFileId || `gdrive_${selectedApp.id}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>PDF Record Name</span>
                    <span className="font-bold text-[#1B4332] underline hover:text-emerald-700 cursor-pointer" onClick={() => handleViewPdf(selectedApp)}>
                      {selectedApp.pdfFileName || `Paluwagan_Application_${selectedApp.id}_${selectedApp.fullName.replace(/\s+/g, "_")}.pdf`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-100/60">
                    <span className="text-slate-400">Emergency Contact</span>
                    <span className="font-bold text-slate-800">{selectedApp.emergencyContactName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Relationship / Tel</span>
                    <span className="font-bold text-slate-700">({selectedApp.emergencyContactRelationship || "N/A"}) {selectedApp.emergencyContactNumber || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Member Details once approved */}
            {selectedApp.status === "Approved" && (
              <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-2">
                <div className="text-[10px] text-[#2D6A4F] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Paluwagan Membership Credentials
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-slate-400">Member ID</span>
                    <span className="font-bold text-slate-800 font-mono block">{selectedApp.memberId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Assigned Batch</span>
                    <span className="font-bold text-[#1B4332] block">
                      {paluwaganBatches.find(b => b.id === selectedApp.assignedBatchId)?.name || "Active Batch"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Remarks / Info Request Notes */}
            {selectedApp.adminRemarks && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Admin Remarks / Notes</span>
                <p className="font-medium text-slate-700 leading-normal font-semibold">"{selectedApp.adminRemarks}"</p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRequestInfo}
                className="font-bold cursor-pointer text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100"
                icon={<Info className="w-3.5 h-3.5 text-blue-600" />}
              >
                Requires Add'l Info
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="font-bold cursor-pointer text-rose-600 border-rose-100 hover:bg-rose-50"
                  onClick={handleOpenReject}
                >
                  Reject Application
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold cursor-pointer bg-emerald-600 text-white hover:bg-emerald-800"
                  onClick={handleOpenApprove}
                >
                  Approve Application
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. APPROVAL CONFIRMATION MODAL */}
      <Modal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        title="Approve Paluwagan Membership"
      >
        <div className="space-y-4 text-xs text-slate-700 font-sans">
          <p className="font-semibold text-slate-600 leading-relaxed">
            Please assign a **Paluwagan Batch** to complete the approval process. The system will automatically:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-500 font-medium leading-relaxed">
            <li>Generate a unique Customer Member ID.</li>
            <li>Enable Paluwagan installment checkouts for **Crispylicious Lechon** orders.</li>
            <li>Send a membership approval confirmation email.</li>
          </ul>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Select Paluwagan Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
            >
              {paluwaganBatches.filter(b => b.status === "Active").map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} (Starts: {batch.startDate})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsApproveOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmApprove} className="font-bold cursor-pointer bg-emerald-600 text-white hover:bg-emerald-800">
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. REJECTION REMARKS MODAL */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Reject Paluwagan Membership"
      >
        <div className="space-y-4 text-xs text-slate-700 font-sans">
          <p className="font-semibold text-slate-600 leading-relaxed">
            Please enter the reason for rejecting this application. This message will be sent to the customer via email.
          </p>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase">Rejection Reason / Remarks</label>
            <textarea
              required
              rows={3}
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="e.g. Uploaded government ID was blurry and unreadable. Please upload a clear photo of your ID."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="flex items-center gap-2 py-1.5">
            <input
              type="checkbox"
              id="allowReapplyCheck"
              checked={allowReapply}
              onChange={(e) => setAllowReapply(e.target.checked)}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded border-slate-350 cursor-pointer"
            />
            <label htmlFor="allowReapplyCheck" className="font-bold text-slate-600 select-none cursor-pointer">
              Allow customer to reapply immediately
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!rejectRemarks} onClick={handleConfirmReject} className="font-bold cursor-pointer bg-rose-600 text-white hover:bg-rose-800">
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. IN-APP CONSOLIDATED PDF VIEWER MODAL */}
      <Modal
        isOpen={isPdfViewerOpen}
        onClose={() => setIsPdfViewerOpen(false)}
        title={`Application Record PDF - ${activePdfFileName}`}
        size="xl"
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-xl text-xs">
            <span className="font-bold text-slate-700 font-mono truncate">{activePdfFileName}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const link = document.createElement("a");
                link.href = activePdfUrl;
                link.download = activePdfFileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="font-bold cursor-pointer text-emerald-800 bg-white shadow-xs"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Download PDF
            </Button>
          </div>
          <div className="w-full h-[68vh] border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
            {activePdfUrl ? (
              <iframe
                src={activePdfUrl}
                title="Paluwagan Application Document PDF"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium text-xs">
                Loading PDF Document...
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
