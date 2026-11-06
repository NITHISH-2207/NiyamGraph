import {
  InstitutionProfileData,
  ApprovedProgramme,
  DisclosureGroupDef,
  DocumentChecklistItem,
  SectionMeta,
} from '../types/application';

export const EOA_RULESET_INFO = {
  version: 'DEV-ONLY-2026-27',
  label: 'Development Ruleset (Preview)',
  notice:
    'Development ruleset active for testing workflow interactions. Official APH 2026-27 statutory ruleset will be enforced by AICTE backend in production.',
  academicYear: '2026-27',
  category: 'Extension of Approval (EoA) – Self-Disclosure',
};

export const APPLICATION_SECTIONS: SectionMeta[] = [
  {
    id: 'app-info',
    index: 1,
    title: 'Application Information',
    shortTitle: '1. Information',
    description: 'Verify category, regulatory scope, and unique application reference.',
  },
  {
    id: 'institution-profile',
    index: 2,
    title: 'Institution Profile',
    shortTitle: '2. Profile',
    description: 'Review official registry records and request corrections if required.',
  },
  {
    id: 'approved-programmes',
    index: 3,
    title: 'Approved Programmes',
    shortTitle: '3. Programmes',
    description: 'Confirm current approved courses, levels, and historical intake.',
  },
  {
    id: 'self-disclosure',
    index: 4,
    title: 'Institutional Self-Disclosure',
    shortTitle: '4. Self-Disclosure',
    description: 'Disclose faculty, infrastructure, safety, and operational amenities.',
  },
  {
    id: 'document-checklist',
    index: 5,
    title: 'Document Checklist',
    shortTitle: '5. Documents',
    description: 'Upload required affidavits, NOCs, and statutory certificates.',
  },
  {
    id: 'review-submit',
    index: 6,
    title: 'Review & Submit',
    shortTitle: '6. Review & Submit',
    description: 'Consolidated compliance verification, declaration, and final submission.',
  },
];

export const INITIAL_INSTITUTION_PROFILE: InstitutionProfileData = {
  officialName: 'Apex Institute of Technology & Management',
  identifier: 'TEST-PID-1-93821094',
  institutionType: 'Engineering & Technology',
  ownershipCategory: 'Private / Self-Financed',
  establishmentYear: 2008,
  address: 'Sector 14, Regulatory Knowledge Park, Vashi',
  district: 'Mumbai Suburban',
  state: 'Maharashtra',
  pincode: '400703',
  trustOrSociety: 'Apex Educational and Charitable Foundation',
  trustRegistrationNo: 'MAH/MUM/1849/2004',
  principalName: 'Dr. Ananya Sen',
  principalDesignation: 'Director & Principal',
  officialEmail: 'principal@apex.edu.in',
  registeredPhone: '+91-22-28490192',
  affiliatingUniversity: 'University of Mumbai',
  regionalOffice: 'Western Regional Office (Mumbai)',
};

export const INITIAL_APPROVED_PROGRAMMES: ApprovedProgramme[] = [
  {
    id: 'prog-01',
    programmeLevel: 'Undergraduate',
    programmeName: 'Engineering & Technology',
    course: 'Computer Science and Engineering',
    specialization: 'Artificial Intelligence & Machine Learning',
    approvedIntake: 120,
    currentStatus: 'Active',
    previousApprovalRef: 'AICTE/WRO/2025-26/1-93821094-01',
    confirmationStatus: 'Pending Confirmation',
  },
  {
    id: 'prog-02',
    programmeLevel: 'Undergraduate',
    programmeName: 'Engineering & Technology',
    course: 'Electronics and Telecommunication Engineering',
    specialization: 'IoT and Embedded Systems',
    approvedIntake: 60,
    currentStatus: 'Active',
    previousApprovalRef: 'AICTE/WRO/2025-26/1-93821094-02',
    confirmationStatus: 'Pending Confirmation',
  },
  {
    id: 'prog-03',
    programmeLevel: 'Postgraduate',
    programmeName: 'Management',
    course: 'Master of Business Administration (MBA)',
    specialization: 'Information Technology & Finance',
    approvedIntake: 60,
    currentStatus: 'Active',
    previousApprovalRef: 'AICTE/WRO/2025-26/1-93821094-03',
    confirmationStatus: 'Pending Confirmation',
  },
  {
    id: 'prog-04',
    programmeLevel: 'Undergraduate',
    programmeName: 'Engineering & Technology',
    course: 'Mechanical Engineering',
    specialization: 'Automated Manufacturing',
    approvedIntake: 60,
    currentStatus: 'Active',
    previousApprovalRef: 'AICTE/WRO/2025-26/1-93821094-04',
    confirmationStatus: 'Pending Confirmation',
  },
];

