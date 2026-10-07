"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { extractVariables, fillTemplate, CURATED_TEMPLATES } from "../../lib/template";
import { useTemplates, saveTemplatesToStorage } from "../../lib/storage";

export default function TemplatesPage() {
  const templates = useTemplates();
  const initialTemplate = CURATED_TEMPLATES[0] || {};
  const [selectedId, setSelectedId] = useState(initialTemplate.id || "");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Current editing state
  const [templateName, setTemplateName] = useState(initialTemplate.name || "");
  const [templateCategory, setTemplateCategory] = useState(initialTemplate.category || "Academic");
  const [templateDesc, setTemplateDesc] = useState(initialTemplate.description || "");
  const [templateText, setTemplateText] = useState(initialTemplate.text || "");
  const [fillValues, setFillValues] = useState({});

  // Incoming shared template banner
  const [incoming, setIncoming] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2600);
  }, []);

  // Check URL search parameters for shared template on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get("share");
    if (shared) {
      try {
        const decoded = JSON.parse(decodeURIComponent(shared));
        if (decoded && decoded.name && decoded.text) {
          const timer = setTimeout(() => setIncoming(decoded), 50);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.warn("Invalid shared template link:", e);
      }
    }
  }, []);

  // Sync selection change to editor fields
  function handleSelectTemplate(tpl) {
    setSelectedId(tpl.id);
    setTemplateName(tpl.name);
    setTemplateCategory(tpl.category || "Academic");
    setTemplateDesc(tpl.description || "");
    setTemplateText(tpl.text);
    setFillValues({});
  }

  function handleCreateNew() {
    const newId = "custom-" + Date.now();
    setSelectedId(newId);
    setTemplateName("Untitled Formal Template");
    setTemplateCategory("Academic");
    setTemplateDesc("Custom reusable formal document structure.");
    setTemplateText("Date: {{date}}\n\nTo,\n{{recipient_title}}\n{{organization}}\n\nSubject: {{subject}}\n\nRespected Sir/Madam,\n\nI am writing to formally request {{request_details}}.\n\nYours faithfully,\n{{your_name}}");
    setFillValues({});
    showToast("Created new draft template ✨");
  }

  function handleSave() {
    if (!templateName.trim()) {
      showToast("Please provide a template title");
      return;
    }
    const exists = templates.some((t) => t.id === selectedId);
    let updated;
    const itemData = {
      id: selectedId || "custom-" + Date.now(),
      name: templateName.trim(),
      category: templateCategory,
      description: templateDesc.trim() || "Custom reusable letter template.",
      text: templateText,
    };

    if (exists) {
      updated = templates.map((t) => (t.id === selectedId ? itemData : t));
    } else {
      updated = [itemData, ...templates];
    }

    saveTemplatesToStorage(updated);
    showToast("Template saved to library! 📑");
  }

  function handleDelete(id) {
    const filtered = templates.filter((t) => t.id !== id);
    saveTemplatesToStorage(filtered);
    if (filtered.length > 0) {
      handleSelectTemplate(filtered[0]);
    } else {
      handleCreateNew();
    }
    showToast("Template removed");
  }

  async function handleShare(tpl) {
    try {
      const payload = JSON.stringify({
        name: tpl.name,
        category: tpl.category,
        description: tpl.description,
        text: tpl.text,
      });
      const link = `${window.location.origin}/templates?share=${encodeURIComponent(payload)}`;
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      showToast("Shareable link copied to clipboard! 📋");
      setTimeout(() => setLinkCopied(false), 2200);
    } catch {
      showToast("Unable to copy share link");
    }
  }

  function handleImportShared() {
    if (!incoming) return;
    const newTpl = {
      id: "shared-" + Date.now(),
      name: incoming.name,
      category: incoming.category || "General",
      description: incoming.description || "Shared by colleague.",
      text: incoming.text,
    };
    const updated = [newTpl, ...templates];
    saveTemplatesToStorage(updated);
    handleSelectTemplate(newTpl);
    setIncoming(null);
    window.history.replaceState(null, "", "/templates");
    showToast(`Imported shared template: ${incoming.name}`);
  }

  // Live variable analysis
  const currentVariables = useMemo(() => extractVariables(templateText), [templateText]);
  const livePreview = useMemo(() => fillTemplate(templateText, fillValues), [templateText, fillValues]);

  // Filtered templates list
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory = activeCategory === "all" || t.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = searchQuery.trim() === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templates, activeCategory, searchQuery]);

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

      {/* Clean Top Header */}
      <header className="clean-header">
        <div className="brand-section">
          <a
            href="/"
            className="glass-nav-btn"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", "/");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            title="Return to AI Document Generator"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Generator</span>
          </a>

          <div className="brand-badge">
            <div className="brand-orb"></div>
            <span>Template Studio</span>
          </div>

          <div className="engine-pill">
            <span className="live-dot"></span>
            <span>Variable Mapping</span>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="btn-primary-action" style={{ width: "auto", padding: "0 20px" }} onClick={handleCreateNew}>
            <span>+ New Template</span>
          </button>
        </div>
      </header>

      {/* Main Studio Two-Column Grid */}
      <main className="workspace-wrapper">
        {/* Incoming Shared Template Alert Banner */}
        {incoming && (
          <div className="glass-panel-card" style={{ marginBottom: "24px", borderColor: "#6366f1" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Shared Template Received: {incoming.name}</h3>
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>A colleague shared this standardized formal template with you.</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn-editor-action save" onClick={handleImportShared}>
                  <span>Save to Library</span>
                </button>
                <button type="button" className="btn-editor-action" onClick={() => setIncoming(null)}>
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="templates-layout">
          {/* Left Column: Template Navigator & Categories */}
          <aside className="template-list-col">
            <div className="template-card-container">
              {/* Search Input */}
              <input
                type="text"
                className="template-search-input"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Category Filter Pills */}
              <div className="chips-grid">
                {[
                  { id: "all", label: "All" },
                  { id: "academic", label: "Academic" },
                  { id: "corporate", label: "Corporate" },
                  { id: "legal & consumer", label: "Dispute" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`tone-chip-btn ${activeCategory === c.id ? "active" : ""}`}
                    onClick={() => setActiveCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Template Items List */}
              <div className="template-cards-list">
                {filteredTemplates.length === 0 ? (
                  <div style={{ padding: "32px 12px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No matching templates found.
                  </div>
                ) : (
                  filteredTemplates.map((t) => {
                    const isSelected = t.id === selectedId;
                    const vars = extractVariables(t.text);
                    return (
                      <div
                        key={t.id}
                        className={`template-card-item ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectTemplate(t)}
                      >
                        <div className="template-item-top">
                          <span className="template-item-name">{t.name}</span>
                          <span className="template-item-badge">{t.category || "General"}</span>
                        </div>
                        <span className="template-item-desc">{t.description}</span>
                        <div className="template-item-meta">
                          <span>{vars.length} variables detected</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* Right Column: Template Editor & Live Fill Canvas */}
          <section className="template-editor-col">
            <div className="template-editor-card">
              {/* Header with Title, Category, and Actions */}
              <div className="editor-header-bar">
                <div className="editor-title-inputs">
                  <div className="editor-title-row">
                    <input
                      type="text"
                      className="editor-title-field"
                      placeholder="Template Name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                    <select
                      className="glass-category-select"
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                    >
                      <option value="Academic">Academic</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Legal & Consumer">Legal & Consumer</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    className="editor-desc-field"
                    placeholder="Brief description or purpose of this template"
                    value={templateDesc}
                    onChange={(e) => setTemplateDesc(e.target.value)}
                  />
                </div>

                <div className="editor-actions-group">
                  <button
                    type="button"
                    className="btn-editor-action"
                    onClick={() => handleShare({ name: templateName, category: templateCategory, description: templateDesc, text: templateText })}
                  >
                    <span>{linkCopied ? "✓ Link Copied" : "🔗 Share Link"}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-editor-action danger"
                    onClick={() => handleDelete(selectedId)}
                    title="Delete template"
                  >
                    <span>🗑 Delete</span>
                  </button>

                  <button
                    type="button"
                    className="btn-editor-action save"
                    onClick={handleSave}
                  >
                    <span>✓ Save Changes</span>
                  </button>
                </div>
              </div>

              {/* Template Raw Text Editor */}
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Template Body & Syntax</label>
                  <span className="form-hint">Use double braces for variables, e.g. {"{{recipient_name}}"}</span>
                </div>
                <textarea
                  rows={7}
                  className="template-body-textarea"
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                />
              </div>

              {/* Detected Variables Tags */}
              <div className="detected-variables-box">
                <span className="form-label">Detected Variables ({currentVariables.length})</span>
                <div className="chips-grid">
                  {currentVariables.length === 0 ? (
                    <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                      No variables detected. Add {"{{variable_name}}"} to create fillable slots.
                    </span>
                  ) : (
                    currentVariables.map((v) => (
                      <span key={v} className="variable-badge-tag">
                        {"{{"} {v} {"}}"}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Interactive Split Testing Workspace */}
              {currentVariables.length > 0 && (
                <div style={{ marginTop: "12px", paddingTop: "18px", borderTop: "1px solid rgba(255, 255, 255, 0.55)" }}>
                  <div style={{ marginBottom: "14px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>Interactive Fill & Real-Time Test</h4>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fill in sample values on the left to see the instant live document preview on the right.</p>
                  </div>

                  <div className="interactive-test-workspace">
                    {/* Left: Scrollable Variable Inputs */}
                    <div className="variables-test-scroll">
                      {currentVariables.map((v) => (
                        <div key={v} className="form-group">
                          <label className="form-hint" style={{ fontWeight: "700", textTransform: "uppercase" }}>
                            {v.replace(/_/g, " ")}
                          </label>
                          <div className="glass-pill-input" style={{ height: "40px" }}>
                            <input
                              type="text"
                              placeholder={`Enter ${v.replace(/_/g, " ")}`}
                              value={fillValues[v] || ""}
                              onChange={(e) => setFillValues({ ...fillValues, [v]: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right: Rendered Document Paper */}
                    <div className="document-paper" style={{ minHeight: "260px" }}>
                      <div className="doc-category-badge" style={{ alignSelf: "flex-start", marginBottom: "12px" }}>
                        Live Rendered Preview
                      </div>
                      <div className="doc-text-body">{livePreview}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Floating Glass Toast */}
      {toastMessage && (
        <aside className="glass-toast" role="alert">
          <div className="toast-icon">✨</div>
          <span className="toast-message">{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}