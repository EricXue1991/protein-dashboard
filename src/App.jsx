import { useState, useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";

// ─── Mock Data Generation ────────────────────────────────────────────────────

function generateTSNEData(nPoints, offsetX = 0, offsetY = 0, spread = 5) {
  return Array.from({ length: nPoints }, () => ({
    x: (Math.random() - 0.5) * spread * 2 + offsetX,
    y: (Math.random() - 0.5) * spread * 2 + offsetY,
  }));
}

function generateReproducibleTSNE(nPoints, spread = 5, seed = 42) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: nPoints }, () => ({
    x: (rand() - 0.5) * spread * 2,
    y: (rand() - 0.5) * spread * 2,
  }));
}

const NON_REPRO_RUN1 = generateTSNEData(100, 0, 0, 12);
const NON_REPRO_RUN2 = NON_REPRO_RUN1.map((p) => ({
  x: p.x + (Math.random() - 0.5) * 2.5,
  y: p.y + (Math.random() - 0.5) * 2.5,
}));
const NON_REPRO_RUN3 = NON_REPRO_RUN1.map((p) => ({
  x: p.x + (Math.random() - 0.5) * 2.5,
  y: p.y + (Math.random() - 0.5) * 2.5,
}));

const REPRO_DATA = generateReproducibleTSNE(100, 12, 42);
const ESM_DATA = generateReproducibleTSNE(100, 8, 99);

const SPEED_DATA = {
  single: { unirep: 1.2, esm2: 0.05 },
  multi100: { unirep: 45.3, esm2: 1.8 },
};

// ─── Plotly Chart Component ─────────────────────────────────────────────────

function PlotlyScatter({ id, data, layout, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      Plotly.newPlot(ref.current, data, layout, {
        responsive: true,
        displayModeBar: false,
      });
    }
    return () => {
      if (ref.current) Plotly.purge(ref.current);
    };
  }, [data, layout]);
  return <div ref={ref} id={id} style={style} />;
}

// ─── Reusable UI Components ─────────────────────────────────────────────────

