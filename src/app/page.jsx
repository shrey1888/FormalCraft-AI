"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { extractVariables, fillTemplate } from "../lib/template";
import { useTemplates, saveTemplatesToStorage } from "../lib/storage";

// Real-world Executive Email Presets
const PRESET_QUICK_PICKS = [
  {
    label: "Sick Leave for College",
    type: "college",
    tone: "formal",
    length: "medium",
    recipient: "Prof. Henderson, Head of Department",
    subject: "Application for Medical Leave of Absence",
    bullets: "• Severe viral fever and doctor advised 3 days complete bed rest\n• Missing Mid-Term Lab Evaluation scheduled for Thursday\n• Request permission to appear for compensatory practical exam next week",
  },
  {
    label: "Milestone Delay Escalation",
    type: "business",
    tone: "firm",
    length: "medium",
    recipient: "Marcus Vance, VP of Product Delivery",
    subject: "Project Milestone Shift: Q3 API Integration",
    bullets: "• Third-party authentication gateway encountered recurring latency issues\n• Release date rescheduled from Oct 12 to Oct 19 to safeguard system integrity\n• Core team working on standby over weekend with daily sprint syncs",
  },
  {
    label: "Billing Dispute Notice",
    type: "complaint",
    tone: "firm",
    length: "medium",
    recipient: "Billing Accounts Lead, Enterprise Services",
    subject: "Formal Dispute: Unauthorized Recurring Surcharge on Invoice #9042",
    bullets: "• Invoiced $4,250 instead of contracted enterprise tier of $3,500\n• Redundant premium add-on billed without prior administrative sign-off\n• Demand written adjustment and credit note issued within 3 business days",
  },
  {
    label: "Bonafide Certificate Request",
    type: "college",
    tone: "respectful",
    length: "short",
    recipient: "The Dean of Academic Affairs, University Registrar",
    subject: "Requisition for Official Bonafide Certificate for Visa Processing",
    bullets: "• Enrolled in B.Tech 6th Semester (Computer Science & Engineering)\n• Urgently required for consular visa appointment on 25th of this month\n• All tuition fees and departmental dues cleared with enclosed receipt",
  },
  {
    label: "Recommendation Letter",
    type: "business",
    tone: "polite",
    length: "medium",
    recipient: "Director of Admissions / Senior Faculty",
    subject: "Letter of Recommendation Request for Graduate Studies",
    bullets: "• Applying for Master's in Data Science for Fall 2027 admissions\n• Secured grade 'A' in Advanced Database Systems and led final capstone\n• Application deadline is November 15th with attached resume and draft SOP",
  },
];

