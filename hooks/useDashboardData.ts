'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Types ─── */

export type ServiceStatus = 'ok' | 'amber' | 'critical';
export type AnomalyLevel = 'nominal' | 'elevated' | 'critical';
export type PipelineStepState = 'idle' | 'running' | 'done' | 'failed' | 'retry';

export interface HistoryEntry {
  state: boolean;
  toggled_at: string;
  region: string;
  latency_ms: number;
}

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
}

export interface PipelineStep {
  label: string;
  state: PipelineStepState;
}

export interface LogEntry {
  time: string;
  text: string;
  type: 'info' | 'toggle' | 'pipeline' | 'warn' | 'error' | 'system';
}

export interface DashboardData {
  /* Core state */
  isOn: boolean;
  toggleCount: number;
  lastRegion: string;
  history: HistoryEntry[];
  isToggling: boolean;

  /* Derived metrics */
  latencyP50: number;
  latencyP99: number;
  connectedRegions: string[];
  latencyChartData: number[];
  regionDistribution: { region: string; count: number; pct: number }[];
  toggleRatePerHour: number;
  uptime: number;
  lastLatency: number;

  /* Simulated infra */
  memoryMb: number;
  cpuPct: number;
  dbPool: number;
  dbPoolMax: number;
  cacheHitRate: number;
  edgeNodes: number;

  /* Health + anomaly */
  services: ServiceHealth[];
  anomaly: AnomalyLevel;

  /* AI prediction */
  aiPrediction: string;
  aiConfidence: number;

  /* Pipeline */
  pipeline: PipelineStep[];
  pipelineRunning: boolean;

  /* Logs */
  logs: LogEntry[];

  /* Easter egg */
  teapotVisible: boolean;

  /* Actions */
  handleToggle: () => void;
}

/* ─── Constants ─── */

const REGIONS = ['iad1', 'sfo1', 'cdg1', 'hnd1', 'gru1', 'sin1', 'dub1', 'syd1'];

const PIPELINE_LABELS = [
  'Git Checkout',
  'Deps Install',
  'Lint',
  'Type Check',
  'Unit Tests',
  'Security Scan',
  'Build',
  'Bundle Analyze',
  'Docker Build',
  'E2E Tests',
  'Deploy Staging',
  'Deploy Prod',
];

const AI_PREDICTIONS = [
  'Next toggle predicted in ~47s based on behavioral clustering',
  'Toggle frequency suggests user is evaluating latency variance',
  'Pattern analysis: 73% chance next action is OFF within 12s',
  'Behavioral model: user exhibits "rapid validation" archetype',
  'Anomaly: toggle interval deviates 2.1 sigma from baseline',
  'Prediction engine suggests a coffee break in 3 min',
  'Neural pathway confidence: user is testing rate limiting',
  'Toggle velocity trending upward. Escalation probability: low.',
  'AI consensus: this light switch does not need AI predictions',
  'Model uncertainty high. Requesting 47 more toggles for calibration.',
  'Latency-adjusted prediction: user prefers ON state 61% of time',
  'Deep learning model v47.3: boolean optimization converging',
];

/* ─── Helpers ─── */

