import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApplicationForm } from '../hooks/useApplicationForm';
import { ApplicationHeader } from '../components/application/ApplicationHeader';
import { ApplicationStepper } from '../components/application/ApplicationStepper';
import { ApplicationProgress } from '../components/application/ApplicationProgress';
import { ApplicationFooterActions } from '../components/application/ApplicationFooterActions';
import { ApplicationInformationSection } from '../components/application/sections/ApplicationInformationSection';
import { InstitutionProfileSection } from '../components/application/sections/InstitutionProfileSection';
import { ApprovedProgrammesSection } from '../components/application/sections/ApprovedProgrammesSection';
import { SelfDisclosureSection } from '../components/application/sections/SelfDisclosureSection';
import { DocumentChecklistSection } from '../components/application/sections/DocumentChecklistSection';
import { ReviewSubmitSection } from '../components/application/sections/ReviewSubmitSection';
import { SubmissionSuccessView } from '../components/application/SubmissionSuccessView';
import {
  PlayCircle,
  ShieldAlert,
} from 'lucide-react';

export const SubmitApplicationPage: React.FC = () => {
  const { session } = useAuth();
  const isAdmin = session?.role === 'Institution Admin' || !session?.role;

  const form = useApplicationForm();

  // If in Submitted State
  if (form.workspaceState === 'submitted') {
    return (
      <SubmissionSuccessView
        referenceNumber={form.applicationMeta.referenceNumber}
        category={form.applicationMeta.category}
        academicYear={form.applicationMeta.academicYear}
        profile={form.institutionProfile}
        adminName={form.declaration.adminName}
        adminDesignation={form.declaration.adminDesignation}
      />
    );
  }

  // If in Landing State
  if (form.workspaceState === 'landing') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-2 animate-in fade-in">
        {/* Hero Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Regulatory Approval Cycle
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Academic Year 2026-27
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Extension of Approval (EoA)
              </h1>

              <p className="text-xs text-slate-600 leading-relaxed">
                Initiate your annual regulatory filing for technical programmes based on institutional self-disclosure. Complete the six guided application sections, verify historical approved intakes, attach statutory certificates, and submit for AICTE regional scrutiny.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => form.setWorkspaceState('workspace')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Start / Continue Application</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Draft in progress: <strong>{form.applicationMeta.referenceNumber}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Summary Badge Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3 shrink-0 md:w-72">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Filing Parameters
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Session:</span>
                  <span className="font-bold text-slate-800">2026-27</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Filing Mode:</span>
                  <span className="font-semibold text-slate-800">Self-Disclosure</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Form Sections:</span>
                  <span className="font-semibold text-slate-800">6 Guided Steps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Duration:</span>
                  <span className="font-semibold text-slate-800">25 &ndash; 35 mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Steps Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {form.sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs font-bold">
                  {section.index}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Step {section.index}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">{section.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {section.description}
              </p>
            </div>
          ))}
        </div>

        {/* Advisory Note */}
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Important Regulatory Advisory:</strong> This portal section processes Extension of Approval without variations. If your institution proposes an increase in approved intake, new academic levels, restructuring or course mergers, do not submit under standard EoA. Refer to AICTE Approval Process Handbook (APH) 2026-27.
          </div>
        </div>
      </div>
    );
  }

  // Active Application Workspace
  const warningsBySection: Record<string, number> = {};
  form.validationIssues.forEach((issue) => {
    warningsBySection[issue.sectionId] = (warningsBySection[issue.sectionId] || 0) + 1;
  });

  const uploadedDocs = form.documents.filter((d) => d.status === 'Uploaded').length;
  const mandatoryDocs = form.documents.filter((d) => d.isMandatory).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* 1. Header with Breadcrumb and Save Status */}
      <ApplicationHeader
        category={form.applicationMeta.category}
        academicYear={form.applicationMeta.academicYear}
        referenceNumber={form.applicationMeta.referenceNumber}
        status={form.applicationMeta.status}
        saveStatus={form.saveStatus}
        lastSavedAt={form.lastSavedAt}
        onSaveDraft={form.manualSaveDraft}
      />

      {/* 2. Interactive 6-Section Stepper */}
      <ApplicationStepper
        sections={form.sections}
        currentSectionIndex={form.currentSectionIndex}
        highestSectionIndex={form.highestSectionIndex}
        sectionCompletionStatus={form.sectionCompletionStatus}
        onSelectSection={form.goToSection}
        sectionWarningCounts={warningsBySection}
      />

      {/* 3. Readiness Progress Bar & Notice Banner */}
      <ApplicationProgress
        completedSectionsCount={form.completedSectionsCount}
        overallProgressPercent={form.overallProgressPercent}
        uploadedDocsCount={uploadedDocs}
        mandatoryDocsTotal={mandatoryDocs}
      />

      {/* 4. Active Section Form Workspace */}
      <div className="min-h-[450px]">
        {form.currentSectionIndex === 1 && (
          <ApplicationInformationSection
            category={form.applicationMeta.category}
            academicYear={form.applicationMeta.academicYear}
            referenceNumber={form.applicationMeta.referenceNumber}
            status={form.applicationMeta.status}
            rulesetVersion={form.applicationMeta.rulesetVersion}
            onContinue={form.nextSection}
          />
        )}

        {form.currentSectionIndex === 2 && (
          <InstitutionProfileSection
            profile={form.institutionProfile}
            isConfirmed={form.isProfileConfirmed}
            onToggleConfirm={form.toggleConfirmProfile}
            correctionNotes={form.profileCorrectionNotes}
            onRequestCorrection={form.recordProfileCorrection}
          />
        )}

        {form.currentSectionIndex === 3 && (
          <ApprovedProgrammesSection
            programmes={form.programmes}
            onUpdateProgrammeConfirmation={form.updateProgrammeConfirmation}
            onConfirmAll={form.confirmAllProgrammes}
          />
        )}

        {form.currentSectionIndex === 4 && (
          <SelfDisclosureSection
            responses={form.disclosureResponses}
            onSetFieldResponse={form.setFieldResponse}
          />
        )}

        {form.currentSectionIndex === 5 && (
          <DocumentChecklistSection
            documents={form.documents}
            onUploadDocument={form.uploadDocumentMock}
            onRemoveDocument={form.removeDocument}
          />
        )}

        {form.currentSectionIndex === 6 && (
          <ReviewSubmitSection
            isAdmin={isAdmin}
            referenceNumber={form.applicationMeta.referenceNumber}
            category={form.applicationMeta.category}
            academicYear={form.applicationMeta.academicYear}
            profile={form.institutionProfile}
            isProfileConfirmed={form.isProfileConfirmed}
            programmes={form.programmes}
            responses={form.disclosureResponses}
            documents={form.documents}
            declaration={form.declaration}
            onUpdateDeclaration={form.updateDeclaration}
            validationIssues={form.validationIssues}
            canSubmit={form.canSubmit}
            onGoToSection={form.goToSection}
            onSubmit={form.submitApplication}
          />
        )}
      </div>

      {/* 5. Sticky Bottom Action Toolbar */}
      <ApplicationFooterActions
        currentSectionIndex={form.currentSectionIndex}
        totalSections={6}
        onPrev={form.prevSection}
        onNext={form.nextSection}
        onSaveDraft={form.manualSaveDraft}
        onGoToReview={() => form.goToSection(6)}
      />
    </div>
  );
};
