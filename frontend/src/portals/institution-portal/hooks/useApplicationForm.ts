import { useState, useCallback, useMemo } from 'react';
import {
  InstitutionProfileData,
  ApprovedProgramme,
  DocumentChecklistItem,
  FieldResponse,
  StatutoryDeclaration,
  ValidationIssue,
  ProgrammeConfirmationStatus,
} from '../types/application';
import {
  APPLICATION_SECTIONS,
  INITIAL_INSTITUTION_PROFILE,
  INITIAL_APPROVED_PROGRAMMES,
  DISCLOSURE_GROUPS,
  INITIAL_DOCUMENT_CHECKLIST,
  EOA_RULESET_INFO,
} from '../data/eoaDevelopmentFixtures';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
export type WorkspaceState = 'landing' | 'workspace' | 'submitted';

export function useApplicationForm() {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>('landing');
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(1);
  const [highestSectionIndex, setHighestSectionIndex] = useState<number>(1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());

  // Application metadata
  const applicationMeta = useMemo(
    () => ({
      referenceNumber: 'NG-2026-AP-8941',
      category: EOA_RULESET_INFO.category,
      academicYear: EOA_RULESET_INFO.academicYear,
      status: workspaceState === 'submitted' ? ('Submitted' as const) : ('Draft' as const),
      rulesetVersion: EOA_RULESET_INFO.version,
    }),
    [workspaceState]
  );

  // Section 2: Institution Profile
  const [institutionProfile] = useState<InstitutionProfileData>(
    INITIAL_INSTITUTION_PROFILE
  );
  const [isProfileConfirmed, setIsProfileConfirmed] = useState<boolean>(false);
  const [profileCorrectionNotes, setProfileCorrectionNotes] = useState<string>('');

  // Section 3: Approved Programmes
  const [programmes, setProgrammes] = useState<ApprovedProgramme[]>(INITIAL_APPROVED_PROGRAMMES);

  // Section 4: Self-Disclosure responses
  const [disclosureResponses, setDisclosureResponses] = useState<Record<string, FieldResponse>>(() => {
    const initial: Record<string, FieldResponse> = {};
    DISCLOSURE_GROUPS.forEach((g) => {
      g.fields.forEach((f) => {
        initial[f.id] = {
          answer: null,
          quantity: '',
          remarks: '',
          evidenceRef: '',
          status: 'Not Answered',
        };
      });
    });
    return initial;
  });

  // Section 5: Documents
  const [documents, setDocuments] = useState<DocumentChecklistItem[]>(INITIAL_DOCUMENT_CHECKLIST);

  // Section 6: Declaration
  const [declaration, setDeclaration] = useState<StatutoryDeclaration>({
    accepted: false,
    adminName: INITIAL_INSTITUTION_PROFILE.principalName,
    adminDesignation: INITIAL_INSTITUTION_PROFILE.principalDesignation,
  });

  // Trigger simulated save state indicator on change
  const triggerAutoSave = useCallback(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Section navigation
  const goToSection = useCallback(
    (index: number) => {
      if (index >= 1 && index <= 6) {
        setCurrentSectionIndex(index);
        setHighestSectionIndex((prev) => Math.max(prev, index));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  const nextSection = useCallback(() => {
    goToSection(currentSectionIndex + 1);
  }, [currentSectionIndex, goToSection]);

  const prevSection = useCallback(() => {
    goToSection(currentSectionIndex - 1);
  }, [currentSectionIndex, goToSection]);

  const manualSaveDraft = useCallback(() => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    }, 400);
  }, []);

  // Section 2 handlers
  const toggleConfirmProfile = useCallback(() => {
    setIsProfileConfirmed((prev) => !prev);
    triggerAutoSave();
  }, [triggerAutoSave]);

  const recordProfileCorrection = useCallback(
    (notes: string) => {
      setProfileCorrectionNotes(notes);
      triggerAutoSave();
    },
    [triggerAutoSave]
  );

  // Section 3 handlers
  const updateProgrammeConfirmation = useCallback(
    (id: string, status: ProgrammeConfirmationStatus, remarks?: string) => {
      setProgrammes((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                confirmationStatus: status,
                reportedIssueRemarks: remarks,
              }
            : p
        )
      );
      triggerAutoSave();
    },
    [triggerAutoSave]
  );

  const confirmAllProgrammes = useCallback(() => {
    setProgrammes((prev) =>
      prev.map((p) => ({
        ...p,
        confirmationStatus: 'Confirmed',
      }))
    );
    triggerAutoSave();
  }, [triggerAutoSave]);

  // Section 4 handlers
  const setFieldResponse = useCallback(
    (
      fieldId: string,
      updates: Partial<FieldResponse>
    ) => {
      setDisclosureResponses((prev) => {
        const current = prev[fieldId] || {
          answer: null,
          quantity: '',
          remarks: '',
          evidenceRef: '',
          status: 'Not Answered',
        };

        const updated: FieldResponse = { ...current, ...updates };

        // Determine statutory compliance state
        if (updated.answer === 'Yes') {
          updated.status = 'Compliant';
        } else if (updated.answer === 'No') {
          updated.status = 'Non-Compliant';
        } else if (updated.answer === 'Not Applicable') {
          updated.status = 'Not Applicable';
        } else {
          updated.status = 'Not Answered';
        }

        return { ...prev, [fieldId]: updated };
      });
      triggerAutoSave();
    },
    [triggerAutoSave]
  );

  // Section 5 handlers
  const uploadDocumentMock = useCallback(
    (docId: string, file: File) => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: 'Uploaded',
                uploadedFileName: file.name,
                fileSizeBytes: file.size,
                uploadedAt: new Date().toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                mimeType: file.type || 'application/pdf',
                previewUrl: URL.createObjectURL(file),
              }
            : d
        )
      );
      triggerAutoSave();
    },
    [triggerAutoSave]
  );

  const removeDocument = useCallback(
    (docId: string) => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: d.isMandatory ? 'Required' : 'Not Uploaded',
                uploadedFileName: undefined,
                fileSizeBytes: undefined,
                uploadedAt: undefined,
                previewUrl: undefined,
              }
            : d
        )
      );
      triggerAutoSave();
    },
    [triggerAutoSave]
  );

  // Section 6 handlers
  const updateDeclaration = useCallback(
    (updates: Partial<StatutoryDeclaration>) => {
      setDeclaration((prev) => ({ ...prev, ...updates }));
      triggerAutoSave();
    },
    [triggerAutoSave]
  );

  // Validation Engine
  const validationIssues = useMemo<ValidationIssue[]>(() => {
    const issues: ValidationIssue[] = [];

    // Section 2
    if (!isProfileConfirmed) {
      issues.push({
        sectionId: 'institution-profile',
        sectionTitle: 'Institution Profile',
        message: 'Institution profile information must be reviewed and confirmed.',
        severity: 'warning',
      });
    }

    // Section 3
    const unconfirmedProgs = programmes.filter((p) => p.confirmationStatus === 'Pending Confirmation');
    if (unconfirmedProgs.length > 0) {
      issues.push({
        sectionId: 'approved-programmes',
        sectionTitle: 'Approved Programmes',
        message: `${unconfirmedProgs.length} programme(s) are pending review and confirmation.`,
        severity: 'error',
      });
    }

    // Section 4
    let unansweredCount = 0;
    Object.values(disclosureResponses).forEach((resp) => {
      if (resp.status === 'Not Answered') unansweredCount++;
    });
    if (unansweredCount > 0) {
      issues.push({
        sectionId: 'self-disclosure',
        sectionTitle: 'Institutional Self-Disclosure',
        message: `${unansweredCount} declaration item(s) are pending response.`,
        severity: 'warning',
      });
    }

    // Section 5
    const mandatoryMissing = documents.filter((d) => d.isMandatory && d.status !== 'Uploaded');
    if (mandatoryMissing.length > 0) {
      issues.push({
        sectionId: 'document-checklist',
        sectionTitle: 'Document Checklist',
        message: `${mandatoryMissing.length} mandatory document(s) must be uploaded before submission.`,
        severity: 'error',
      });
    }

    // Section 6
    if (!declaration.accepted) {
      issues.push({
        sectionId: 'review-submit',
        sectionTitle: 'Review & Submit',
        message: 'Statutory declaration and authenticity acknowledgement must be checked.',
        severity: 'error',
      });
    }
    if (!declaration.adminName.trim() || !declaration.adminDesignation.trim()) {
      issues.push({
        sectionId: 'review-submit',
        sectionTitle: 'Review & Submit',
        message: 'Signatory Admin name and designation are required.',
        severity: 'error',
      });
    }

    return issues;
  }, [isProfileConfirmed, programmes, disclosureResponses, documents, declaration]);

  // Completion calculation
  const sectionCompletionStatus = useMemo(() => {
    return {
      'app-info': true,
      'institution-profile': isProfileConfirmed,
      'approved-programmes': programmes.every((p) => p.confirmationStatus !== 'Pending Confirmation'),
      'self-disclosure': Object.values(disclosureResponses).every((r) => r.status !== 'Not Answered'),
      'document-checklist': documents.filter((d) => d.isMandatory).every((d) => d.status === 'Uploaded'),
      'review-submit': declaration.accepted && Boolean(declaration.adminName && declaration.adminDesignation),
    };
  }, [isProfileConfirmed, programmes, disclosureResponses, documents, declaration]);

  const completedSectionsCount = useMemo(() => {
    return Object.values(sectionCompletionStatus).filter(Boolean).length;
  }, [sectionCompletionStatus]);

  const overallProgressPercent = useMemo(() => {
    return Math.round((completedSectionsCount / 6) * 100);
  }, [completedSectionsCount]);

  const canSubmit = useMemo(() => {
    return (
      validationIssues.filter((i) => i.severity === 'error').length === 0 &&
      declaration.accepted &&
      Boolean(declaration.adminName.trim())
    );
  }, [validationIssues, declaration]);

  const submitApplication = useCallback(() => {
    setWorkspaceState('submitted');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    workspaceState,
    setWorkspaceState,
    currentSectionIndex,
    highestSectionIndex,
    currentSectionMeta: APPLICATION_SECTIONS[currentSectionIndex - 1],
    sections: APPLICATION_SECTIONS,
    saveStatus,
    lastSavedAt,
    applicationMeta,

    // Form data & states
    institutionProfile,
    isProfileConfirmed,
    profileCorrectionNotes,
    toggleConfirmProfile,
    recordProfileCorrection,

    programmes,
    updateProgrammeConfirmation,
    confirmAllProgrammes,

    disclosureResponses,
    setFieldResponse,

    documents,
    uploadDocumentMock,
    removeDocument,

    declaration,
    updateDeclaration,

    // Navigation & Actions
    goToSection,
    nextSection,
    prevSection,
    manualSaveDraft,

    // Validations & Progress
    validationIssues,
    sectionCompletionStatus,
    completedSectionsCount,
    overallProgressPercent,
    canSubmit,
    submitApplication,
  };
}
