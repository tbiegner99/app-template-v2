import React, { useRef, useEffect, useState } from 'react';

export interface SignaturePadProps {
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
  onAccept?: (dataUrl: string | null) => void;
  label?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  width = 400,
  height = 180,
  penColor = '#000000',
  backgroundColor = '#f8f8f8',
  onAccept,
  label,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [backgroundColor]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const src = 'touches' in e ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const end = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const accept = () => {
    if (isEmpty) { onAccept?.(null); return; }
    onAccept?.(canvasRef.current!.toDataURL('image/png'));
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
      {label && <span style={{ fontSize: 14, color: '#4a5568' }}>{label}</span>}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '1px solid #e2e8f0', borderRadius: 4, touchAction: 'none', cursor: 'crosshair' }}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={clear} style={{ padding: '6px 12px', cursor: 'pointer' }}>Clear</button>
        {onAccept && <button onClick={accept} style={{ padding: '6px 12px', cursor: 'pointer' }}>Accept</button>}
      </div>
    </div>
  );
};