function MetricCard({ label, value, sub, accent = false }) {
  return (
    <div
      style={{
        background: accent
          ? "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)"
          : "#ffffff",
        border: accent ? "none" : "1px solid #e2e8f0",
        borderRadius: 14,
        padding: "28px 24px",
        textAlign: "center",
        flex: 1,
        minWidth: 180,
        boxShadow: accent
          ? "0 4px 20px rgba(3,105,161,0.2)"
          : "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 19,
          color: accent ? "rgba(255,255,255,0.75)" : "#94a3b8",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 10,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 43,
          fontWeight: 700,
          color: accent ? "#ffffff" : "#0f172a",
          fontFamily: "'Space Mono', monospace",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 19,
            color: accent ? "rgba(255,255,255,0.6)" : "#94a3b8",
            marginTop: 8,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 19,
            color: "#0284c7",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: 8,
            padding: "4px 12px",
            letterSpacing: "0.05em",
          }}
        >
          {number}
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(90deg, #bae6fd 0%, transparent 100%)",
          }}
        />
      </div>
      <h2
        style={{
          fontSize: 39,
          fontWeight: 300,
          color: "#0f172a",
          margin: 0,
          fontFamily: "'Instrument Serif', serif",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: 19,
            color: "#64748b",
            margin: "8px 0 0",
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Tag({ children, color = "#0284c7" }) {
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 23,
        color,
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: 6,
        padding: "3px 10px",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

// ─── Plot Configurations ────────────────────────────────────────────────────

const PLOT_COLORS = {
  run1: "#94a3b8",
  run2: "#f59e0b",
  run3: "#3b82f6",
};

const LIGHT_LAYOUT = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: {
    family: "JetBrains Mono, monospace",
    color: "#64748b",
    size: 16,
  },
  margin: { l: 50, r: 20, t: 40, b: 50 },
  xaxis: {
    gridcolor: "#f1f5f9",
    zerolinecolor: "#e2e8f0",
    title: { text: "t-SNE 1", font: { size: 17, color: "#94a3b8" } },
  },
  yaxis: {
    gridcolor: "#f1f5f9",
    zerolinecolor: "#e2e8f0",
    title: { text: "t-SNE 2", font: { size: 17, color: "#94a3b8" } },
  },
  showlegend: true,
  legend: {
    font: { size: 16, color: "#64748b" },
    bgcolor: "rgba(0,0,0,0)",
    x: 1,
    xanchor: "right",
    y: 1,
  },
};

function makeScatterTrace(points, name, color, size = 8) {
  return {
    x: points.map((p) => p.x),
    y: points.map((p) => p.y),
    mode: "markers",
    type: "scatter",
    name,
    marker: {
      color,
      size,
      opacity: 0.8,
      line: { width: 0.5, color: "rgba(255,255,255,0.8)" },
    },
    hovertemplate: `<b>${name}</b><br>x: %{x:.2f}<br>y: %{y:.2f}<extra></extra>`,
  };
}

// ─── API Configuration ──────────────────────────────────────────────────────
// Change this to your actual backend URL when ready
const API_BASE = "http://localhost:8000";

async function uploadFasta(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE}/uploads`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Upload failed");
  }
  return response.json();
}

async function submitJob(model, inputFileId) {
  const response = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, input_file_id: inputFileId }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Job submission failed");
  }
  return response.json();
}

async function fetchJobStatus(jobId) {
  const response = await fetch(`${API_BASE}/jobs/${jobId}`);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Failed to fetch job status");
  }
  return response.json();
}

async function fetchJobResult(jobId) {
  const response = await fetch(`${API_BASE}/jobs/${jobId}/result`);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Failed to fetch job result");
  }
  return response.json();
}

const buildFileUrl = (path) =>
  path ? `${API_BASE}/files?path=${encodeURIComponent(path)}` : null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function uploadSubmitAndWait(file, model) {
  const upload = await uploadFasta(file);
  const submit = await submitJob(model, upload.job_id);
  let status = await fetchJobStatus(submit.job_id);
  let attempts = 0;
  while (status.status !== "completed" && status.status !== "failed") {
    if (attempts > 20) {
      throw new Error("Job timed out");
    }
    await sleep(500);
    status = await fetchJobStatus(submit.job_id);
    attempts += 1;
  }
  if (status.status === "failed") {
    throw new Error(status.error || "Job failed");
  }
  const result = await fetchJobResult(submit.job_id);
  return {
    jobId: submit.job_id,
    resultPath: result.result_path,
    imagePath: result.image_path,
  };
}

// ─── Upload & Run Section Component ─────────────────────────────────────────

function UploadRunSection({ onResults }) {
  const [files, setFiles] = useState([]);
  const [selectedModel, setSelectedModel] = useState("both");
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [jobIds, setJobIds] = useState([]);
  const [useMock, setUseMock] = useState(true);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const isRunning = status === "running_unirep" || status === "running_esm2";
  const runUnirep = selectedModel === "both" || selectedModel === "unirep";
  const runEsm2 = selectedModel === "both" || selectedModel === "esm2";

  const statusConfig = {
    idle: {
      label: "Waiting for upload",
      color: "#94a3b8",
      bg: "#f8fafc",
      icon: "📁",
    },
    uploaded: {
      label: `${files.length} file${
        files.length !== 1 ? "s" : ""
      } uploaded — Ready to run`,
      color: "#0284c7",
      bg: "#f0f9ff",
      icon: "✅",
    },
    running_unirep: {
      label: "Running UniRep (mLSTM)...",
      color: "#d97706",
      bg: "#fffbeb",
      icon: "⏳",
    },
    running_esm2: {
      label: "Running ESM-2 (Transformer)...",
      color: "#2563eb",
      bg: "#eff6ff",
      icon: "⏳",
    },
    complete: {
      label: "Run complete — Results ready",
      color: "#059669",
      bg: "#ecfdf5",
      icon: "🎉",
    },
    error: {
      label: errorMsg || "Error occurred",
      color: "#dc2626",
      bg: "#fef2f2",
      icon: "❌",
    },
  };
  const currentStatus = statusConfig[status];

  const validExts = [".fasta", ".fa", ".txt"];
  const isValidFile = (f) =>
    validExts.some((ext) => f.name.toLowerCase().endsWith(ext));

  const addFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter(isValidFile);
    const invalid = Array.from(newFiles).filter((f) => !isValidFile(f));
    if (invalid.length > 0)
      setErrorMsg(
        `Skipped ${invalid.length} unsupported file(s). Use .fasta, .fa, or .txt`
      );
    if (valid.length > 0) {
      setFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        return [...prev, ...valid.filter((f) => !existingNames.has(f.name))];
      });
      setStatus("uploaded");
      setResults(null);
      setProgress(0);
      setJobIds([]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= 1) {
      setStatus("idle");
      setResults(null);
    }
  };

  const handleRun = async () => {
    if (files.length === 0) return;
    try {
      setErrorMsg("");
      setProgress(5);
      setJobIds([]);
      setResults(null);

      if (useMock) {
        if (runUnirep) {
          setStatus("running_unirep");
          setProgress(10);
          for (let i = 0; i < files.length; i++) {
            await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
            setProgress(
              10 + Math.round(((i + 1) / files.length) * (runEsm2 ? 40 : 85))
            );
          }
        }
        if (runEsm2) {
          setStatus("running_esm2");
          if (!runUnirep) setProgress(10);
          for (let i = 0; i < files.length; i++) {
            await new Promise((r) => setTimeout(r, 100 + Math.random() * 100));
            setProgress(
              (runUnirep ? 50 : 10) +
                Math.round(((i + 1) / files.length) * (runUnirep ? 45 : 85))
            );
          }
        }
        setProgress(100);
        setStatus("complete");
        const perFile = files.map((f) => {
          const base = f.name.replace(/\.\w+$/, "");
          return {
            name: f.name,
            unirep_h5: runUnirep ? `${base}_unirep_1900.h5` : null,
            esm2_h5: runEsm2 ? `${base}_esm2_1280.h5` : null,
            unirep_image_url: runUnirep
              ? "https://placehold.co/600x400/png?text=UniRep+t-SNE"
              : null,
            esm2_image_url: runEsm2
              ? "https://placehold.co/600x400/png?text=ESM-2+t-SNE"
              : null,
          };
        });
        setResults(perFile);
      onResults?.(perFile);
      onResults?.(perFile);
        onResults?.(perFile);
        return;
      }

      const perFileResults = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (runUnirep) {
          setStatus("running_unirep");
        } else {
          setStatus("running_esm2");
        }
        setProgress(
          10 + Math.round(((i + 1) / files.length) * (runEsm2 ? 40 : 85))
        );

        const jobResults = [];
        if (runUnirep) {
          const unirep = await uploadSubmitAndWait(file, "unirep");
          jobResults.push({ ...unirep, model: "unirep" });
        }
        if (runEsm2) {
          if (runUnirep) {
            setStatus("running_esm2");
          }
          const esm2 = await uploadSubmitAndWait(file, "esm2");
          jobResults.push({ ...esm2, model: "esm2" });
        }

        perFileResults.push({ file, jobResults });
        setProgress(
          (runUnirep ? 50 : 10) +
            Math.round(((i + 1) / files.length) * (runUnirep ? 45 : 85))
        );
      }

      setProgress(100);
      setStatus("complete");

      const aggregatedJobIds = perFileResults.flatMap((entry) =>
        entry.jobResults.map((result) => result.jobId)
      );
      setJobIds(aggregatedJobIds);

      const perFile = perFileResults.map(({ file, jobResults }) => {
        const base = file.name.replace(/\.\w+$/, "");
        const unirepResult = jobResults.find((r) => r.model === "unirep");
        const esm2Result = jobResults.find((r) => r.model === "esm2");
        return {
          name: file.name,
          unirep_h5: runUnirep ? `${base}_unirep_1900.h5` : null,
          esm2_h5: runEsm2 ? `${base}_esm2_1280.h5` : null,
          unirep_job_id: unirepResult?.jobId || null,
          esm2_job_id: esm2Result?.jobId || null,
          unirep_result_path: unirepResult?.resultPath || null,
          esm2_result_path: esm2Result?.resultPath || null,
          unirep_image_url: unirepResult?.imagePath
            ? buildFileUrl(unirepResult.imagePath)
            : null,
          esm2_image_url: esm2Result?.imagePath
            ? buildFileUrl(esm2Result.imagePath)
            : null,
        };
      });
      setResults(perFile);
    } catch (err) {
      setErrorMsg(err.message || "Failed to process");
      setStatus("error");
    }
  };

  const handleDownload = async (fileName, resultPath) => {
    if (!resultPath) {
      alert("Result not ready yet.");
      return;
    }
    const url = buildFileUrl(resultPath);
    if (!url) {
      alert("Invalid download URL");
      return;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "result.h5";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert(error.message || "Failed to download file");
    }
  };
  const handleReset = () => {
    setFiles([]);
    setStatus("idle");
    setProgress(0);
    setResults(null);
    setErrorMsg("");
    setJobIds([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pipelineSteps = [
    {
      step: `${files.length} file${files.length !== 1 ? "s" : ""} uploaded`,
      done: status !== "idle",
      active: false,
    },
    ...(runUnirep
      ? [
          {
            step: "UniRep embedding extraction",
            done: status === "running_esm2" || status === "complete",
            active: status === "running_unirep",
          },
        ]
      : []),
    ...(runEsm2
      ? [
          {
            step: "ESM-2 embedding extraction",
            done: status === "complete",
            active: status === "running_esm2",
          },
        ]
      : []),
    {
      step: "Results ready for download",
      done: status === "complete",
      active: false,
    },
  ];

  return (
    <section
      style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        padding: "60px 5vw",
      }}
    >
      <SectionTitle
        number="00"
        title="Run Embedding Extraction"
        subtitle="Upload one or more FASTA files to generate protein embeddings with UniRep and/or ESM-2"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* Left: Upload + Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => (!isRunning ? fileInputRef.current?.click() : null)}
            style={{
              background: dragOver ? "#f0f9ff" : "#ffffff",
              border: `2px dashed ${
                dragOver ? "#0284c7" : files.length > 0 ? "#a7f3d0" : "#cbd5e1"
              }`,
              borderRadius: 14,
              padding: "36px 32px",
              textAlign: "center",
              cursor: isRunning ? "default" : "pointer",
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".fasta,.fa,.txt"
              multiple
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <div style={{ fontSize: 39, marginBottom: 10 }}>
              {files.length > 0 ? "📄" : "📂"}
            </div>
            {files.length > 0 ? (
              <>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    color: "#0f172a",
                    marginBottom: 4,
                  }}
                >
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </div>
                <div style={{ fontSize: 17, color: "#64748b" }}>
                  {(files.reduce((s, f) => s + f.size, 0) / 1024).toFixed(1)} KB
                  total — Click to add more
                </div>
              </>
            ) : (
              <>
                <div
                  style={{ fontSize: 19, color: "#475569", marginBottom: 4 }}
                >
                  Drop FASTA files here or click to browse
                </div>
                <div style={{ fontSize: 17, color: "#94a3b8" }}>
                  Supports .fasta, .fa, .txt — Multiple files allowed
                </div>
              </>
            )}
          </div>

          {files.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 150,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "8px 14px",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 18 }}>📄</span>
                    <span
                      style={{
                        fontSize: 16,
                        color: "#334155",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {f.name}
                    </span>
                    <span style={{ fontSize: 15, color: "#94a3b8" }}>
                      {(f.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  {!isRunning && status !== "complete" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: 18,
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div>
            <div
              style={{
                fontSize: 16,
                color: "#64748b",
                marginBottom: 8,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Select Model
            </div>
            <div
              style={{
                display: "flex",
                gap: 0,
                background: "#ffffff",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                width: "fit-content",
              }}
            >
              {[
                { key: "both", label: "Both Models" },
                { key: "unirep", label: "UniRep Only" },
                { key: "esm2", label: "ESM-2 Only" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedModel(key)}
                  disabled={isRunning}
                  style={{
                    padding: "10px 20px",
                    fontSize: 17,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: selectedModel === key ? "#0284c7" : "#94a3b8",
                    background: selectedModel === key ? "#f0f9ff" : "#ffffff",
                    border: "none",
                    cursor: isRunning ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    fontWeight: selectedModel === key ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 16,
                color: "#64748b",
                marginBottom: 8,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Mode
            </div>
            <div
              style={{
                display: "flex",
                gap: 0,
                background: "#ffffff",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                width: "fit-content",
              }}
            >
              {[
                { key: true, label: "Mock" },
                { key: false, label: "Live API" },
              ].map(({ key, label }) => (
                <button
                  key={label}
                  onClick={() => setUseMock(key)}
                  disabled={isRunning}
                  style={{
                    padding: "10px 20px",
                    fontSize: 17,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: useMock === key ? "#0284c7" : "#94a3b8",
                    background: useMock === key ? "#f0f9ff" : "#ffffff",
                    border: "none",
                    cursor: isRunning ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    fontWeight: useMock === key ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleRun}
              disabled={files.length === 0 || isRunning}
              style={{
                padding: "14px 32px",
                fontSize: 18,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: "#ffffff",
                background:
                  files.length === 0 || isRunning
                    ? "#cbd5e1"
                    : "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                border: "none",
                borderRadius: 10,
                cursor:
                  files.length === 0 || isRunning ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow:
                  files.length > 0 && !isRunning
                    ? "0 4px 12px rgba(2,132,199,0.3)"
                    : "none",
              }}
            >
              {isRunning ? "Running..." : "Run Extraction"}
            </button>
            {(status === "complete" || status === "error") && (
              <button
                onClick={handleReset}
                style={{
                  padding: "14px 24px",
                  fontSize: 18,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#64748b",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            )}
          </div>
          {errorMsg && status !== "error" && (
            <div
              style={{
                fontSize: 15,
                color: "#d97706",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ⚠ {errorMsg}
            </div>
          )}
        </div>

        {/* Right: Status + Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              background: currentStatus.bg,
              border: `1px solid ${currentStatus.color}25`,
              borderRadius: 14,
              padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 26 }}>{currentStatus.icon}</span>
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  color: currentStatus.color,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {currentStatus.label}
              </span>
            </div>
            {(isRunning || status === "complete") && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    height: 8,
                    background: "#e2e8f0",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                      background:
                        status === "complete"
                          ? "#059669"
                          : "linear-gradient(90deg, #0284c7, #38bdf8)",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: "#94a3b8",
                    marginTop: 6,
                    textAlign: "right",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {progress}%
                </div>
              </div>
            )}
            {status !== "idle" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {pipelineSteps.map(({ step, done, active }, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: done
                          ? "#059669"
                          : active
                          ? "#0284c7"
                          : "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "#fff",
                        fontWeight: 700,
                        animation: active
                          ? "pulse 1.5s ease-in-out infinite"
                          : "none",
                      }}
                    >
                      {done ? "✓" : active ? "●" : ""}
                    </div>
                    <span
                      style={{
                        fontSize: 17,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: done
                          ? "#059669"
                          : active
                          ? "#0284c7"
                          : "#cbd5e1",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {results && results.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                maxHeight: 250,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: "#64748b",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Download Results (
                {results.reduce(
                  (n, r) => n + (r.unirep_h5 ? 1 : 0) + (r.esm2_h5 ? 1 : 0),
                  0
                )}{" "}
                files)
              </div>
              {results.map((r, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#94a3b8",
                      marginBottom: 6,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    📄 {r.name}
                  </div>
                  {r.unirep_h5 && (
                    <div
                      onClick={() =>
                        handleDownload(r.unirep_h5, r.unirep_result_path)
                      }
                      style={{
                        background: "#ffffff",
                        border: "1px solid #fde68a",
                        borderRadius: 10,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        marginBottom: r.esm2_h5 ? 6 : 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#f59e0b";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(245,158,11,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#fde68a";
                        e.currentTarget.style.boxShadow =
                          "0 1px 3px rgba(0,0,0,0.04)";
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {r.unirep_h5}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#94a3b8",
                            marginTop: 2,
                          }}
                        >
                          UniRep mLSTM · 1900-dim
                        </div>
                        {r.unirep_job_id && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#d97706",
                              marginTop: 4,
                            }}
                          >
                            Job ID: {r.unirep_job_id}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 15,
                          color: "#d97706",
                          fontWeight: 600,
                        }}
                      >
                        ↓ Download
                      </span>
                    </div>
                  )}
                  {r.esm2_h5 && (
                    <div
                      onClick={() => handleDownload(r.esm2_h5, r.esm2_result_path)}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #bfdbfe",
                        borderRadius: 10,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(59,130,246,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#bfdbfe";
                        e.currentTarget.style.boxShadow =
                          "0 1px 3px rgba(0,0,0,0.04)";
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {r.esm2_h5}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#94a3b8",
                            marginTop: 2,
                          }}
                        >
                          ESM-2 Transformer · 1280-dim
                        </div>
                        {r.esm2_job_id && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#2563eb",
                              marginTop: 4,
                            }}
                          >
                            Job ID: {r.esm2_job_id}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 15,
                          color: "#2563eb",
                          fontWeight: 600,
                        }}
                      >
                        ↓ Download
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </section>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function ProteinDashboard() {
  const [activeProteinMode, setActiveProteinMode] = useState("single");
  const [latestResults, setLatestResults] = useState([]);

  const nonReproPlotData = [
    makeScatterTrace(NON_REPRO_RUN1, "Run 1", PLOT_COLORS.run1),
    makeScatterTrace(NON_REPRO_RUN2, "Run 2", PLOT_COLORS.run2),
    makeScatterTrace(NON_REPRO_RUN3, "Run 3", PLOT_COLORS.run3),
  ];

  const reproPlotData = [
    makeScatterTrace(REPRO_DATA, "Run 1", PLOT_COLORS.run1),
    makeScatterTrace(REPRO_DATA, "Run 2", PLOT_COLORS.run2, 6),
    makeScatterTrace(REPRO_DATA, "Run 3", PLOT_COLORS.run3, 4),
  ];

  const esmPlotData = [
    makeScatterTrace(ESM_DATA, "Run 1", PLOT_COLORS.run1),
    makeScatterTrace(ESM_DATA, "Run 2", PLOT_COLORS.run2, 6),
    makeScatterTrace(ESM_DATA, "Run 3", PLOT_COLORS.run3, 4),
  ];

  const latestUnirepImage =
    latestResults.find((r) => r.unirep_image_url)?.unirep_image_url || null;
  const latestEsmImage =
    latestResults.find((r) => r.esm2_image_url)?.esm2_image_url || null;

  const speedMode = activeProteinMode === "single" ? "single" : "multi100";
  const speedPlotData = [
    {
      x: ["UniRep (mLSTM)", "ESM-2 (Transformer)"],
      y: [SPEED_DATA[speedMode].unirep, SPEED_DATA[speedMode].esm2],
      type: "bar",
      marker: {
        color: ["#f59e0b", "#3b82f6"],
        opacity: 0.85,
        line: { width: 0 },
      },
      hovertemplate: "<b>%{x}</b><br>%{y:.2f}s<extra></extra>",
    },
  ];

  const speedLayout = {
    ...LIGHT_LAYOUT,
    title: {
      text:
        activeProteinMode === "single"
          ? "Single Protein Inference"
          : "100 Proteins Inference",
      font: { size: 17, color: "#475569", family: "JetBrains Mono" },
    },
    yaxis: {
      ...LIGHT_LAYOUT.yaxis,
      title: { text: "Time (seconds)", font: { size: 17, color: "#94a3b8" } },
    },
    xaxis: { ...LIGHT_LAYOUT.xaxis, title: null },
    showlegend: false,
    bargap: 0.5,
  };

  const speedRatio =
    activeProteinMode === "single"
      ? (SPEED_DATA.single.unirep / SPEED_DATA.single.esm2).toFixed(0)
      : (SPEED_DATA.multi100.unirep / SPEED_DATA.multi100.esm2).toFixed(0);

  const plotTitle = (text) => ({
    text,
    font: { size: 16, color: "#94a3b8", family: "JetBrains Mono" },
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "'JetBrains Mono', monospace",
        overflowX: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Subtle Background Pattern ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.4,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Hero Section ── */}
      <header
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "80px 5vw 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <Tag>NEU Capstone Project</Tag>
          <Tag color="#d97706">Protein Engineering</Tag>
          <Tag color="#059669">Machine Learning</Tag>
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 60px)",
            fontWeight: 300,
            fontFamily: "'Instrument Serif', serif",
            lineHeight: 1.1,
            margin: 0,
            color: "#0f172a",
          }}
        >
          Protein Language Model
          <br />
          <span style={{ color: "#0284c7" }}>Evaluation & Comparison</span>
        </h1>
        <p
          style={{
            fontSize: 23,
            color: "#64748b",
            maxWidth: 700,
            lineHeight: 1.7,
            marginTop: 24,
          }}
        >
          Evaluating reproducibility, speed, and embedding quality of UniRep
          (mLSTM) and ESM-2 (Transformer) for protein feature extraction. 100
          randomized amino acid sequences derived from 5Y0M hydrolase.
        </p>

        <div
          style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap" }}
        >
          <MetricCard
            label="Sequences"
            value="100"
            sub="randomized from 5Y0M"
          />
          <MetricCard label="Models" value="2" sub="UniRep · ESM-2" />
          <MetricCard label="Replicas" value="6" sub="independent runs each" />
          <MetricCard
            label="Status"
            value="✓"
            sub="reproducibility confirmed"
            accent
          />
        </div>
      </header>

      {/* ── Upload & Run Section ── */}
      <UploadRunSection onResults={setLatestResults} />

      {/* ── Section 1: Reproducibility ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "60px 5vw",
        }}
      >
        <SectionTitle
          number="01"
          title="Reproducibility"
          subtitle="Multi-run embedding consistency validated via PCA → t-SNE dimensionality reduction"
        />

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}
        >
          {/* UniRep TF 1.15.0 */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #fde68a",
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                fontSize: 23,
                fontWeight: 600,
                color: "#d97706",
                margin: "0 0 8px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              UniRep (mLSTM)
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 23, color: "#64748b" }}>
                TensorFlow 2.18
              </span>
              <span
                style={{
                  fontSize: 19,
                  color: "#059669",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: 4,
                  padding: "3px 10px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                DETERMINISTIC
              </span>
            </div>
            {latestUnirepImage ? (
              <img
                src={latestUnirepImage}
                alt="UniRep t-SNE"
                style={{
                  width: "100%",
                  height: 400,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: "1px solid #fef3c7",
                  marginTop: 12,
                }}
              />
            ) : (
              <PlotlyScatter
                id="repro-tsne"
                data={reproPlotData}
                layout={{
                  ...LIGHT_LAYOUT,
                  title: plotTitle("t-SNE — All runs overlap"),
                }}
                style={{ width: "100%", height: 400 }}
              />
            )}
          </div>

          {/* ESM-2 */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #bfdbfe",
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                fontSize: 23,
                fontWeight: 600,
                color: "#2563eb",
                margin: "0 0 8px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ESM-2 (Transformer)
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 23, color: "#64748b" }}>
                PyTorch — Natively deterministic
              </span>
              <span
                style={{
                  fontSize: 19,
                  color: "#059669",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: 4,
                  padding: "3px 10px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                DETERMINISTIC
              </span>
            </div>
            {latestEsmImage ? (
              <img
                src={latestEsmImage}
                alt="ESM-2 t-SNE"
                style={{
                  width: "100%",
                  height: 400,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: "1px solid #bfdbfe",
                  marginTop: 12,
                }}
              />
            ) : (
              <PlotlyScatter
                id="esm-tsne"
                data={esmPlotData}
                layout={{
                  ...LIGHT_LAYOUT,
                  title: plotTitle("t-SNE — All runs identical"),
                }}
                style={{ width: "100%", height: 400 }}
              />
            )}
          </div>
        </div>
        <p
          style={{
            fontSize: 19,
            color: "#94a3b8",
            marginTop: 16,
            lineHeight: 1.7,
          }}
        >
          Both models produce bitwise-identical embeddings across multiple
          independent runs. Visualization pipeline:{" "}
          <span style={{ color: "#0284c7" }}>
            StandardScaler → PCA (95% variance) → t-SNE (perplexity=50,
            max_iter=10000, random_state=42)
          </span>
        </p>
      </section>

      {/* ── Section 2: Speed ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "60px 5vw",
        }}
      >
        <SectionTitle
          number="02"
          title="Inference Speed"
          subtitle="Wall-clock time comparison on V100 GPU"
        />

        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 32,
            background: "#ffffff",
            borderRadius: 10,
            overflow: "hidden",
            width: "fit-content",
            border: "1px solid #e2e8f0",
          }}
        >
          {["single", "multi"].map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveProteinMode(mode)}
              style={{
                padding: "10px 24px",
                fontSize: 23,
                fontFamily: "'JetBrains Mono', monospace",
                color: activeProteinMode === mode ? "#0284c7" : "#94a3b8",
                background: activeProteinMode === mode ? "#f0f9ff" : "#ffffff",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                fontWeight: activeProteinMode === mode ? 500 : 400,
              }}
            >
              {mode === "single" ? "Single Protein" : "100 Proteins"}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <PlotlyScatter
              id="speed-chart"
              data={speedPlotData}
              layout={speedLayout}
              style={{ width: "100%", height: 340 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <MetricCard
              label="Speed Advantage"
              value={`${speedRatio}×`}
              sub="ESM-2 faster than UniRep"
              accent
            />
            <MetricCard
              label="UniRep"
              value={`${SPEED_DATA[speedMode].unirep}s`}
              sub="mLSTM sequential processing"
            />
            <MetricCard
              label="ESM-2"
              value={`${SPEED_DATA[speedMode].esm2}s`}
              sub="Transformer parallel attention"
            />
          </div>
        </div>
        <p
          style={{
            fontSize: 19,
            color: "#94a3b8",
            marginTop: 16,
            lineHeight: 1.7,
          }}
        >
          LSTMs process tokens sequentially (O(n) steps), while Transformers
          compute attention in parallel. This architectural difference results
          in ESM-2 being ~25× faster at inference.
        </p>
      </section>

      {/* ── Section 3: Embedding Quality ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "60px 5vw",
        }}
      >
        <SectionTitle
          number="03"
          title="Embedding Quality"
          subtitle="Comparing representation characteristics between models"
        />

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          {/* UniRep Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #fde68a",
              borderRadius: 14,
              padding: 32,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#f59e0b",
                }}
              />
              <span
                style={{
                  fontSize: 23,
                  fontWeight: 500,
                  fontFamily: "'Space Mono', monospace",
                  color: "#0f172a",
                }}
              >
                UniRep
              </span>
              <Tag color="#d97706">mLSTM</Tag>
            </div>
            {[
              { label: "EMBEDDING DIM", value: "1,900", large: true },
              { label: "ARCHITECTURE", value: "Multiplicative LSTM (mLSTM)" },
              { label: "FRAMEWORK", value: "TensorFlow 2.18" },
              {
                label: "BITWISE MATCH",
                value: "100% (after fix)",
                green: true,
              },
              {
                label: "PCA PRE-REDUCTION",
                value: "Required (1900 → ~50 PCs at 95% variance)",
              },
            ].map(({ label, value, large, green }) => (
              <div key={label} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 23,
                    color: "#94a3b8",
                    marginBottom: 4,
                    letterSpacing: "0.06em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: large ? 28 : 14,
                    fontWeight: large ? 700 : 400,
                    color: green ? "#059669" : "#334155",
                    fontFamily: large
                      ? "'Space Mono', monospace"
                      : "'JetBrains Mono', monospace",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* ESM-2 Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #bfdbfe",
              borderRadius: 14,
              padding: 32,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#3b82f6",
                }}
              />
              <span
                style={{
                  fontSize: 23,
                  fontWeight: 500,
                  fontFamily: "'Space Mono', monospace",
                  color: "#0f172a",
                }}
              >
                ESM-2
              </span>
              <Tag color="#2563eb">Transformer</Tag>
            </div>
            {[
              { label: "EMBEDDING DIM", value: "1,280", large: true },
              {
                label: "ARCHITECTURE",
                value: "Transformer (33 layers, 650M params)",
              },
              { label: "FRAMEWORK", value: "PyTorch (ESM library)" },
              { label: "BITWISE MATCH", value: "100% (native)", green: true },
              {
                label: "PCA PRE-REDUCTION",
                value: "Recommended (1280 → ~40 PCs)",
              },
            ].map(({ label, value, large, green }) => (
              <div key={label} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 23,
                    color: "#94a3b8",
                    marginBottom: 4,
                    letterSpacing: "0.06em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: large ? 28 : 14,
                    fontWeight: large ? 700 : 400,
                    color: green ? "#059669" : "#334155",
                    fontFamily: large
                      ? "'Space Mono', monospace"
                      : "'JetBrains Mono', monospace",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Single vs Multi Protein ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "60px 5vw",
        }}
      >
        <SectionTitle
          number="04"
          title="Single vs. Multi-Protein Analysis"
          subtitle="How model behavior changes with input scale"
        />

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 23,
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                {[
                  "Metric",
                  "UniRep (1 seq)",
                  "UniRep (100 seq)",
                  "ESM-2 (1 seq)",
                  "ESM-2 (100 seq)",
                ].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "16px 20px",
                      textAlign: i === 0 ? "left" : "center",
                      color: "#64748b",
                      fontWeight: 500,
                      fontSize: 23,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Reproducible", "✓ (TF 1.15)", "✓ (TF 1.15)", "✓", "✓"],
                ["Inference Time", "1.2s", "45.3s", "0.05s", "1.8s"],
                ["Embedding Dim", "1900", "1900", "1280", "1280"],
                ["PCA Required", "Yes", "Yes", "Recommended", "Recommended"],
                ["GPU Memory", "~2 GB", "~4 GB", "~3 GB", "~5 GB"],
              ].map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    borderBottom: ri < 4 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: "14px 20px",
                        textAlign: ci === 0 ? "left" : "center",
                        color:
                          ci === 0
                            ? "#475569"
                            : cell === "✓" || cell === "✓ (TF 1.15)"
                            ? "#059669"
                            : "#334155",
                        fontWeight: ci === 0 ? 500 : 400,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p
          style={{
            fontSize: 19,
            color: "#94a3b8",
            marginTop: 16,
            lineHeight: 1.7,
          }}
        >
          Both models maintain reproducibility regardless of input size. ESM-2's
          Transformer architecture scales more efficiently with batch size due
          to parallelized attention.
        </p>
      </section>

      {/* ── Section 5: Pipeline ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "60px 5vw",
        }}
      >
        <SectionTitle
          number="05"
          title="Visualization Pipeline"
          subtitle="Correct workflow for high-dimensional embedding visualization"
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { label: "FASTA Input", detail: "Protein sequences", icon: "📄" },
            { label: "Model", detail: "UniRep / ESM-2", icon: "🧠" },
            { label: "Embeddings", detail: "1900d / 1280d", icon: "📊" },
            {
              label: "StandardScaler",
              detail: "Normalize features",
              icon: "⚖️",
            },
            { label: "PCA", detail: "95% variance", icon: "📉" },
            { label: "t-SNE", detail: "2D projection", icon: "🎯" },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "20px 24px",
                  textAlign: "center",
                  minWidth: 130,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#bae6fd";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(2,132,199,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ fontSize: 29, marginBottom: 8 }}>{step.icon}</div>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    color: "#0f172a",
                    marginBottom: 4,
                  }}
                >
                  {step.label}
                </div>
                <div style={{ fontSize: 18, color: "#94a3b8" }}>
                  {step.detail}
                </div>
              </div>
              {i < 5 && (
                <div
                  style={{ color: "#cbd5e1", fontSize: 25, padding: "0 10px" }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "40px 5vw 60px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 23, color: "#64748b" }}>
            Northeastern University · Capstone Project 5
          </div>
          <div style={{ fontSize: 23, color: "#94a3b8", marginTop: 4 }}>
            Protein Language Model Evaluation & Enhancement
          </div>
        </div>
        <a
          href="https://github.com/serenachen0/Capstone"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 19,
            color: "#0284c7",
            textDecoration: "none",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          GitHub →
        </a>
      </footer>
    </div>
  );
}
