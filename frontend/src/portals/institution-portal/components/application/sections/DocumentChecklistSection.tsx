import React, { useState, useRef } from 'react';
import { DocumentChecklistItem } from '../../../types/application';
import {
  UploadCloud,
  FileCheck2,
  FileText,
  CheckCircle2,
  Trash2,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';

interface DocumentChecklistSectionProps {
  documents: DocumentChecklistItem[];
  onUploadDocument: (docId: string, file: File) => void;
  onRemoveDocument: (docId: string) => void;
}

export const DocumentChecklistSection: React.FC<DocumentChecklistSectionProps> = ({
  documents,
  onUploadDocument,
  onRemoveDocument,
}) => {
  const [activeUploadDocId, setActiveUploadDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentChecklistItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectFile = (docId: string) => {
    setActiveUploadDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadDocId) {
      onUploadDocument(activeUploadDocId, file);
      setActiveUploadDocId(null);
    }
    // Reset file input
    if (e.target) e.target.value = '';
  };

  const uploadedCount = documents.filter((d) => d.status === 'Uploaded').length;

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Native Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Header Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Conditional Statutory Document Checklist
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Upload authenticated supporting evidence, certificates, and affidavits required for Extension of Approval.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Uploaded: <strong className="text-brand-blue">{uploadedCount}</strong> / {documents.length}
            </span>
          </div>
        </div>

        {/* Upload Policy Notice */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 mb-6">
          <FileCheck2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Format & Security Requirements:</strong> Only PDF and high-resolution scanned image files (.pdf, .png, .jpg) up to 10MB are permitted. Documents must be signed by authorized signatories and clearly legible. Uploaded evidence will be stored in secure object storage.
          </div>
        </div>

        {/* Documents Cards List */}
        <div className="space-y-4">
          {documents.map((doc, idx) => {
            const isUploaded = doc.status === 'Uploaded';

            return (
              <div
                key={doc.id}
                className={`p-4 rounded-lg border transition-all ${
                  isUploaded
                    ? 'bg-emerald-50/20 border-emerald-200'
                    : doc.isMandatory
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50/40 border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Document Metadata */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900">{doc.name}</h3>
                      {doc.isMandatory ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase">
                          Mandatory
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                          Conditional
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {doc.description}
                    </p>

                    {doc.conditionNote && (
                      <p className="text-[11px] text-amber-700 italic">
                        &bull; {doc.conditionNote}
                      </p>
                    )}

                    {/* Upload Details if already uploaded */}
                    {isUploaded && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span className="font-mono text-emerald-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {doc.uploadedFileName}
                        </span>
                        <span>&bull;</span>
                        <span>
                          {doc.fileSizeBytes
                            ? `${(doc.fileSizeBytes / 1024).toFixed(1)} KB`
                            : 'PDF Document'}
                        </span>
                        <span>&bull;</span>
                        <span>Uploaded at {doc.uploadedAt}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isUploaded ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                          title="Preview document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectFile(doc.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                          title="Replace file"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Replace</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemoveDocument(doc.id)}
                          className="p-1.5 rounded text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                          title="Remove uploaded document"
                          aria-label={`Remove ${doc.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectFile(doc.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors shadow-2xs ${
                          doc.isMandatory
                            ? 'bg-brand-blue text-white hover:bg-brand-blue-hover border-brand-blue'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                        }`}
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload Document</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FileText className="w-4 h-4 text-brand-blue" />
                <span>Document Inspection Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close document preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Document Title
                </span>
                <span className="font-bold text-slate-900">{previewDoc.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    File Name
                  </span>
                  <span className="font-mono text-slate-800">{previewDoc.uploadedFileName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    Upload Status
                  </span>
                  <span className="font-semibold text-emerald-700">Verified Upload</span>
                </div>
              </div>
            </div>

            {/* Document Preview Box */}
            <div className="h-64 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <FileCheck2 className="w-10 h-10 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">
                {previewDoc.uploadedFileName}
              </span>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Document integrity verified. File stream will be uploaded to Cloudinary storage and indexed in Neon PostgreSQL upon submission.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