export const DISCLOSURE_GROUPS: DisclosureGroupDef[] = [
  {
    id: 'group-a-faculty',
    code: 'Group A',
    title: 'Faculty and Staff',
    description: 'Cadre ratio compliance, full-time regular faculty, and qualification norms.',
    fields: [
      {
        id: 'fac-01',
        label: 'Statutory Student-to-Faculty Ratio (SFR) of 1:20 maintained across UG programmes',
        description: 'Verify sanctioned strength against actual regular faculty on payroll.',
        hasQuantity: true,
        quantityLabel: 'Regular Faculty Strength',
        quantityUnit: 'Faculty Members',
        requiresEvidenceRef: true,
      },
      {
        id: 'fac-02',
        label: 'Principal / Director appointed as per AICTE cadre norms and approved by Affiliating University',
        description: 'Confirm regular appointment order and qualification eligibility.',
        requiresEvidenceRef: true,
      },
      {
        id: 'fac-03',
        label: 'Implementation of 7th Central Pay Commission scales for approved teaching staff',
        description: 'Mandatory statutory compensation norm for technical institutions.',
      },
      {
        id: 'fac-04',
        label: 'Adequate technical, laboratory and administrative support staff deployed',
        hasQuantity: true,
        quantityLabel: 'Non-Teaching / Technical Staff Count',
        quantityUnit: 'Staff',
      },
    ],
  },
  {
    id: 'group-b-infrastructure',
    code: 'Group B',
    title: 'Infrastructure',
    description: 'Land area, total carpet area, barrier-free access, and building safety.',
    fields: [
      {
        id: 'inf-01',
        label: 'Total contiguous campus land area meets prescribed zonal regulations',
        description: 'Check land ownership/lease deed validity and land classification.',
        hasQuantity: true,
        quantityLabel: 'Contiguous Campus Area',
        quantityUnit: 'Acres',
        requiresEvidenceRef: true,
      },
      {
        id: 'inf-02',
        label: 'Total instructional and administrative built-up carpet area constructed',
        description: 'Area certified by licensed architect / municipal authority.',
        hasQuantity: true,
        quantityLabel: 'Total Built-up Area',
        quantityUnit: 'sq. meters',
        requiresEvidenceRef: true,
      },
      {
        id: 'inf-03',
        label: 'Barrier-free environment provided for persons with disabilities (Divyangjan)',
        description: 'Ramps, accessible toilets, lifts, and tactile walkways.',
      },
    ],
  },
  {
    id: 'group-c-laboratories',
    code: 'Group C',
    title: 'Laboratories and Equipment',
    description: 'Departmental laboratories, major equipment, safety gear, and consumables.',
    fields: [
      {
        id: 'lab-01',
        label: 'Prescribed syllabus laboratories operational with adequate equipment kits',
        description: 'Operational labs matching curriculum specifications.',
        hasQuantity: true,
        quantityLabel: 'Operational Labs Count',
        quantityUnit: 'Laboratories',
      },
      {
        id: 'lab-02',
        label: 'Language communication laboratory established with multimedia workstations',
        description: 'Mandatory English and communication skills development lab.',
        hasQuantity: true,
        quantityLabel: 'Workstation Terminals',
        quantityUnit: 'Terminals',
      },
      {
        id: 'lab-03',
        label: 'Laboratory safety protocols, eye-wash stations, and first-aid kits installed',
      },
    ],
  },
  {
    id: 'group-d-library',
    code: 'Group D',
    title: 'Library and Learning Resources',
    description: 'Book titles, volumes, national/international e-journals, and digital terminals.',
    fields: [
      {
        id: 'lib-01',
        label: 'Central Library stocked with required book titles and volumes per course',
        hasQuantity: true,
        quantityLabel: 'Total Book Volumes',
        quantityUnit: 'Volumes',
      },
      {
        id: 'lib-02',
        label: 'Active institutional subscription to National Digital Library (NDLI) and e-journals',
        requiresEvidenceRef: true,
      },
      {
        id: 'lib-03',
        label: 'Digital Library facility equipped with high-speed internet terminals',
        hasQuantity: true,
        quantityLabel: 'Multimedia Terminals',
        quantityUnit: 'PCs',
      },
    ],
  },
  {
    id: 'group-e-classrooms',
    code: 'Group E',
    title: 'Classrooms and Instructional Facilities',
    description: 'Classrooms, tutorial rooms, seminar halls, and ICT projection facilities.',
    fields: [
      {
        id: 'cls-01',
        label: 'Adequate number of lecture classrooms equipped with LCD/smart-boards',
        hasQuantity: true,
        quantityLabel: 'Smart Classrooms',
        quantityUnit: 'Rooms',
      },
      {
        id: 'cls-02',
        label: 'Central air-conditioned seminar halls and auditorium available for academic conferences',
        hasQuantity: true,
        quantityLabel: 'Seminar Halls Count',
        quantityUnit: 'Halls',
      },
    ],
  },
  {
    id: 'group-f-amenities',
    code: 'Group F',
    title: 'Student Amenities',
    description: 'Separate common rooms, cafeteria, drinking water facilities, and medical care.',
    fields: [
      {
        id: 'amn-01',
        label: 'Separate boys and girls common rooms with hygienic sanitary facilities',
      },
      {
        id: 'amn-02',
        label: 'Campus health centre with on-duty nursing staff and tie-up with local hospital',
      },
      {
        id: 'amn-03',
        label: 'Hygienic canteen / dining facility catering to students and faculty',
      },
    ],
  },
  {
    id: 'group-g-safety',
    code: 'Group G',
    title: 'Safety and Statutory Compliance',
    description: 'Fire safety NOC, Anti-Ragging committee, and Internal Complaints Committee.',
    fields: [
      {
        id: 'saf-01',
        label: 'Valid Fire Safety Certificate / No Objection Certificate (NOC) issued by competent Fire Authority',
        description: 'Must remain valid throughout the academic session 2026-27.',
        requiresEvidenceRef: true,
      },
      {
        id: 'saf-02',
        label: 'Statutory Anti-Ragging Committee and Squad constituted as per Supreme Court / AICTE directives',
      },
      {
        id: 'saf-03',
        label: 'Internal Complaints Committee (ICC) constituted for prevention of sexual harassment',
      },
      {
        id: 'saf-04',
        label: 'Online Grievance Redressal Mechanism (GRM) operational on institutional website',
      },
    ],
  },
  {
    id: 'group-h-other',
    code: 'Group H',
    title: 'Other Applicable Declarations',
    description: 'Mandatory website disclosure, accreditation status, and regulatory declarations.',
    fields: [
      {
        id: 'oth-01',
        label: 'Mandatory Disclosure updated and publicly accessible on institutional website',
        description: 'Must include faculty lists, fees, fee regulatory committee orders, and admissions.',
      },
      {
        id: 'oth-02',
        label: 'Institution has verified all statutory fee dues to AICTE and regulatory councils',
      },
    ],
  },
];

