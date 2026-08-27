import React, { useRef, useState } from 'react';

export type FilePickerAcceptType = 'image' | 'pdf' | 'document' | 'any' | string;

const ACCEPT_MAP: Record<string, string> = {
  image: 'image/*',
  pdf: 'application/pdf',
  document: 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain',
  any: '*/*',
};

function resolveAccept(accept: FilePickerAcceptType[]): string {
  if (accept.includes('any')) return '*/*';
  return accept.map((a) => ACCEPT_MAP[a] ?? a).join(',');
}

function isImage(file: File) {
  return file.type.startsWith('image/');
}

function fileIcon(file: File) {
  if (file.type === 'application/pdf') return '📄';
  if (file.type.startsWith('image/')) return '🖼';
  return '📎';
}

export interface FilePickerProps {
  onFilePicked?: (file: File) => void;
  /** @deprecated use onFilePicked */
  onImagePicked?: (file: File, dataUrl: string) => void;
  label?: string;
  accept?: FilePickerAcceptType[];
  placeholder?: string;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  onFilePicked,
  onImagePicked,
  label,
  accept = ['image'],
  placeholder,
}) => {
  const [picked, setPicked] = useState<{ file: File; preview: string | null } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (isImage(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPicked({ file, preview: dataUrl });
        onFilePicked?.(file);
        onImagePicked?.(file, dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      setPicked({ file, preview: null });
      onFilePicked?.(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const imageOnly = accept.length === 1 && accept[0] === 'image';
  const defaultPlaceholder = imageOnly ? 'Click or drag an image here' : 'Click or drag a file here';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
      {label && <span style={{ fontSize: 14, color: '#4a5568' }}>{label}</span>}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          width: 200, height: 200, border: '2px dashed #cbd5e0', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden', backgroundColor: '#f7fafc',
        }}
      >
        {picked ? (
          picked.preview ? (
            <img src={picked.preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: 40 }}>{fileIcon(picked.file)}</div>
              <div style={{ fontSize: 12, color: '#4a5568', marginTop: 8, wordBreak: 'break-all' }}>
                {picked.file.name}
              </div>
            </div>
          )
        ) : (
          <span style={{ fontSize: 13, color: '#a0aec0', textAlign: 'center', padding: 8 }}>
            {placeholder ?? defaultPlaceholder}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={resolveAccept(accept)}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      {picked && (
        <button
          onClick={(e) => { e.stopPropagation(); setPicked(null); if (inputRef.current) inputRef.current.value = ''; }}
          style={{ padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
        >
          Clear
        </button>
      )}
    </div>
  );
};

/** @deprecated use FilePicker */
export const ImagePicker = FilePicker;
export type ImagePickerProps = FilePickerProps;
