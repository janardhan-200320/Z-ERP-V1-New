import { useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type FormDescriptionUploadProps = {
  descriptionValue: string;
  onDescriptionChange: (value: string) => void;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  descriptionRequired?: boolean;
  uploadLabel?: string;
  uploadedFile: File | null;
  onUploadedFileChange: (file: File | null) => void;
  accept?: string;
  helperText?: string;
};

export default function FormDescriptionUpload({
  descriptionValue,
  onDescriptionChange,
  descriptionLabel = 'Description',
  descriptionPlaceholder = 'Add details...',
  descriptionRequired = false,
  uploadLabel = 'Attachment Upload',
  uploadedFile,
  onUploadedFileChange,
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  helperText = 'PDF, JPG, PNG, WEBP',
}: FormDescriptionUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-600">
          {descriptionLabel}{descriptionRequired ? ' *' : ''}
        </Label>
        <Textarea
          value={descriptionValue}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={descriptionPlaceholder}
          className="min-h-[90px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-600">{uploadLabel}</Label>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => onUploadedFileChange(e.target.files?.[0] ?? null)}
        />

        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {uploadedFile ? (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                <p className="truncate text-sm font-medium text-slate-700">{uploadedFile.name}</p>
                <button
                  type="button"
                  onClick={() => onUploadedFileChange(null)}
                  className="text-slate-400 hover:text-red-500"
                  aria-label="Remove uploaded file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No file selected</p>
            )}
            <p className="text-xs text-slate-400">{helperText}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        </div>
      </div>
    </div>
  );
}