export const INITIAL_DOCUMENT_CHECKLIST: DocumentChecklistItem[] = [
  {
    id: 'doc-01',
    code: 'AFFIDAVIT_2',
    name: 'Affidavit 2 (Self-Disclosure)',
    description:
      'Duly executed affidavit on non-judicial stamp paper confirming compliance with AICTE norms, faculty scales, and land ownership.',
    isMandatory: true,
    status: 'Required',
  },
  {
    id: 'doc-02',
    code: 'FIRE_NOC',
    name: 'Fire Safety Certificate / NOC',
    description:
      'Valid Fire Safety NOC issued by the Municipal Fire Department or State Fire Authority covering all campus buildings.',
    isMandatory: true,
    conditionNote: 'Mandatory for all technical institutions without exception.',
    status: 'Required',
  },
  {
    id: 'doc-03',
    code: 'OCCUPANCY_CERT',
    name: 'Occupancy / Completion Certificate (Form D)',
    description:
      'Occupancy Certificate or Building Licence issued by the Competent Authority permitting educational operations.',
    isMandatory: true,
    status: 'Required',
  },
  {
    id: 'doc-04',
    code: 'STRUCTURAL_STABILITY',
    name: 'Structural Stability Certificate',
    description:
      'Certificate issued by registered Structural Engineer confirming building safety against earthquake and cyclone norms.',
    isMandatory: true,
    conditionNote: 'Required for all permanent structures older than 3 years.',
    status: 'Required',
  },
  {
    id: 'doc-05',
    code: 'SATELLITE_GEO_MAP',
    name: 'Satellite Map with Geographic Coordinates',
    description:
      'Satellite image displaying clear campus boundary demarcation with verified latitude and longitude coordinates.',
    isMandatory: true,
    status: 'Required',
  },
  {
    id: 'doc-06',
    code: 'PAYMENT_RECEIPT',
    name: 'AICTE Application / Processing Fee Receipt',
    description:
      'Official bank receipt / portal transaction challan demonstrating regulatory fee clearance for AY 2026-27.',
    isMandatory: true,
    conditionNote: 'Exempt for 100% Government technical institutions.',
    status: 'Required',
  },
  {
    id: 'doc-07',
    code: 'AUDITED_ACCOUNTS',
    name: 'Audited Statement of Accounts',
    description:
      'Chartered Accountant certified balance sheet and income/expenditure account for the preceding financial year.',
    isMandatory: false,
    conditionNote: 'Conditional: Required for Self-Financed institutions.',
    status: 'Not Uploaded',
  },
];