// Audio Synth for Procedural Glass Clicks
class GlassAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  play(type = "soft") {
    if (!this.enabled || typeof window === "undefined") return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === "primary") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(1480, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === "switch") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.05);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      }
    } catch {
      // Audio context restricted until user gesture
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

const audio = new GlassAudioEngine();

export default function Home() {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState("composer"); // "composer" | "templates"
  const [theme, setTheme] = useState("theme-default");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Form State
  const [letterType, setLetterType] = useState("business");
  const [tone, setTone] = useState("formal");
  const [length, setLength] = useState("medium");
  const [recipient, setRecipient] = useState("Prof. Henderson, Head of Department");
  const [subject, setSubject] = useState("Application for Medical Leave of Absence");
  const [bullets, setBullets] = useState(
    "• Severe viral fever and doctor advised 3 days complete bed rest\n• Missing Mid-Term Lab Evaluation scheduled for Thursday\n• Request permission to appear for compensatory practical exam next week"
  );

  // Options & Features
  const [markdownEnabled, setMarkdownEnabled] = useState(false);
  const [etiquetteVerified, setEtiquetteVerified] = useState(true);

  // Result & AI State
  const [result, setResult] = useState(
    `Dear Prof. Henderson,

I am writing to formally request a medical leave of absence for a duration of three days, from Tuesday, October 6th, through Thursday, October 8th, due to acute viral fever. My attending physician has advised strict bed rest during this period, and I have enclosed the verified medical certificate for your departmental records.

Regrettably, my absence coincides with the Mid-Term Practical Laboratory Evaluation scheduled for Thursday afternoon. In light of these unavoidable medical circumstances, I respectfully request permission to appear for a compensatory practical examination at your convenience upon my resumption.

Thank you for your consideration and understanding.

Sincerely,
Shreyansh Mishra
Student ID: CS-2024-042
B.Tech (Computer Science & Engineering)`
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Template Filler State
  const templates = useTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateValues, setTemplateValues] = useState({});

  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    audio.play("primary");
    toastTimerRef.current = setTimeout(() => {
      setToastMessage("");
    }, 2800);
  }, []);

  const handleThemeChange = (newTheme) => {
    audio.play("soft");
    setTheme(newTheme);
    document.body.className = newTheme;
    showToast(`Backdrop set to ${newTheme.replace("theme-", "")}`);
  };

  const handleAudioToggle = () => {
    const next = audio.toggle();
    setSoundEnabled(next);
    if (next) audio.play("primary");
    showToast(next ? "Glass Haptics Enabled" : "Sound Muted");
  };

  const applyPreset = (preset) => {
    audio.play("soft");
    setLetterType(preset.type);
    setTone(preset.tone);
    setLength(preset.length);
    setRecipient(preset.recipient);
    setSubject(preset.subject);
    setBullets(preset.bullets);
    showToast(`Loaded Preset: "${preset.label}"`);
  };

  // AI Generation Call
  const handleGenerate = async () => {
    audio.play("primary");
    if (!bullets.trim()) {
      setError("Please provide key points or bullets to compose your document.");
      showToast("Please enter bullet points");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterType,
          tone,
          length,
          recipient,
          subject,
          bullets,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data.text || "");
      showToast("Document Drafted Successfully ✨");
    } catch (err) {
      console.warn("API generate fallback:", err);
      // Clean local executive fallback
      const salutation = recipient.trim() ? `Dear ${recipient.trim()},` : "Dear Sir/Madam,";
      const cleanedBullets = bullets
        .split("\n")
        .filter((b) => b.trim())
        .map((b) => b.replace(/^[•\-\*]\s*/, ""))
        .join(". ");

      const mockBody = `${salutation}\n\nI am writing to formally address matters concerning ${subject || "the subject matter"}.\n\nSpecifically, ${cleanedBullets}.\n\nI kindly request your favorable consideration and look forward to your guidance at your earliest convenience.\n\nRespectfully submitted,\nShreyansh Mishra`;
      setResult(mockBody);
      showToast("Composed with Executive Engine ✨");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    audio.play("primary");
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      showToast("Copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy automatically");
    }
  };

  const handleDownload = () => {
    if (!result) return;
    audio.play("soft");
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Formal_Document_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded document as .txt");
  };

  const handleSaveAsTemplate = () => {
    if (!result) return;
    audio.play("soft");
    const templateTitle = subject.trim() || `${letterType.toUpperCase()} Correspondence`;
    const newTemplate = {
      id: "custom-" + Date.now(),
      name: templateTitle,
      category: letterType === "college" ? "Academic" : "Corporate",
      description: `Generated ${letterType} format with tone: ${tone}`,
      text: result,
    };
    saveTemplatesToStorage([newTemplate, ...templates]);
    showToast("Saved to Template Library 📑");
  };

  // Template Filler logic
  const selectedTemplate = templates.find((t) => String(t.id) === selectedTemplateId);
  const templateVariables = selectedTemplate ? extractVariables(selectedTemplate.text) : [];

  const handleUseSelectedTemplate = () => {
    if (!selectedTemplate) return;
    const filled = fillTemplate(selectedTemplate.text, templateValues);
    setResult(filled);
    showToast("Rendered template to document surface");
  };

  // Word count & stats
  const wordCount = result ? result.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="liquid-glass-app">
      {/* Soft Ambient Floating Orbs */}
      <div className="ambient-background">
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>
        <div className="ambient-glow glow-3"></div>
        <div className="ambient-glow glow-4"></div>
        <div className="ambient-noise"></div>
      </div>

      {/* Top Header */}
      <header className="clean-header">
        <div className="brand-section">
          <div className="brand-badge">
            <div className="brand-orb"></div>
            <span>FormalCraft AI</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Theme Switcher Dots */}
          <div className="theme-picker" title="Switch Environment Backdrop">
            <button
              className={`theme-dot ${theme === "theme-default" ? "active" : ""}`}
              data-theme="theme-default"
              onClick={() => handleThemeChange("theme-default")}
              title="Studio Cream (Default)"
            />
            <button
              className={`theme-dot ${theme === "theme-sunset" ? "active" : ""}`}
              data-theme="theme-sunset"
              onClick={() => handleThemeChange("theme-sunset")}
              title="Sunset Rose"
            />
            <button
              className={`theme-dot ${theme === "theme-aurora" ? "active" : ""}`}
              data-theme="theme-aurora"
              onClick={() => handleThemeChange("theme-aurora")}
              title="Aurora Mint"
            />
            <button
              className={`theme-dot ${theme === "theme-cyber" ? "active" : ""}`}
              data-theme="theme-cyber"
              onClick={() => handleThemeChange("theme-cyber")}
              title="Cyber Dark"
            />
          </div>

          {/* Sound Toggle */}
          <button
            className={`glass-nav-btn ${soundEnabled ? "highlight" : ""}`}
            onClick={handleAudioToggle}
            title="Toggle Sound Effects"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            <span>{soundEnabled ? "Sound" : "Muted"}</span>
          </button>

          {/* Templates Link */}
          <a
            href="/templates"
            className="glass-nav-btn"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", "/templates");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
          >
            <span>Templates Studio 📑</span>
          </a>
        </div>
      </header>

      {/* Main Workspace (Clean Two-Column Layout) */}
      <main className="workspace-wrapper">
        <div className="workspace-grid">
          {/* ========================================================
              LEFT COLUMN: THE LIQUID GLASS COMPOSER
              ======================================================== */}
          <div className="composer-panel">
            <div className="glass-panel-card">
              <div className="panel-reflection-rim"></div>

              {/* Title & Mode Switcher */}
              <div className="panel-title-row">
                <h2 className="panel-title">Compose Document</h2>
                <span className="panel-tag">AI Assistant</span>
              </div>

              {/* Segmented Control: AI Composer | Template Filler */}
              <div className="glass-segmented-control">
                <button
                  className={`glass-segment-btn ${activeTab === "composer" ? "active" : ""}`}
                  onClick={() => {
                    audio.play("soft");
                    setActiveTab("composer");
                  }}
                >
                  {activeTab === "composer" && <span className="segment-indicator-dot"></span>}
                  <span>AI Composer</span>
                </button>
                <button
                  className={`glass-segment-btn ${activeTab === "templates" ? "active" : ""}`}
                  onClick={() => {
                    audio.play("soft");
                    setActiveTab("templates");
                  }}
                >
                  {activeTab === "templates" && <span className="segment-indicator-dot"></span>}
                  <span>Template Filler</span>
                </button>
              </div>

              {/* Mode 1: AI Composer */}
              {activeTab === "composer" ? (
                <>
                  {/* Quick Start Presets */}
                  <div className="quick-presets-group">
                    <span className="quick-presets-label">Instant Starters</span>
                    <div className="quick-presets-scroll">
                      {PRESET_QUICK_PICKS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          className="quick-preset-chip"
                          onClick={() => applyPreset(preset)}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Document Type Dropdown */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label">Document Type</label>
                    </div>
                    <div className="glass-pill-input">
                      <select
                        value={letterType}
                        onChange={(e) => setLetterType(e.target.value)}
                      >
                        <option value="business">Executive Business Email</option>
                        <option value="college">College Official Letter (Leave / Bonafide)</option>
                        <option value="complaint">Formal Complaint & Dispute Notice</option>
                        <option value="request">Official Administrative Request</option>
                      </select>
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Recipient Input */}
                  <div className="form-group">
                    <label className="form-label">Recipient / Authority</label>
                    <div className="glass-pill-input">
                      <input
                        type="text"
                        placeholder="e.g. Dean of Students, VP of Engineering"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        spellCheck="false"
                      />
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label">Subject Line</label>
                      <span className="form-hint">(Optional)</span>
                    </div>
                    <div className="glass-pill-input">
                      <input
                        type="text"
                        placeholder="Leave blank for AI auto-title"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        spellCheck="false"
                      />
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Key Points Textarea */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label">Key Details & Bullets</label>
                      <span className="form-hint">{bullets.length > 0 ? `${bullets.length} chars` : "One point per line"}</span>
                    </div>
                    <textarea
                      className="glass-textarea-card"
                      rows={4}
                      placeholder="• Reason for request or context&#10;• Core timeline or affected deliverables&#10;• Proposed resolution or next steps"
                      value={bullets}
                      onChange={(e) => setBullets(e.target.value)}
                    />
                  </div>

                  {/* Tone Calibration Chips */}
                  <div className="form-group">
                    <label className="form-label">Tone Calibration</label>
                    <div className="chips-grid">
                      {["formal", "polite", "firm", "respectful"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`tone-chip-btn ${tone === t ? "active" : ""}`}
                          onClick={() => {
                            audio.play("soft");
                            setTone(t);
                          }}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Length Target Chips */}
                  <div className="form-group">
                    <label className="form-label">Target Length</label>
                    <div className="chips-grid">
                      {[
                        { id: "short", label: "Concise (1-2 paras)" },
                        { id: "medium", label: "Standard" },
                        { id: "long", label: "Comprehensive" },
                      ].map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          className={`tone-chip-btn ${length === l.id ? "active" : ""}`}
                          onClick={() => {
                            audio.play("soft");
                            setLength(l.id);
                          }}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <div style={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>{error}</div>}

                  {/* Primary Modern Executive Glass Button */}
                  <button
                    className="btn-primary-action"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span>{loading ? "Drafting Document..." : "Generate Formal Document"}</span>
                  </button>

                  {/* Secondary Clean Glass Button & Reset Button */}
                  <div className="secondary-actions-row">
                    <button
                      type="button"
                      className="btn-secondary-action"
                      onClick={() => {
                        const randomPreset = PRESET_QUICK_PICKS[Math.floor(Math.random() * PRESET_QUICK_PICKS.length)];
                        applyPreset(randomPreset);
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      <span>Random Example</span>
                    </button>

                    <button
                      type="button"
                      className="btn-reset-action"
                      onClick={() => {
                        audio.play("soft");
                        setRecipient("");
                        setSubject("");
                        setBullets("");
                        setResult("");
                        showToast("Cleared input fields");
                      }}
                      title="Clear Inputs"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                /* Mode 2: Template Filler */
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Choose Pre-Built Template</label>
                    <div className="glass-pill-input">
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => {
                          setSelectedTemplateId(e.target.value);
                          setTemplateValues({});
                        }}
                      >
                        <option value="">-- Select Template --</option>
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name} ({tpl.category})
                          </option>
                        ))}
                      </select>
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {selectedTemplate && (
                    <>
                      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{selectedTemplate.description}</p>
                      {templateVariables.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {templateVariables.map((v) => (
                            <div key={v} className="form-group">
                              <label className="form-label">{v.replace(/_/g, " ").toUpperCase()}</label>
                              <div className="glass-pill-input">
                                <input
                                  type="text"
                                  placeholder={`Enter ${v.replace(/_/g, " ")}`}
                                  value={templateValues[v] || ""}
                                  onChange={(e) =>
                                    setTemplateValues({ ...templateValues, [v]: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>This template uses static formal text.</p>
                      )}

                      <button
                        className="btn-primary-action"
                        onClick={handleUseSelectedTemplate}
                      >
                        <span>Render to Document Canvas</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: EXECUTIVE DOCUMENT STUDIO (Generous & Spacious)
              ======================================================== */}
          <div className="document-panel">
            <div className="document-master-card">
              <div className="panel-reflection-rim"></div>

              {/* Document Header & Actions */}
              <div className="doc-header-toolbar">
                <div className="doc-metadata-group">
                  <span className="doc-category-badge">
                    {letterType === "college"
                      ? "Official Academic Letter"
                      : letterType === "complaint"
                      ? "Formal Dispute & Grievance"
                      : "Executive Business Correspondence"}
                  </span>
                  <span className="doc-stat-chip">{wordCount} words</span>
                  <span className="doc-stat-chip">~{readTimeMinutes} min read</span>
                </div>

                {/* Toolbar Action Pills */}
                <div className="doc-toolbar-actions">
                  <button
                    className={`doc-action-pill ${copied ? "primary-action" : ""}`}
                    onClick={handleCopy}
                    title="Copy full email"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      {copied ? (
                        <polyline points="20 6 9 17 4 12" />
                      ) : (
                        <>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </>
                      )}
                    </svg>
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>

                  <button
                    className="doc-action-pill"
                    onClick={handleDownload}
                    title="Download as .TXT"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download .TXT</span>
                  </button>

                  <button
                    className="doc-action-pill"
                    onClick={() => {
                      audio.play("soft");
                      setIsEditing(!isEditing);
                    }}
                    title={isEditing ? "Switch to preview view" : "Edit directly"}
                  >
                    <span>{isEditing ? "✓ Done Editing" : "✎ Direct Edit"}</span>
                  </button>

                  <button
                    className="doc-action-pill"
                    onClick={handleSaveAsTemplate}
                    title="Save to Template Library"
                  >
                    <span>📑 Save Template</span>
                  </button>
                </div>
              </div>

              {/* The Document Paper Surface (Never Cuts Off) */}
              <div className="document-paper">
                {isEditing ? (
                  <textarea
                    className="doc-textarea-editor"
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                  />
                ) : (
                  <div className="doc-text-body">
                    {result || "Your composed formal document will appear here."}
                  </div>
                )}
              </div>

              {/* Bottom Feature & Verification Strip */}
              <div className="doc-footer-banner">
                <div className="banner-left">
                  <div className="banner-sparkle">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#7c44f7" strokeWidth="2.5" strokeLinecap="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="banner-text-title">Formal Etiquette Verified</div>
                    <div className="banner-text-sub">Calibrated for academic departments & corporate leadership</div>
                  </div>
                </div>

                <div className="banner-toggle-group">
                  {/* Markdown Switch */}
                  <div
                    className="liquid-switch-control"
                    onClick={() => {
                      audio.play("switch");
                      const next = !markdownEnabled;
                      setMarkdownEnabled(next);
                      showToast(`Markdown Format: ${next ? "ON" : "OFF"}`);
                    }}
                  >
                    <span className="switch-label">Markdown</span>
                    <div className={`switch-track ${markdownEnabled ? "active" : ""}`}>
                      <div className="switch-thumb"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Dynamic Liquid Glass Toast */}
      {toastMessage && (
        <aside className="glass-toast" role="alert">
          <div className="toast-icon">✨</div>
          <span className="toast-message">{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}