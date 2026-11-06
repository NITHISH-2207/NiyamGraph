import React, { useState } from 'react';
import { FieldResponse, DisclosureGroupId, DisclosureGroupDef, DisclosureFieldDef } from '../../../types/application';
import { DISCLOSURE_GROUPS, EOA_RULESET_INFO } from '../../../data/eoaDevelopmentFixtures';
import {
  Users,
  Building,
  FlaskConical,
  BookOpen,
  Presentation,
  Coffee,
  ShieldAlert,
  FileCheck,
  Check,
  X,
  Minus,
} from 'lucide-react';

interface SelfDisclosureSectionProps {
  responses: Record<string, FieldResponse>;
  onSetFieldResponse: (
    fieldId: string,
    updates: Partial<FieldResponse>
  ) => void;
}

export const SelfDisclosureSection: React.FC<SelfDisclosureSectionProps> = ({
  responses,
  onSetFieldResponse,
}) => {
  const [activeGroupId, setActiveGroupId] = useState<DisclosureGroupId>('group-a-faculty');

  const groupIcons: Record<DisclosureGroupId, React.ReactNode> = {
    'group-a-faculty': <Users className="w-4 h-4" />,
    'group-b-infrastructure': <Building className="w-4 h-4" />,
    'group-c-laboratories': <FlaskConical className="w-4 h-4" />,
    'group-d-library': <BookOpen className="w-4 h-4" />,
    'group-e-classrooms': <Presentation className="w-4 h-4" />,
    'group-f-amenities': <Coffee className="w-4 h-4" />,
    'group-g-safety': <ShieldAlert className="w-4 h-4" />,
    'group-h-other': <FileCheck className="w-4 h-4" />,
  };

  const activeGroup =
    DISCLOSURE_GROUPS.find((g: DisclosureGroupDef) => g.id === activeGroupId) || DISCLOSURE_GROUPS[0];

  return (
    <div className="space-y-6">
      {/* Header & Sub-Nav Description */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Institutional Self-Disclosure
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Statutory disclosures categorized under Groups A through H. Responses form the basis of regulatory self-certification.
              </p>
            </div>

            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              Ruleset: {EOA_RULESET_INFO.version}
            </span>
          </div>
        </div>

        {/* Group Sub-Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {DISCLOSURE_GROUPS.map((group: DisclosureGroupDef) => {
            const isActive = group.id === activeGroupId;
            const groupAnswered = group.fields.every(
              (f: DisclosureFieldDef) => responses[f.id]?.status !== 'Not Answered'
            );

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroupId(group.id)}
                className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[70px] ${
                  isActive
                    ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                    : groupAnswered
                    ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 text-slate-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>
                    {groupIcons[group.id]}
                  </span>
                  {groupAnswered && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-emerald-300' : 'bg-emerald-600'
                      }`}
                      title="Group answered"
                    />
                  )}
                </div>

                <div>
                  <span
                    className={`text-[10px] font-bold block uppercase tracking-wider ${
                      isActive ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {group.code}
                  </span>
                  <span
                    className={`text-xs font-semibold block leading-tight truncate ${
                      isActive ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {group.title.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Group Content */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {activeGroup.code} &mdash; {activeGroup.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeGroup.description}</p>
            </div>

            <span className="text-xs font-medium text-slate-500">
              {activeGroup.fields.length} Declaration Items
            </span>
          </div>

          {/* Fields List */}
          <div className="space-y-4">
            {activeGroup.fields.map((field: DisclosureFieldDef, idx: number) => {
              const res = responses[field.id] || {
                answer: null,
                quantity: '',
                remarks: '',
                evidenceRef: '',
                status: 'Not Answered',
              };

              return (
                <div
                  key={field.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400 mt-0.5 shrink-0">
                          {idx + 1}.
                        </span>
                        <p className="text-xs font-semibold text-slate-900 leading-snug">
                          {field.label}
                        </p>
                      </div>
                      {field.description && (
                        <p className="text-[11px] text-slate-500 pl-5">
                          {field.description}
                        </p>
                      )}
                    </div>

                    {/* Response Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 pl-5 sm:pl-0">
                      <button
                        type="button"
                        onClick={() =>
                          onSetFieldResponse(field.id, {
                            answer: res.answer === 'Yes' ? null : 'Yes',
                          })
                        }
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                          res.answer === 'Yes'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Yes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onSetFieldResponse(field.id, {
                            answer: res.answer === 'No' ? null : 'No',
                          })
                        }
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                          res.answer === 'No'
                            ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>No</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onSetFieldResponse(field.id, {
                            answer: res.answer === 'Not Applicable' ? null : 'Not Applicable',
                          })
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                          res.answer === 'Not Applicable'
                            ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>N/A</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity and Supplementary Details Row */}
                  {(field.hasQuantity || field.requiresEvidenceRef || res.answer === 'No') && (
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {field.hasQuantity && (
                        <div>
                          <label
                            htmlFor={`qty-${field.id}`}
                            className="text-[10px] uppercase font-semibold text-slate-500 block mb-1"
                          >
                            {field.quantityLabel || 'Measured Quantity'}{' '}
                            {field.quantityUnit ? `(${field.quantityUnit})` : ''}
                          </label>
                          <input
                            id={`qty-${field.id}`}
                            type="text"
                            value={res.quantity || ''}
                            onChange={(e) =>
                              onSetFieldResponse(field.id, { quantity: e.target.value })
                            }
                            placeholder="Enter count / measurement"
                            className="w-full text-xs p-2 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                          />
                        </div>
                      )}

                      {field.requiresEvidenceRef && (
                        <div>
                          <label
                            htmlFor={`ev-${field.id}`}
                            className="text-[10px] uppercase font-semibold text-slate-500 block mb-1"
                          >
                            Supporting Document Ref
                          </label>
                          <input
                            id={`ev-${field.id}`}
                            type="text"
                            value={res.evidenceRef || ''}
                            onChange={(e) =>
                              onSetFieldResponse(field.id, { evidenceRef: e.target.value })
                            }
                            placeholder="e.g. Doc Ref / File Checklist ID"
                            className="w-full text-xs p-2 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                          />
                        </div>
                      )}

                      <div className={field.hasQuantity || field.requiresEvidenceRef ? '' : 'sm:col-span-3'}>
                        <label
                          htmlFor={`rem-${field.id}`}
                          className="text-[10px] uppercase font-semibold text-slate-500 block mb-1"
                        >
                          Remarks / Clarification Note
                        </label>
                        <input
                          id={`rem-${field.id}`}
                          type="text"
                          value={res.remarks || ''}
                          onChange={(e) =>
                            onSetFieldResponse(field.id, { remarks: e.target.value })
                          }
                          placeholder="Optional institutional remarks"
                          className="w-full text-xs p-2 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Indicator Bar */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    <span className="flex items-center gap-1.5">
                      Status:
                      <span
                        className={`font-semibold ${
                          res.status === 'Compliant'
                            ? 'text-emerald-700'
                            : res.status === 'Non-Compliant'
                            ? 'text-red-700'
                            : res.status === 'Not Applicable'
                            ? 'text-slate-600'
                            : 'text-amber-700'
                        }`}
                      >
                        {res.status}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
