import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI, aiAPI } from '../services/api';
import {
  ScanLine, Loader2, AlertCircle, CheckCircle2,
  ArrowDown, ArrowUp, Upload, X, Camera,
  RefreshCw, FileImage, Zap, Lightbulb, Store,
  CalendarDays, Tag, FileText, ShieldCheck,
  CreditCard, Receipt, Clock, Hash, DollarSign,
} from 'lucide-react';
import Layout from '../components/Layout';

/* ─── Constants ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Bills',
  'Entertainment', 'Health', 'Education', 'Other',
];

const SCAN_STEPS = [
  'Uploading receipt image...',
  'Analyzing image with Gemini Vision AI...',
  'Extracting merchant, amount & date...',
  'Detecting category & payment info...',
  'Finalizing extracted results...',
];

/* ─── Helpers ────────────────────────────────────────────────────────── */
const confidenceBadge = (level) => {
  if (!level) return null;
  const map = {
    high:   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: '✓ High confidence' },
    medium: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: '⚠ Please verify' },
    low:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: '✗ Review carefully' },
  };
  const s = map[level] || map.medium;
  return (
    <span style={{
      fontSize: '10px', fontWeight: '700', padding: '2px 8px',
      borderRadius: '999px', background: s.bg, color: s.color,
      border: `1px solid ${s.border}`, marginLeft: '8px',
      display: 'inline-block',
    }}>
      {s.label}
    </span>
  );
};

