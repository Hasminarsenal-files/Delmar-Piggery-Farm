"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole, PaluwaganApplication } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Mail,
  ArrowRight,
  User,
  MapPin,
  Lock,
  Phone,
  Briefcase,
  Upload,
  Coins,
  Receipt,
  PiggyBank
} from "lucide-react";

export default function CustomerPaluwaganMembershipPage() {
  const {
    userName,
    userEmail,
    userAddress,
    userPhone,
    paluwaganApplications,
    paluwaganBatches,
    submitPaluwaganApplication,
    orders
  } = useRole();

  // Find this customer's application
  const myApp = paluwaganApplications.find((a) => a.customerEmail === userEmail);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Form values - ONLY prefill Full Name, Email, and Mobile Number from account session
  const [fullName, setFullName] = useState(userName);
  const [birthdate, setBirthdate] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [civilStatus, setCivilStatus] = useState("");
  const [mobileNumber, setMobileNumber] = useState(userPhone);
  const [emailAddress, setEmailAddress] = useState(userEmail);
  
  // Address - Start empty so user can fill out
  const [completeAddress, setCompleteAddress] = useState("");
  const [barangay, setBarangay] = useState("");
  const [municipalityCity, setMunicipalityCity] = useState("");
  const [province, setProvince] = useState("");

  const handleBirthdateChange = (dateVal: string) => {
    setBirthdate(dateVal);
    if (dateVal) {
      const birth = new Date(dateVal);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      if (!isNaN(calculatedAge) && calculatedAge >= 0) {
        setAge(calculatedAge);
      }
    } else {
      setAge("");
    }
  };

  // Verification & Emergency Contact
  const [idType, setIdType] = useState("National ID");
  const [idFileName, setIdFileName] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");

  // Employment
  const [occupation, setOccupation] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [monthlyIncomeRange, setMonthlyIncomeRange] = useState("₱10,000 - ₱20,000");

  // Agreements
  const [certifyCorrect, setCertifyCorrect] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Sync session props (Name, Email, Mobile ONLY)
  useEffect(() => {
    if (userName) setFullName(userName);
    if (userEmail) setEmailAddress(userEmail);
    if (userPhone) setMobileNumber(userPhone);
  }, [userName, userEmail, userPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certifyCorrect || !agreeTerms) return;

    await submitPaluwaganApplication({
      customerEmail: userEmail,
      fullName,
      birthdate,
      age: Number(age) || 18,
      civilStatus,
      mobileNumber,
      emailAddress,
      completeAddress,
      barangay,
      municipalityCity,
      province,
      idType,
      idFileName: idFileName || "mock_id_upload.jpg",
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactNumber,
      occupation,
      employerName: employerName || "Self-Employed",
      monthlyIncomeRange,
      allowReapply: true
    });

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowForm(false);
    }, 2500);
  };

  const handleApplyAgain = () => {
    // Reset form states and open application form
    setCertifyCorrect(false);
    setAgreeTerms(false);
    setBirthdate("");
    setOccupation("");
    setEmployerName("");
    setEmergencyContactName("");
    setEmergencyContactRelationship("");
    setEmergencyContactNumber("");
    setIdFileName("");
    setShowForm(true);
  };

  // Find associated batch details if approved
  const matchedBatch = paluwaganBatches.find((b) => b.id === myApp?.assignedBatchId);

  // Paluwagan Ledger calculations for approved user
  const paluwaganOrders = orders.filter(
    (o) => o.customerEmail === userEmail && o.orderType === "Paluwagan" && o.status !== "Pending"
  );
  const activePlan = paluwaganOrders.length > 0 ? paluwaganOrders[0] : null;

  const totalAmount = activePlan?.totalAmount || 0;
  const downPayment = activePlan?.downPayment || 0;
  const schedulePaid = activePlan?.paluwaganSchedule?.reduce((sum, item) => sum + item.amountPaid, 0) || 0;
  const totalPaid = downPayment + schedulePaid;
  const remainingBalance = activePlan?.remainingBalance ?? (totalAmount - totalPaid);
  const progressPct = Math.round((totalPaid / totalAmount) * 100) || 0;

  // Build payment history timeline log
  const paymentHistory: Array<{
    receiptNumber: string;
    date: string;
    amountPaid: number;
    remainingBalanceAfter: number;
    type: "Down Payment" | "Installment";
  }> = [];

  if (downPayment > 0 && activePlan) {
    paymentHistory.push({
      receiptNumber: "DPF-DP-INIT",
      date: activePlan.dateCreated,
      amountPaid: downPayment,
      remainingBalanceAfter: totalAmount - downPayment,
      type: "Down Payment",
    });
  }

  if (activePlan?.installmentsLog) {
    let runningBalance = totalAmount - downPayment;
    activePlan.installmentsLog.forEach((log) => {
      runningBalance = Math.max(0, runningBalance - log.amount);
      const receiptNumber = log.remarks?.split(" - ")[0] || "DPF-REC-MOCK";
      paymentHistory.push({
        receiptNumber,
        date: log.date,
        amountPaid: log.amount,
        remainingBalanceAfter: runningBalance,
        type: "Installment",
      });
    });
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Paluwagan Membership Program</h1>
        <p className="text-xs text-slate-500 font-medium">Enjoy convenient installment payment options for Crispylicious Lechon.</p>
      </div>

      <AnimatePresence mode="wait">
        {formSuccess ? (
          // SUCCESS TRANSITION VIEW
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 text-center bg-white border border-slate-200/60 rounded-3xl shadow-sm max-w-lg mx-auto space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-full text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-800">Application Submitted Successfully</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Your Paluwagan Membership application is currently under review by our farm administrators.
                We have dispatched a receipt confirmation email to **{emailAddress}**.
              </p>
            </div>
          </motion.div>
        ) : showForm ? (
          // 2. PALUWAGAN REGISTRATION FORM
          <motion.div
            key="membership-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <Card className="bg-white border border-slate-200/60 rounded-3xl shadow-xl max-w-3xl mx-auto flex flex-col max-h-[72vh] sm:max-h-[75vh] overflow-hidden">
              {/* FIXED TOP HEADER - Stays locked at top of panel */}
              <div className="px-6 sm:px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10 shadow-xs">
                <h3 className="text-sm sm:text-base font-extrabold text-[#1B4332] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Paluwagan Membership Application Form
                </h3>
                <Button variant="secondary" size="sm" onClick={() => setShowForm(false)} className="font-bold cursor-pointer">
                  Cancel
                </Button>
              </div>

              {/* SCROLLABLE FORM BODY - Always scrollable */}
              <div 
                className="p-6 sm:p-8 overflow-y-scroll flex-1 max-h-[58vh] sm:max-h-[64vh]"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#059669 #f1f5f9" }}
              >
                <form onSubmit={handleSubmit} className="space-y-6 text-xs text-slate-700">

                {/* Section A: Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-l-2 border-emerald-500 pl-2">Personal Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Birthdate</label>
                      <input
                        type="date"
                        required
                        value={birthdate}
                        onChange={(e) => handleBirthdateChange(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Age</label>
                      <input
                        type="number"
                        min={18}
                        max={100}
                        required
                        placeholder="Auto-calculated"
                        value={age}
                        onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Civil Status</label>
                      <select
                        required
                        value={civilStatus}
                        onChange={(e) => setCivilStatus(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="">Select Civil Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                      <input
                        type="email"
                        required
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Complete Address */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-l-2 border-emerald-500 pl-2">Home Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Street Address / Pen details</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Purok Lapu-Lapu, Tickwas"
                        value={completeAddress}
                        onChange={(e) => setCompleteAddress(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Barangay</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tickwas"
                        value={barangay}
                        onChange={(e) => setBarangay(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Municipality / City</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dumalinao"
                        value={municipalityCity}
                        onChange={(e) => setMunicipalityCity(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Province</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Zamboanga del Sur"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Identity Verification & Emergency Contact */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-l-2 border-emerald-500 pl-2">Identity & Emergency Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Government-Issued ID Type</label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="National ID">National ID</option>
                        <option value="Driver's License">Driver's License</option>
                        <option value="Passport">Passport</option>
                        <option value="UMID">UMID</option>
                        <option value="PhilSys ID">PhilSys ID</option>
                        <option value="PRC ID">PRC ID</option>
                        <option value="Voter's ID">Voter's ID</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Upload ID (Government-issued ID file)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. passport_scan.png"
                          required
                          value={idFileName}
                          onChange={(e) => setIdFileName(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button type="button" className="p-2 border border-slate-250 bg-slate-50 rounded-xl hover:bg-slate-100 flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Emergency Contact Name</label>
                      <input
                        type="text"
                        required
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Emergency Contact Relationship</label>
                      <input
                        type="text"
                        required
                        value={emergencyContactRelationship}
                        onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Emergency Contact Number</label>
                      <input
                        type="text"
                        required
                        value={emergencyContactNumber}
                        onChange={(e) => setEmergencyContactNumber(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Section D: Employment Info */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-l-2 border-emerald-500 pl-2">Employment Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Occupation</label>
                      <input
                        type="text"
                        required
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="e.g. Sales Manager"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Employer or Business Name</label>
                      <input
                        type="text"
                        value={employerName}
                        onChange={(e) => setEmployerName(e.target.value)}
                        placeholder="e.g. Savorlicious Stores"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Monthly Income Range</label>
                      <select
                        value={monthlyIncomeRange}
                        onChange={(e) => setMonthlyIncomeRange(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="Below ₱10,000">Below ₱10,000</option>
                        <option value="₱10,000 - ₱20,000">₱10,000 - ₱20,000</option>
                        <option value="₱20,000 - ₱40,000">₱20,000 - ₱40,000</option>
                        <option value="Above ₱40,000">Above ₱40,000</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section E: Agreement Agreements */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="certifyCorrect"
                      checked={certifyCorrect}
                      onChange={(e) => setCertifyCorrect(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-350 cursor-pointer"
                    />
                    <label htmlFor="certifyCorrect" className="text-[11px] font-semibold text-slate-600 cursor-pointer select-none">
                      I certify that all information provided is true and correct.
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-350 cursor-pointer"
                    />
                    <label htmlFor="agreeTerms" className="text-[11px] font-semibold text-slate-600 cursor-pointer select-none">
                      I agree to the Paluwagan Terms and Conditions.
                    </label>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <Button
                    type="submit"
                    disabled={!certifyCorrect || !agreeTerms}
                    variant="primary"
                    className="font-bold cursor-pointer"
                  >
                    Submit Application
                  </Button>
                </div>
              </form>
              </div>
            </Card>
          </motion.div>
        ) : !myApp ? (
          // 1. STATUS NOT YET APPLIED
          <motion.div
            key="not-applied"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-8 text-center bg-white border border-slate-200/60 rounded-3xl shadow-sm max-w-xl mx-auto space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-800">Become a Paluwagan Member</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-md mx-auto">
                  Join our Paluwagan Membership Program to enjoy installment payment options for Crispylicious Lechon.
                  Your application will be reviewed by the administrator before approval.
                </p>
              </div>
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-left text-xs max-w-md mx-auto flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[10.5px] font-semibold text-slate-600 leading-relaxed">
                  **Important Note:** Paluwagan installment programs are strictly applicable to **Crispylicious Lechon** orders. Other livestock or food products are not eligible.
                </span>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowForm(true)}
                className="font-bold cursor-pointer shadow-md"
              >
                Apply for Membership
              </Button>
            </Card>
          </motion.div>
        ) : myApp.status === "Pending" ? (
          // 3. STATUS PENDING
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-8 text-center bg-white border border-slate-200/60 rounded-3xl shadow-sm max-w-xl mx-auto space-y-5">
              <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-10 h-10 animate-spin-slow stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200">
                  Pending Approval
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-2">Application Under Review</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-md mx-auto">
                  Your application is currently being reviewed by the administrator. 
                  Please wait for the approval notification. Paluwagan ordering options will remain disabled until approved.
                </p>
              </div>
            </Card>
          </motion.div>
        ) : myApp.status === "Rejected" ? (
          // 4. STATUS REJECTED
          <motion.div
            key="rejected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-8 text-center bg-white border border-slate-200/60 rounded-3xl shadow-sm max-w-xl mx-auto space-y-6">
              <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-200">
                  Application Not Approved
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-2">Rejection Notice</h3>
                {myApp.adminRemarks && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left text-xs font-semibold text-slate-600 max-w-md mx-auto leading-relaxed">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Feedback from Admin:</span>
                    "{myApp.adminRemarks}"
                  </div>
                )}
              </div>
              {myApp.allowReapply !== false ? (
                <Button
                  variant="primary"
                  onClick={handleApplyAgain}
                  className="font-bold cursor-pointer"
                >
                  Apply Again
                </Button>
              ) : (
                <span className="text-xs text-slate-450 block font-semibold">Reapplication is currently disabled by admin.</span>
              )}
            </Card>
          </motion.div>
        ) : (
          // 5. STATUS APPROVED (MEMBERSHIP DETAILS & ACTIVE LEDGER)
          <motion.div
            key="approved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Membership Header Card */}
            <Card className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-[#D4AF37]" />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-850">My Paluwagan Membership</h3>
                    <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Active</span>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">
                    Member ID: <span className="font-bold text-slate-700 font-mono">{myApp.memberId}</span> | Batch: <span className="font-bold text-[#1B4332]">{matchedBatch?.name || "Active Batch"}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:flex items-center gap-6 text-xs border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Date Approved</span>
                  <span className="font-bold text-slate-700 font-mono block">{myApp.dateApproved || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Member Since</span>
                  <span className="font-bold text-slate-700 font-mono block">{myApp.dateApproved?.split("-")[0] || "2026"}</span>
                </div>
              </div>
            </Card>

            {/* Render ledger details if they have an active Paluwagan plan */}
            {activePlan ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: Financials, Progress, alerts */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Financial Overview */}
                  <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl relative overflow-hidden space-y-4 shadow-sm">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]" />
                    <h4 className="text-xs font-bold text-slate-405 uppercase tracking-widest block">Ledger Overview</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-1 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Contract Amount</span>
                        <span className="text-sm font-extrabold text-slate-800">₱{totalAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Down Payment</span>
                        <span className="text-sm font-extrabold text-slate-800">₱{downPayment.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid</span>
                        <span className="text-sm font-extrabold text-emerald-600">₱{totalPaid.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Remaining Balance</span>
                        <span className="text-sm font-extrabold text-rose-600">₱{remainingBalance.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Next Due Date</span>
                        <span className="text-sm font-extrabold text-amber-600 font-mono block">{activePlan.nextDueDate || "Fully Paid"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Plan ID</span>
                        <span className="text-xs font-bold text-slate-700 font-mono block">{activePlan.id}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Progress percent bar */}
                  <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Progress</span>
                      <span className="font-extrabold text-emerald-700">{progressPct}%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-[#2D6A4F] h-3 rounded-full transition-all duration-700"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-450 block font-semibold text-center">
                        ₱{totalPaid.toLocaleString()} paid of ₱{totalAmount.toLocaleString()} contract
                      </span>
                    </div>
                  </Card>
                </div>

                {/* Right side: installment dues & payout ledger log */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Schedule list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Active Installments Schedule</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activePlan.paluwaganSchedule?.map((item) => {
                        const isPaid = item.status === "Paid";
                        const isOverdue = item.status === "Overdue" || (!isPaid && new Date(item.dueDate) < new Date());
                        const isNext = !isPaid && activePlan.nextDueDate === item.dueDate;

                        return (
                          <Card key={item.installmentNumber} className="p-4 bg-white border border-slate-200/60 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-[#1B4332]">Installment #{item.installmentNumber}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-extrabold uppercase border ${
                                isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                isOverdue ? "bg-rose-50 text-rose-700 border-rose-200" :
                                isNext ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse font-bold" :
                                "bg-slate-50 text-slate-500 border-slate-200"
                              }`}>
                                {isPaid ? "Paid" : isOverdue ? "Overdue" : isNext ? "Upcoming" : "Pending"}
                              </span>
                            </div>

                            <div className="flex justify-between items-baseline border-t border-slate-100 pt-3 text-xs">
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Amount Due</span>
                                <span className="font-extrabold text-slate-800 text-sm">₱{item.amountDue.toLocaleString()}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Due Date</span>
                                <span className="font-bold text-slate-700 font-mono">{item.dueDate}</span>
                              </div>
                            </div>

                            {isPaid && (
                              <div className="text-[9.5px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Paid on {item.paymentDate || "N/A"} via {item.collector || " Elena Delmar"} (OR: {item.receiptNumber})</span>
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment history table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Recent Ledger History</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px]">Receipt OR</TableHead>
                          <TableHead className="text-[10px]">Date</TableHead>
                          <TableHead className="text-[10px]">Type</TableHead>
                          <TableHead className="text-[10px] text-right">Amount Paid</TableHead>
                          <TableHead className="text-[10px] text-right">Remaining Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Receipt className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {row.receiptNumber}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-slate-600 font-mono">{row.date}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase border ${
                                row.type === "Down Payment"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}>
                                {row.type}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-xs font-extrabold text-slate-800 font-mono">
                              ₱{row.amountPaid.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-xs font-extrabold text-slate-800 font-mono bg-slate-50/50">
                              ₱{row.remainingBalanceAfter.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              // Approved member but NO active Paluwagan plan yet
              <Card className="p-8 text-center bg-white border border-slate-200/60 rounded-3xl shadow-sm max-w-xl mx-auto space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Coins className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-800">You are ready to book!</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    You have active **Paluwagan Membership status**! You can now place Paluwagan installment orders for **Crispylicious Lechon** directly from your Reservations portal or dashboard.
                  </p>
                </div>
                <Link href="/customer/reservations">
                  <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    Go to Reservations Hub
                  </Button>
                </Link>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
