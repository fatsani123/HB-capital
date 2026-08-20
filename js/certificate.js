// Generates a downloadable Certificate of Completion as a PNG, drawn on a canvas.
// Call: generateCertificate(fullName, planLabel, completionDateStr)

async function generateCertificate(fullName, planLabel, completionDateStr) {
  // Make sure our custom fonts are loaded before drawing text on the canvas —
  // canvas text doesn't wait for webfonts the way normal HTML does.
  if (document.fonts && document.fonts.load) {
    try {
      await document.fonts.load('700 80px "Cormorant Garamond"');
      await document.fonts.load('italic 600 34px "Cormorant Garamond"');
      await document.fonts.load('700 15px "Inter"');
      await document.fonts.ready;
    } catch (e) { /* fall back to default serif/sans if webfonts fail to load */ }
  }

  const W = 1600, H = 1131;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const NAVY = '#0B1E3D';
  const BLUE = '#2456DB';
  const LIGHT_BLUE = '#6E9DFF';
  const GRAY = '#6B7690';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Soft corner tint
  const grad = ctx.createRadialGradient(W, 0, 0, W, 0, 700);
  grad.addColorStop(0, 'rgba(110,157,255,0.10)');
  grad.addColorStop(1, 'rgba(110,157,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const grad2 = ctx.createRadialGradient(0, H, 0, 0, H, 700);
  grad2.addColorStop(0, 'rgba(36,86,219,0.08)');
  grad2.addColorStop(1, 'rgba(36,86,219,0)');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, W, H);

  // Double border
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = LIGHT_BLUE;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(64, 64, W - 128, H - 128);

  // Wordmark
  ctx.textAlign = 'center';
  ctx.font = '700 30px "Cormorant Garamond", serif';
  ctx.fillStyle = NAVY;
  ctx.fillText('HB', W / 2 - 40, 155);
  ctx.fillStyle = BLUE;
  ctx.fillText('Capital', W / 2 + 34, 155);

  // Eyebrow
  ctx.font = '700 13px "Inter", sans-serif';
  ctx.fillStyle = BLUE;
  ctx.letterSpacing = '3px';
  ctx.fillText('TRADING MENTORSHIP PROGRAM', W / 2, 195);
  ctx.letterSpacing = '0px';

  // Title
  ctx.font = '700 46px "Inter", sans-serif';
  ctx.fillStyle = NAVY;
  ctx.fillText('Certificate of Completion', W / 2, 280);

  // Rule
  ctx.strokeStyle = LIGHT_BLUE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 60, 310);
  ctx.lineTo(W / 2 + 60, 310);
  ctx.stroke();

  // "This certifies that"
  ctx.font = 'italic 400 20px "Inter", serif';
  ctx.fillStyle = GRAY;
  ctx.fillText('This certifies that', W / 2, 400);

  // Name
  ctx.font = '700 76px "Cormorant Garamond", serif';
  ctx.fillStyle = NAVY;
  ctx.fillText(fullName, W / 2, 480);

  // Underline under name
  const nameWidth = ctx.measureText(fullName).width;
  ctx.strokeStyle = 'rgba(11,30,61,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - Math.min(nameWidth / 2 + 30, 500), 510);
  ctx.lineTo(W / 2 + Math.min(nameWidth / 2 + 30, 500), 510);
  ctx.stroke();

  // Description
  ctx.font = '400 20px "Inter", sans-serif';
  ctx.fillStyle = GRAY;
  ctx.fillText('has successfully completed the', W / 2, 565);

  ctx.font = '700 26px "Inter", sans-serif';
  ctx.fillStyle = BLUE;
  ctx.fillText(planLabel + ' Trading Mentorship Program', W / 2, 605);

  ctx.font = '400 15px "Inter", sans-serif';
  ctx.fillStyle = GRAY;
  ctx.fillText('through HB Capital — building the skills, discipline, and system to trade professionally.', W / 2, 645);

  // Seal
  const sealX = W / 2, sealY = 730, sealR = 62;
  const sealGrad = ctx.createLinearGradient(sealX - sealR, sealY - sealR, sealX + sealR, sealY + sealR);
  sealGrad.addColorStop(0, BLUE);
  sealGrad.addColorStop(1, LIGHT_BLUE);
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
  ctx.fillStyle = sealGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR - 10, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // checkmark
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(sealX - 22, sealY);
  ctx.lineTo(sealX - 6, sealY + 18);
  ctx.lineTo(sealX + 26, sealY - 20);
  ctx.stroke();

  // Bottom row: date (left) and signature (right)
  const bottomY = 900;
  const leftX = 340, rightX = W - 340;

  ctx.textAlign = 'center';

  // Date
  ctx.strokeStyle = 'rgba(11,30,61,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftX - 110, bottomY);
  ctx.lineTo(leftX + 110, bottomY);
  ctx.stroke();
  ctx.font = '600 18px "Inter", sans-serif';
  ctx.fillStyle = NAVY;
  ctx.fillText(completionDateStr, leftX, bottomY - 12);
  ctx.font = '700 11px "Inter", sans-serif';
  ctx.fillStyle = GRAY;
  ctx.fillText('DATE COMPLETED', leftX, bottomY + 24);

  // Signature
  ctx.beginPath();
  ctx.moveTo(rightX - 110, bottomY);
  ctx.lineTo(rightX + 110, bottomY);
  ctx.stroke();
  ctx.font = 'italic 700 30px "Cormorant Garamond", serif';
  ctx.fillStyle = BLUE;
  ctx.fillText('Trader Fatsa', rightX, bottomY - 14);
  ctx.font = '700 11px "Inter", sans-serif';
  ctx.fillStyle = GRAY;
  ctx.fillText('FOUNDER, HB CAPITAL', rightX, bottomY + 24);

  return canvas;
}

async function downloadCertificate(fullName, planLabel, completionDateStr) {
  const canvas = await generateCertificate(fullName, planLabel, completionDateStr);
  const link = document.createElement('a');
  link.download = 'HB-Capital-Certificate-' + fullName.replace(/\s+/g, '-') + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