const InfoChip = ({ icon: Icon, label, value, confidenceKey, confidence }) => {
  const displayValue = (value !== null && value !== undefined && value !== '') ? value : <span style={{ color: '#94a3b8', fontWeight: '400' }}>Not detected</span>;
  return (
    <div style={{
      background: '#fff', borderRadius: '10px',
      padding: '10px 14px', border: '1px solid #bae6fd',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
        <Icon size={12} color="#0284c7" />
        <span style={{ fontSize: '10px', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        {confidenceKey && confidenceBadge(confidence?.[confidenceKey])}
      </div>
      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{displayValue}</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════════════ */
const Receipts = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  /* ── State ─────────────────────────────────────────────────────────── */
  // stage: idle | preview | scanning | extracted | saving | done
  const [stage, setStage] = useState('idle');
  const [dragOver, setDragOver] = useState(false);

  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [scanStep, setScanStep] = useState(0);
  const [extracted, setExtracted] = useState(null);   // raw AI response data
  const [confidence, setConfidence] = useState({});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    type: 'EXPENSE',
    amount: '',
    description: '',
    shopName: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    tax: '',
    paymentMethod: '',
    notes: '',
  });

  /* ── File selection ──────────────────────────────────────────────────  */
  const loadFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Unsupported format. Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.');
      return;
    }
    setError('');
    setSuccess('');
    setExtracted(null);
    setConfidence({});
    setReceiptFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStage('preview');
  };

  const handleFileInput = (e) => loadFile(e.target.files?.[0]);

  const onDragOver  = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const onDragLeave = useCallback(() => setDragOver(false), []);
  const onDrop     = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    loadFile(e.dataTransfer.files?.[0]);
  }, []); // eslint-disable-line

  const resetAll = () => {
    setStage('idle');
    setReceiptFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setExtracted(null);
    setConfidence({});
    setError('');
    setSuccess('');
    setForm({
      type: 'EXPENSE', amount: '', description: '', shopName: '',
      category: 'Food', date: new Date().toISOString().split('T')[0],
      tax: '', paymentMethod: '', notes: '',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Category matching helper ────────────────────────────────────────  */
  const matchCategory = (aiCat) => {
    if (!aiCat) return null;
    const lower = aiCat.toLowerCase();
    return CATEGORIES.find((c) => c.toLowerCase() === lower)
      || CATEGORIES.find((c) => lower.includes(c.toLowerCase()))
      || 'Other';
  };

  /* ── Scan (call backend) ─────────────────────────────────────────────  */
  const handleScan = async () => {
    if (!receiptFile) return;
    setStage('scanning');
    setError('');
    setSuccess('');
    setScanStep(0);

    // Cycle through animated status texts
    const stepInterval = setInterval(() => {
      setScanStep((s) => (s < SCAN_STEPS.length - 1 ? s + 1 : s));
    }, 900);

    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);

      const response = await aiAPI.scanReceipt(formData);
      clearInterval(stepInterval);

      console.log("Receipt scan response:", response.data);

      const payload = response.data;
      const data = payload?.data;
      if (!data) throw new Error("No data returned from AI");

      console.log("AI Response:", data);

      // Map fields exactly as requested
      const mappedForm = {
        ...form,
        type: 'EXPENSE',
        amount: data.amount || 0,
        description: data.title || 'Scanned Receipt',
        shopName: data.shopName || '',
        category: matchCategory(data.category) || 'Other',
        date: (() => {
          try {
            const d = data.date ? new Date(data.date) : null;
            return (d && !isNaN(d)) ? d.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          } catch { return new Date().toISOString().split('T')[0]; }
        })(),
        tax: data.tax != null ? String(data.tax) : '0',
        paymentMethod: data.paymentMethod || 'Other',
        notes: data.notes || 'Scanned from receipt',
      };

      console.log("Mapped form data:", mappedForm);

      // Update both states
      setConfidence(data.confidence || {});
      setForm(mappedForm);
      
      setStage('extracted');

      if (payload.partial) {
        setExtracted(data);
        setSuccess('⚠️ Some details may be incorrect. Please review.');
      } else if (payload.isAIFailed) {
        setExtracted(null);
        setError('AI quota exceeded or API down. Please fill details manually or retry later.');
      } else {
        setExtracted(data);
        setSuccess('✓ Receipt scanned successfully.');
      }

    } catch (err) {
      clearInterval(stepInterval);
      console.error('[Receipts] Scan error:', err);
      const msg = err.response?.data?.message || 'Scan failed. Please try another image or fill in manually.';
      setError(msg);
      
      setExtracted(null);
      setForm(prev => ({ ...prev, description: 'Scanned Receipt', notes: 'Scanned from receipt' }));
      setStage('extracted');
    }
  };

  /* ── Form field change ───────────────────────────────────────────────  */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  /* ── Save transaction ────────────────────────────────────────────────  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const amtNum = parseFloat(String(form.amount).replace(/[^\d.-]/g, ''));
    if (!form.amount || isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    // Title is required by the backend — use description or a fallback
    const titleValue = (form.description && form.description.trim())
      ? form.description.trim()
      : (form.shopName ? `Purchase at ${form.shopName}` : 'Scanned Receipt');

    if (!titleValue) {
      setError('Please add a description for this expense.');
      return;
    }

    setStage('saving');
    setError('');

    try {
      const payload = {
        type: form.type,
        amount: amtNum,
        category: form.category || 'Other',
        date: form.date || new Date().toISOString().split('T')[0],
        // Both title and description are set — title is required by the Zod schema
        title: titleValue,
        description: titleValue,
        merchant: form.shopName?.trim() || undefined,
        paymentMethod: form.paymentMethod || undefined,
      };

      // Only include optional numeric fields if they have valid values
      if (form.tax) {
        const taxNum = parseFloat(String(form.tax).replace(/[^\d.-]/g, ''));
        if (!isNaN(taxNum) && taxNum >= 0) payload.tax = taxNum;
      }
      if (form.notes && form.notes.trim()) {
        payload.notes = form.notes.trim();
      }

      await transactionAPI.create(payload);

      setStage('done');
      setSuccess('✓ Expense saved successfully! Returning to your dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (err) {
      console.error('[Receipts] Save error:', err);
      const errMsg = err.response?.data?.message
        || err.response?.data?.error
        || 'Failed to save transaction. Please try again.';
      setError(errMsg);
      setStage('extracted');
    }
  };

  /* ── Shared styles ───────────────────────────────────────────────────  */
  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '14px', color: '#111827',
    background: '#fff', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };
  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
  };
  const onFocus = (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; };
  const onBlur  = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; };

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════ */
  return (
    <Layout>
      <style>{`
        @keyframes spin       { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-ring { 0%,100% { opacity:.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.08); } }
        @keyframes fadeUp     { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scanLine   { 0% { top:0%; } 100% { top:100%; } }
        @keyframes shimmer    { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .receipt-card { animation: fadeUp 0.35s ease both; }
        .scan-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .secondary-btn:hover { background: #f3f4f6 !important; }
        .inp-focus:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
      `}</style>

      <div style={{ maxWidth: '660px', margin: '0 auto', padding: '32px 16px 60px' }}>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
            }}>
              <ScanLine size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                AI Receipt Scanner
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Upload a receipt → AI extracts details → Review → Save as expense
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1 — Upload Zone (idle only)
        ════════════════════════════════════════════════════════════════ */}
        {stage === 'idle' && (
          <div className="receipt-card" style={{
            border: `2px dashed ${dragOver ? '#6366f1' : '#c7d2fe'}`,
            borderRadius: '20px',
            background: dragOver ? '#f0f0ff' : '#fafbff',
            padding: '52px 32px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            ref={dropRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{
              width: '76px', height: '76px', borderRadius: '20px',
              background: 'linear-gradient(135deg,#ede9fe,#e0e7ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'pulse-ring 2.5s ease-in-out infinite',
            }}>
              <FileImage size={36} color="#6366f1" />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
              Drop your receipt here
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b' }}>
              or click to browse from your device
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '11px 22px', borderRadius: '10px',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', border: 'none', fontWeight: '700',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                }}
              >
                <Upload size={14} /> Upload Receipt
              </button>
              <button type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment');
                    fileInputRef.current.click();
                    fileInputRef.current.removeAttribute('capture');
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '11px 22px', borderRadius: '10px',
                  background: '#fff', color: '#6366f1',
                  border: '1.5px solid #c7d2fe',
                  fontWeight: '700', fontSize: '13px',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Camera size={14} /> Use Camera
              </button>
            </div>
            <p style={{ margin: '20px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Supported: JPG, PNG, WEBP · Max 10 MB
            </p>
          </div>
        )}

        {/* idle error (wrong format / size) */}
        {stage === 'idle' && error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: '12px',
            color: '#dc2626', fontSize: '13px', marginTop: '16px',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />{error}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2 — Receipt Preview + Scan button (preview | scanning)
        ════════════════════════════════════════════════════════════════ */}
        {(stage === 'preview' || stage === 'scanning') && (
          <div className="receipt-card" style={{
            background: '#fff', borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            {/* Preview header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileImage size={16} color="#6366f1" />
                <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                  {receiptFile?.name || 'receipt.jpg'}
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  ({receiptFile ? (receiptFile.size / 1024).toFixed(0) : 0} KB)
                </span>
              </div>
              {stage === 'preview' && (
                <button type="button" onClick={resetAll} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', padding: '4px', borderRadius: '6px',
                  display: 'flex', alignItems: 'center',
                }}>
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Image Preview */}
            <div style={{ position: 'relative', background: '#f8fafc', textAlign: 'center', padding: '20px' }}>
              <img
                src={previewUrl}
                alt="Receipt preview"
                style={{
                  maxHeight: '300px', maxWidth: '100%', borderRadius: '12px',
                  objectFit: 'contain', border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                }}
              />
              {/* Animated scan line overlay */}
              {stage === 'scanning' && (
                <div style={{
                  position: 'absolute', inset: '20px', borderRadius: '12px',
                  overflow: 'hidden', pointerEvents: 'none',
                }}>
                  <div style={{
                    position: 'absolute', left: 0, right: 0, height: '3px',
                    background: 'linear-gradient(90deg,transparent,#6366f1,#8b5cf6,transparent)',
                    animation: 'scanLine 1.4s ease-in-out infinite',
                  }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.05)' }} />
                </div>
              )}
            </div>

            {/* Scanning progress */}
            {stage === 'scanning' && (
              <div style={{
                padding: '22px 24px',
                background: 'linear-gradient(135deg,#faf5ff,#ede9fe)',
                borderTop: '1px solid #ede9fe',
                textAlign: 'center',
              }}>
                <Loader2 size={30} color="#6366f1"
                  style={{ marginBottom: '12px', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }} />
                <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '15px', color: '#6366f1' }}>
                  {SCAN_STEPS[scanStep]}
                </p>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#7c3aed' }}>
                  Powered by Gemini Vision AI
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  {SCAN_STEPS.map((_, i) => (
                    <div key={i} style={{
                      width: i === scanStep ? '20px' : '6px',
                      height: '6px', borderRadius: '3px',
                      background: i <= scanStep ? '#6366f1' : '#c7d2fe',
                      transition: 'all 0.3s',
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Preview actions */}
            {stage === 'preview' && (
              <div style={{
                padding: '16px 20px', borderTop: '1px solid #f1f5f9',
                display: 'flex', gap: '10px',
              }}>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="secondary-btn"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', padding: '11px', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0', background: '#fff',
                    color: '#374151', fontWeight: '600', fontSize: '13px',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                  }}>
                  <RefreshCw size={13} /> Replace
                </button>
                <button type="button" onClick={handleScan}
                  className="scan-btn"
                  style={{
                    flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '11px', borderRadius: '10px',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', border: 'none',
                    fontWeight: '700', fontSize: '14px',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  }}>
                  <Zap size={15} /> Scan Receipt with AI
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3 — Extracted results + Editable form
            (stage: extracted | saving | done)
        ════════════════════════════════════════════════════════════════ */}
        {(stage === 'extracted' || stage === 'saving' || stage === 'done') && (
          <div className="receipt-card">

            {/* ── Receipt image thumbnail (keep visible) ──────────────── */}
            {previewUrl && (
              <div style={{
                background: '#fff', borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                padding: '14px 18px',
                marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <img
                  src={previewUrl}
                  alt="Scanned receipt"
                  style={{
                    width: '68px', height: '68px', borderRadius: '10px',
                    objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <Receipt size={13} color="#6366f1" />
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                      {receiptFile?.name || 'receipt.jpg'}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: error ? '#ef4444' : '#64748b' }}>
                    {receiptFile ? (receiptFile.size / 1024).toFixed(0) : 0} KB · {error ? 'Extraction failed' : 'Scanned successfully'}
                  </span>
                </div>
                <button type="button" onClick={resetAll}
                  className="secondary-btn"
                  disabled={stage === 'scanning' || (error && error.includes('busy'))}
                  style={{
                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '7px 12px', borderRadius: '8px',
                    border: '1.5px solid #e2e8f0', background: '#fff',
                    color: '#374151', fontWeight: '600', fontSize: '12px',
                    cursor: (stage === 'scanning' || (error && error.includes('busy'))) ? 'not-allowed' : 'pointer', 
                    fontFamily: 'inherit', transition: 'background 0.15s',
                    opacity: (stage === 'scanning' || (error && error.includes('busy'))) ? 0.6 : 1,
                    flexShrink: 0,
                  }}>
                  {stage === 'scanning' ? <Loader2 size={12} className="animate-spin" /> : <ScanLine size={12} />}
                  {(error && error.includes('busy')) ? 'Cooling down...' : 'Scan Another'}
                </button>
              </div>
            )}

            {/* ── Global alerts ──────────────────────────────────────── */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '12px 16px', background: '#fef2f2',
                border: '1px solid #fecaca', borderRadius: '12px',
                color: '#dc2626', fontSize: '13px', marginBottom: '16px',
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 16px', background: '#f0fdf4',
                border: '1px solid #bbf7d0', borderRadius: '12px',
                color: '#15803d', fontSize: '13px', marginBottom: '16px',
              }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                {success}
              </div>
            )}

            {/* ── AI Extraction Summary card (only shown when AI returned data) ── */}
            {extracted && (
              <div style={{
                background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
                border: '1px solid #bae6fd',
                borderRadius: '16px',
                padding: '18px 20px',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <Zap size={16} color="#0284c7" />
                  <span style={{ fontWeight: '800', fontSize: '14px', color: '#0369a1' }}>
                    AI Extracted Details
                  </span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                    background: '#0284c720', color: '#0284c7', fontWeight: '700',
                    border: '1px solid #7dd3fc',
                  }}>
                    Review &amp; edit below before saving
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <InfoChip icon={Store}       label="Shop Name"      value={extracted.shopName}      confidenceKey="shopName"  confidence={confidence} />
                  <InfoChip icon={DollarSign}   label="Total Amount"   value={extracted.amount != null ? `₹${extracted.amount}` : null} confidenceKey="amount" confidence={confidence} />
                  <InfoChip icon={CalendarDays} label="Date"           value={extracted.date}          confidenceKey="date"      confidence={confidence} />
                  <InfoChip icon={Tag}          label="Category"       value={extracted.category}      confidenceKey="category"  confidence={confidence} />
                  <InfoChip icon={DollarSign}   label="Tax"            value={extracted.tax != null ? `₹${extracted.tax}` : null} />
                  <InfoChip icon={CreditCard}   label="Payment Method" value={extracted.paymentMethod} />
                </div>

                {extracted.notes && (
                  <div style={{
                    marginTop: '10px', padding: '10px 14px',
                    background: '#fff', borderRadius: '10px',
                    border: '1px solid #bae6fd',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <FileText size={12} color="#0284c7" />
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Notes
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>{extracted.notes}</span>
                  </div>
                )}

                {/* Warn if key fields are missing */}
                {(!extracted.merchant && extracted.amount == null) && (
                  <div style={{
                    padding: '10px 14px', marginTop: '10px',
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: '10px', fontSize: '12px', color: '#b45309',
                  }}>
                    ⚠ Limited data extracted — please fill in the missing fields below before saving.
                  </div>
                )}
              </div>
            )}

            {/* ── Manual entry notice (when scan failed entirely) ─────────── */}
            {!extracted && (
              <div style={{
                background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
                border: '1px solid #fde68a',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex', alignItems: 'flex-start', gap: '12px',
              }}>
                <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '13px', color: '#92400e' }}>
                    Manual Entry Mode
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#b45309', lineHeight: '1.5' }}>
                    The AI couldn't fully read this receipt. Please fill in the transaction details manually below — all fields are editable.
                  </p>
                </div>
              </div>
            )}

            {/* ── Editable Form ──────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} style={{
              background: '#fff', borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.05)', padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
                <ShieldCheck size={17} color="#6366f1" />
                <span style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                  Transaction Details
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '4px' }}>
                  — review &amp; edit before saving
                </span>
              </div>

              {/* Type Toggle */}
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Transaction Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['EXPENSE', 'INCOME'].map((t) => (
                    <button key={t} type="button"
                      onClick={() => setForm((p) => ({ ...p, type: t }))}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '11px', border: `1.5px solid ${form.type === t ? '#6366f1' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        background: form.type === t ? '#eef2ff' : '#fafafa',
                        color: form.type === t ? '#6366f1' : '#6b7280',
                        fontWeight: '700', fontSize: '13px',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>
                      {t === 'EXPENSE' ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
                      {t === 'EXPENSE' ? 'Expense' : 'Income'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two-column grid for compact layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px', marginBottom: '14px' }}>

                {/* Amount */}
                <div>
                  <label style={labelStyle}>Amount (₹) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: '#94a3b8', fontSize: '14px', fontWeight: '700', pointerEvents: 'none',
                    }}>₹</span>
                    <input type="number" name="amount" placeholder="0.00"
                      value={form.amount} onChange={handleChange}
                      required min="0" step="0.01"
                      style={{ ...inputStyle, paddingLeft: '28px' }}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                  </div>
                  {confidence.amount === 'medium' && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#b45309' }}>⚠ Verify this amount</p>}
                  {confidence.amount === 'low'    && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#dc2626' }}>✗ Amount may be inaccurate</p>}
                </div>

                {/* Date */}
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange}
                    required style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>

              </div>

              {/* Description (full width) */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Description *</label>
                <input type="text" name="description" placeholder="What did you spend on?"
                  value={form.description} onChange={handleChange}
                  required style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* Two-column: Merchant + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Shop Name <span style={{ fontWeight: '400', color: '#94a3b8' }}>(opt)</span></label>
                  <input type="text" name="shopName" placeholder="Store or vendor name"
                    value={form.shopName} onChange={handleChange}
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                  {confidence.shopName === 'low' && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#dc2626' }}>✗ Check shop name</p>}
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select name="category" value={form.category} onChange={handleChange}
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                    onFocus={onFocus} onBlur={onBlur}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Two-column: Tax + Payment Method */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Tax / GST <span style={{ fontWeight: '400', color: '#94a3b8' }}>(opt)</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: '#94a3b8', fontSize: '14px', fontWeight: '700', pointerEvents: 'none',
                    }}>₹</span>
                    <input type="number" name="tax" placeholder="0.00"
                      value={form.tax} onChange={handleChange}
                      min="0" step="0.01"
                      style={{ ...inputStyle, paddingLeft: '28px' }}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Payment Method <span style={{ fontWeight: '400', color: '#94a3b8' }}>(opt)</span></label>
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                    onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Select method</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Online">Online / Net Banking</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Notes (full width) */}
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Notes <span style={{ fontWeight: '400', color: '#94a3b8' }}>(opt)</span></label>
                <textarea name="notes" placeholder="Additional details about this expense..."
                  value={form.notes} onChange={handleChange} rows={2}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '68px', lineHeight: '1.5' }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button type="submit"
                  disabled={stage === 'saving' || stage === 'done'}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '14px', borderRadius: '12px',
                    background: stage === 'done'
                      ? '#10b981'
                      : stage === 'saving'
                        ? '#a5b4fc'
                        : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', border: 'none', fontWeight: '800',
                    fontSize: '15px', cursor: (stage === 'saving' || stage === 'done') ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                    boxShadow: (stage === 'saving' || stage === 'done') ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
                  }}>
                  {stage === 'saving'
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving expense...</>
                    : stage === 'done'
                      ? <><CheckCircle2 size={16} /> Saved! Redirecting...</>
                      : <><CheckCircle2 size={15} /> Save as Expense</>}
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button type="button" onClick={resetAll}
                    className="secondary-btn"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '6px', padding: '10px', borderRadius: '10px',
                      border: '1.5px solid #e2e8f0', background: '#fff',
                      color: '#374151', fontWeight: '600', fontSize: '13px',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                    }}>
                    <ScanLine size={13} /> Scan Another
                  </button>
                  <button type="button" onClick={() => navigate('/transactions')}
                    className="secondary-btn"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '6px', padding: '10px', borderRadius: '10px',
                      border: '1.5px solid #e2e8f0', background: '#fff',
                      color: '#374151', fontWeight: '600', fontSize: '13px',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                    }}>
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
      </div>
    </Layout>
  );
};

export default Receipts;