function ts(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function jitter(base: number, range: number): number {
  return base + (Math.random() - 0.5) * 2 * range;
}

/* ─── Hook ─── */

export function useDashboardData(): DashboardData {
  /* Core state from API */
  const [isOn, setIsOn] = useState(false);
  const [toggleCount, setToggleCount] = useState(0);
  const [lastRegion, setLastRegion] = useState('---');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isToggling, setIsToggling] = useState(false);
  const [lastLatency, setLastLatency] = useState(0);

  /* Simulated infra */
  const [memoryMb, setMemoryMb] = useState(247);
  const [cpuPct, setCpuPct] = useState(4);
  const [dbPool, setDbPool] = useState(5);
  const [cacheHitRate, setCacheHitRate] = useState(94);
  const [edgeNodes, setEdgeNodes] = useState(47);

  /* Services */
  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'Toggle API', status: 'ok' },
    { name: 'State Sync', status: 'ok' },
    { name: 'Neon Postgres', status: 'ok' },
    { name: 'Edge Cache', status: 'ok' },
    { name: 'AI Engine', status: 'ok' },
    { name: 'Audit Logger', status: 'ok' },
  ]);

  /* AI */
  const [aiPrediction, setAiPrediction] = useState('Awaiting initial toggle data for model calibration...');
  const [aiConfidence, setAiConfidence] = useState(0);

  /* Pipeline */
  const [pipeline, setPipeline] = useState<PipelineStep[]>(
    PIPELINE_LABELS.map((label) => ({ label, state: 'idle' as PipelineStepState }))
  );
  const [pipelineRunning, setPipelineRunning] = useState(false);

  /* Logs */
  const [logs, setLogs] = useState<LogEntry[]>([]);

  /* Easter egg */
  const [teapotVisible, setTeapotVisible] = useState(false);

  /* Refs for toggle counting */
  const localToggleCount = useRef(0);
  const pipelineRef = useRef(false);

  /* ─── Log helper ─── */
  const addLog = useCallback((text: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => {
      const next = [...prev, { time: ts(), text, type }];
      return next.length > 80 ? next.slice(-80) : next;
    });
  }, []);

  /* ─── Init ─── */
  useEffect(() => {
    const bootLogs: [string, LogEntry['type']][] = [
      ['[BOOT] DIV//CENTER v4.2.0 initializing...', 'system'],
      ['[BOOT] Loading 47 microservices...', 'system'],
      ['[BOOT] Connecting to Neon Postgres (us-east-1)...', 'system'],
      ['[BOOT] Edge cache warming across 47 PoPs...', 'system'],
      ['[BOOT] AI prediction engine loaded (model: toggle-bert-v47)', 'system'],
      ['[BOOT] Rate limiter: 10 req/30s per IP', 'system'],
      ['[BOOT] Anomaly detection: nominal', 'system'],
      ['[BOOT] Dashboard ready. All systems operational.', 'system'],
    ];

    bootLogs.forEach(([text, type], i) => {
      setTimeout(() => addLog(text, type), i * 180);
    });

    fetch('/api/init', { method: 'POST' }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Poll /api/state every 2s ─── */
  useEffect(() => {
    const poll = () => {
      fetch('/api/state')
        .then((r) => r.json())
        .then((data: { isOn: boolean; toggleCount: number; lastRegion: string; history: HistoryEntry[] }) => {
          setIsOn(data.isOn);
          setToggleCount(data.toggleCount);
          if (data.lastRegion) setLastRegion(data.lastRegion);
          if (data.history) setHistory(data.history);
        })
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, []);

  /* ─── Simulate infra metrics every 3s ─── */
  useEffect(() => {
    const id = setInterval(() => {
      setMemoryMb((prev) => Math.round(clamp(jitter(prev, 20), 200, 480)));
      setCpuPct((prev) => {
        if (pipelineRef.current) return Math.round(clamp(jitter(prev, 12), 55, 92));
        return Math.round(clamp(jitter(prev, 4), 2, 30));
      });
      setDbPool((prev) => Math.round(clamp(jitter(prev, 4), 3, 47)));
      setCacheHitRate((prev) => parseFloat(clamp(jitter(prev, 1.5), 88, 98).toFixed(1)));
      setEdgeNodes(Math.random() < 0.08 ? 46 : 47);

      /* Occasionally flicker a service to amber */
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          status: Math.random() < 0.04 ? 'amber' : 'ok',
        })) as ServiceHealth[]
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  /* ─── Pipeline runner ─── */
  const runPipeline = useCallback(() => {
    if (pipelineRef.current) return;
    pipelineRef.current = true;
    setPipelineRunning(true);
    addLog('[CI/CD] Pipeline triggered by toggle threshold', 'pipeline');

    setPipeline(PIPELINE_LABELS.map((label) => ({ label, state: 'idle' })));

    let step = 0;
    const advance = () => {
      if (step >= PIPELINE_LABELS.length) {
        pipelineRef.current = false;
        setPipelineRunning(false);
        addLog('[CI/CD] Pipeline complete. All 12 stages passed.', 'pipeline');
        return;
      }

      const currentStep = step;
      setPipeline((prev) =>
        prev.map((s, i) => (i === currentStep ? { ...s, state: 'running' } : s))
      );
      addLog(`[CI/CD] Stage ${currentStep + 1}/12: ${PIPELINE_LABELS[currentStep]}...`, 'pipeline');

      const delay = 600 + Math.random() * 800;

      /* Security Scan (index 5) occasionally retries */
      if (currentStep === 5 && Math.random() < 0.5) {
        setTimeout(() => {
          setPipeline((prev) =>
            prev.map((s, i) => (i === currentStep ? { ...s, state: 'retry' } : s))
          );
          addLog('[CI/CD] Security Scan: CVE-2024-0000 false positive, retrying...', 'warn');
          setTimeout(() => {
            setPipeline((prev) =>
              prev.map((s, i) => (i === currentStep ? { ...s, state: 'done' } : s))
            );
            addLog('[CI/CD] Security Scan: passed on retry', 'pipeline');
            step++;
            advance();
          }, 900);
        }, delay);
        return;
      }

      setTimeout(() => {
        setPipeline((prev) =>
          prev.map((s, i) => (i === currentStep ? { ...s, state: 'done' } : s))
        );
        step++;
        advance();
      }, delay);
    };

    advance();
  }, [addLog]);

  /* ─── Toggle handler ─── */
  const handleToggle = useCallback(() => {
    if (isToggling) return;
    setIsToggling(true);

    fetch('/api/toggle', { method: 'POST' })
      .then((r) => {
        if (r.status === 429) {
          addLog('[WARN] Rate limited. Max 10 toggles per 30s.', 'warn');
          throw new Error('rate limited');
        }
        return r.json();
      })
      .then((data: { isOn: boolean; toggleCount: number; latencyMs: number; region: string }) => {
        setIsOn(data.isOn);
        setToggleCount(data.toggleCount);
        setLastLatency(data.latencyMs);
        setLastRegion(data.region);
        addLog(
          `[TOGGLE] State: ${data.isOn ? 'ON' : 'OFF'} | Latency: ${data.latencyMs}ms | Region: ${data.region}`,
          'toggle'
        );

        localToggleCount.current++;

        /* AI prediction update */
        setAiPrediction(AI_PREDICTIONS[localToggleCount.current % AI_PREDICTIONS.length]);
        setAiConfidence(Math.round(55 + Math.random() * 40));

        /* Teapot after 7 */
        if (localToggleCount.current >= 7) {
          setTeapotVisible(true);
        }

        /* Pipeline every 5th toggle */
        if (localToggleCount.current % 5 === 0) {
          runPipeline();
        }
      })
      .catch(() => {})
      .finally(() => setIsToggling(false));
  }, [isToggling, addLog, runPipeline]);

  /* ─── Derived metrics ─── */
  const latencies = history.map((h) => h.latency_ms).filter(Boolean);
  const latencyP50 = percentile(latencies, 50);
  const latencyP99 = percentile(latencies, 99);

  const regionCounts: Record<string, number> = {};
  history.forEach((h) => {
    if (h.region) regionCounts[h.region] = (regionCounts[h.region] || 0) + 1;
  });
  const connectedRegions = Object.keys(regionCounts).length > 0 ? Object.keys(regionCounts) : REGIONS.slice(0, 3);
  const totalRegionEntries = Object.values(regionCounts).reduce((a, b) => a + b, 0) || 1;
  const regionDistribution = Object.entries(regionCounts)
    .map(([region, count]) => ({ region, count, pct: Math.round((count / totalRegionEntries) * 100) }))
    .sort((a, b) => b.count - a.count);

  /* Latency chart: 12 bars from history or simulated */
  const latencyChartData: number[] = [];
  for (let i = 0; i < 12; i++) {
    if (i < latencies.length) {
      latencyChartData.push(latencies[i]);
    } else {
      latencyChartData.push(Math.round(40 + Math.random() * 60));
    }
  }

  /* Toggle rate: estimate from history timestamps */
  let toggleRatePerHour = 0;
  if (history.length >= 2) {
    const first = new Date(history[0].toggled_at).getTime();
    const last = new Date(history[history.length - 1].toggled_at).getTime();
    const spanHours = (last - first) / 3_600_000;
    if (spanHours > 0) {
      toggleRatePerHour = Math.round(history.length / spanHours);
    }
  }

  /* Uptime: always impressive */
  const uptime = 99.97;

  /* Anomaly detection */
  let anomaly: AnomalyLevel = 'nominal';
  if (cpuPct > 70 || latencyP99 > 300) anomaly = 'elevated';
  if (cpuPct > 85 || latencyP99 > 500) anomaly = 'critical';

  return {
    isOn,
    toggleCount,
    lastRegion,
    history,
    isToggling,
    latencyP50,
    latencyP99,
    connectedRegions,
    latencyChartData,
    regionDistribution,
    toggleRatePerHour,
    uptime,
    lastLatency,
    memoryMb,
    cpuPct,
    dbPool,
    dbPoolMax: 50,
    cacheHitRate,
    edgeNodes,
    services,
    anomaly,
    aiPrediction,
    aiConfidence,
    pipeline,
    pipelineRunning,
    logs,
    teapotVisible,
    handleToggle,
  };
}
