import { vi } from 'vitest';

// jsdom doesn't implement canvas — mock it so SignaturePad doesn't crash
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillStyle: '',
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  scale: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;
