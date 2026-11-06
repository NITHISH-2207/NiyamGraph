import React, { useState } from 'react';
import { InstitutionProfileData } from '../../../types/application';
import {
  Building2,
  MapPin,
  UserCheck,
  Mail,
  GraduationCap,
  Shield,
  AlertCircle,
  Edit3,
  X,
  Send,
} from 'lucide-react';

interface InstitutionProfileSectionProps {
  profile: InstitutionProfileData;
  isConfirmed: boolean;
  onToggleConfirm: () => void;
  correctionNotes: string;
  onRequestCorrection: (notes: string) => void;
}

export const InstitutionProfileSection: React.FC<InstitutionProfileSectionProps> = ({
  profile,
  isConfirmed,
  onToggleConfirm,
  correctionNotes,
  onRequestCorrection,
}) => {
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [draftNote, setDraftNote] = useState(correctionNotes);
  const [correctionSubmitted, setCorrectionSubmitted] = useState(Boolean(correctionNotes));

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestCorrection(draftNote);
    setCorrectionSubmitted(true);
    setShowCorrectionModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Official Institutional Profile
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Verified master records sourced from the statutory AICTE registry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-600" />
              Verified Registry Record
            </span>

            <button
              type="button"
              onClick={() => setShowCorrectionModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Request Profile Correction</span>
            </button>
          </div>
        </div>

        {/* Correction Submitted Banner */}
        {correctionSubmitted && (
          <div className="mb-5 p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Correction Note Recorded</span>
              <p className="text-slate-700 leading-relaxed italic">
                &ldquo;{correctionNotes}&rdquo;
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Your request has been attached to this draft for scrutiny officer reference. Official registry data remains unchanged.
              </span>
            </div>
          </div>
        )}

        {/* Profile Attributes Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Institution Identity */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2">
              <Building2 className="w-4 h-4 text-brand-blue" />
              <span>Institution Identity</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Official Name
                </span>
                <span className="font-semibold text-slate-900 block leading-snug">
                  {profile.officialName}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    Permanent ID (PID)
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {profile.identifier}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    Established Year
                  </span>
                  <span className="font-medium text-slate-800">
                    {profile.establishmentYear}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Category & Ownership
                </span>
                <span className="font-medium text-slate-800">
                  {profile.institutionType} &bull; {profile.ownershipCategory}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Campus Address & Location */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2">
              <MapPin className="w-4 h-4 text-brand-blue" />
              <span>Campus Address</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Registered Address
                </span>
                <span className="text-slate-800 block leading-relaxed">
                  {profile.address}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    District
                  </span>
                  <span className="font-medium text-slate-800 truncate block">
                    {profile.district}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    State
                  </span>
                  <span className="font-medium text-slate-800 truncate block">
                    {profile.state}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    Pincode
                  </span>
                  <span className="font-mono text-slate-800">{profile.pincode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Trust / Society Management */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2">
              <Shield className="w-4 h-4 text-brand-blue" />
              <span>Trust / Society Management</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Sponsoring Body Name
                </span>
                <span className="font-semibold text-slate-900 block leading-snug">
                  {profile.trustOrSociety}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Registration Number
                </span>
                <span className="font-mono text-slate-800">
                  {profile.trustRegistrationNo}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Institution Leadership */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2">
              <UserCheck className="w-4 h-4 text-brand-blue" />
              <span>Institutional Leadership</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Principal / Director
                </span>
                <span className="font-semibold text-slate-900 block">
                  {profile.principalName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Designation
                </span>
                <span className="text-slate-700">{profile.principalDesignation}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Official Contact Info */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2">
              <Mail className="w-4 h-4 text-brand-blue" />
              <span>Official Communications</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Authorized Nodal Email
                </span>
                <span className="font-mono text-brand-blue truncate block">
                  {profile.officialEmail}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Contact Phone
                </span>
                <span className="font-mono text-slate-800">{profile.registeredPhone}</span>
              </div>
            </div>
          </div>

          {/* Card 6: Affiliation & Jurisdiction */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2">
              <GraduationCap className="w-4 h-4 text-brand-blue" />
              <span>Regulatory Jurisdiction</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Affiliating University
                </span>
                <span className="font-semibold text-slate-900 block leading-snug">
                  {profile.affiliatingUniversity}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Regional Office
                </span>
                <span className="text-slate-800">{profile.regionalOffice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Confirmation Checkbox */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-3 bg-slate-50/80 p-4 rounded-lg border border-slate-200">
          <input
            id="confirm-profile-checkbox"
            type="checkbox"
            checked={isConfirmed}
            onChange={onToggleConfirm}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue shrink-0 cursor-pointer"
          />
          <label
            htmlFor="confirm-profile-checkbox"
            className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none"
          >
            <strong>Official Profile Verification Acknowledgement:</strong> I confirm that I have reviewed the official institution details, address, management, leadership, and affiliation records above. If any permanent record is inaccurate, I have submitted a profile correction request note.
          </label>
        </div>
      </div>

      {/* Request Correction Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Edit3 className="w-4 h-4 text-brand-blue" />
                <span>Request Institution Profile Correction</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close correction dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Official institutional records (Name, PID, Trust, Address, Affiliation) are protected registry fields. Enter details of the discrepancy below. This note will be recorded alongside your EoA application for scrutiny review.
            </p>

            <form onSubmit={handleSaveCorrection} className="space-y-4">
              <div>
                <label
                  htmlFor="correction-note-input"
                  className="text-xs font-semibold text-slate-700 block mb-1"
                >
                  Correction Details & Discrepancy Description:
                </label>
                <textarea
                  id="correction-note-input"
                  rows={4}
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder="e.g. Registered address has been re-numbered by municipal corporation, please update building number..."
                  className="w-full text-xs p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-3.5 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue-hover transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Attach Correction Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
