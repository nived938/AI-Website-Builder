import fs from "fs";
import path from "path";
import { CreditBalance, CreditLedgerEntry, creditLedgerService } from "../billing/ledger";
import { PLANS } from "../billing/plans";

export interface ProjectRecord {
  id: string;
  userId: string;
  name: string;
  description: string;
  framework: "html" | "react" | "nextjs";
  status: "draft" | "published" | "archived";
  previewUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFileRecord {
  id: string;
  projectId: string;
  path: string;
  name: string;
  content: string;
  sizeBytes: number;
  mimeType: string;
  updatedAt: string;
}

export interface CheckpointRecord {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  files: Record<string, string>;
  createdAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  projectId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tokenCount: number;
  createdAt: string;
}

export interface WebSourceRecord {
  id: string;
  projectId: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  searchQuery: string;
  retrievalDate: string;
}

// Persistent Storage File for Local / Test Environments
const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

interface DataStoreSchema {
  projects: Record<string, ProjectRecord>;
  files: Record<string, ProjectFileRecord>;
  checkpoints: Record<string, CheckpointRecord>;
  conversations: Record<string, { id: string; projectId: string; userId: string; title: string }>;
  messages: Record<string, MessageRecord>;
  memories: Record<string, { summary: string; decisions: string[]; tasks: string[] }>;
  summaries: Record<string, { summary: string; decisions: string[] }>;
  creditAccounts: Record<string, CreditBalance>;
  ledger: CreditLedgerEntry[];
  subscriptions: Record<string, { planId: string; status: string; billingCycle: string; isSimulated: boolean; periodEnd: string }>;
  webSources: WebSourceRecord[];
  assets: Array<{ id: string; projectId: string; fileName: string; fileSize: number; fileType: string; url: string; createdAt: string }>;
}

function loadStore(): DataStoreSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(STORE_FILE)) {
    try {
      const data = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(data);
    } catch {
      // If corrupted, initialize fresh
    }
  }

  // Initial Seed Data
  const demoUserId = "usr_alex_vance";
  const defaultStore: DataStoreSchema = {
    projects: {
      "proj_aura_spatial": {
        id: "proj_aura_spatial",
        userId: demoUserId,
        name: "Aura Spatial Labs",
        description: "Next-generation spatial audio acoustics and planar driver hardware showcase",
        framework: "html",
        status: "published",
        previewUrl: "/preview/aura-spatial-labs",
        thumbnailUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 60000 * 12).toISOString(),
      },
      "proj_cyber_vault": {
        id: "proj_cyber_vault",
        userId: demoUserId,
        name: "CyberVault Security",
        description: "Zero-knowledge decentralized enclave encryption and key management",
        framework: "html",
        status: "published",
        previewUrl: "/preview/cybervault",
        thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      "proj_zenith_fintech": {
        id: "proj_zenith_fintech",
        userId: demoUserId,
        name: "Zenith FinTech",
        description: "Autonomous treasury routing and cross-border currency settlement interface",
        framework: "html",
        status: "draft",
        previewUrl: "/preview/zenith",
        thumbnailUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
    },
    files: {
      "file_aura_index": {
        id: "file_aura_index",
        projectId: "proj_aura_spatial",
        path: "index.html",
        name: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aura Spatial Labs — Sound in Four Dimensions</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
</head>
<body class="bg-deep text-porcelain">
  <header class="navbar">
    <div class="logo">
      <span class="v-mark">V</span> AURA SPATIAL
    </div>
    <nav>
      <a href="#drivers">Planar Drivers</a>
      <a href="#calibration">Calibration</a>
      <a href="#specifications">Specs</a>
    </nav>
    <button class="btn-primary">Reserve Studio Unit</button>
  </header>

  <main class="hero">
    <div class="badge">AURA STUDIO V2.4 • ACOUSTIC MESH</div>
    <h1>Sound in <span class="highlight">Four Dimensions</span>.</h1>
    <p class="subtitle">Ultra-low distortion planar magnetic drivers paired with real-time biometric room calibration.</p>
    
    <div class="cta-row">
      <button class="btn-primary">Order Reference Unit</button>
      <button class="btn-ghost">Listen Acoustics ▶</button>
    </div>

    <div class="visualizer-container">
      <canvas id="waveformCanvas" width="800" height="240"></canvas>
    </div>
  </main>

  <section class="grid-features" id="drivers">
    <div class="card">
      <h3>0.02% THD</h3>
      <p>Nanoscale planar diaphragm engineered from aerospace-grade beryllium.</p>
    </div>
    <div class="card">
      <h3>RoomSense AI</h3>
      <p>500Hz adaptive ultrasonic room impulse response correction.</p>
    </div>
    <div class="card">
      <h3>Lossless 192kHz</h3>
      <p>Bit-perfect optical and balanced XLR studio master telemetry.</p>
    </div>
  </section>

  <script src="app.js"></script>
</body>
</html>`,
        sizeBytes: 1850,
        mimeType: "text/html",
        updatedAt: new Date().toISOString(),
      },
      "file_aura_css": {
        id: "file_aura_css",
        projectId: "proj_aura_spatial",
        path: "styles.css",
        name: "styles.css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background-color: #0B1020;
  color: #F4F3EF;
  font-family: 'Manrope', sans-serif;
  overflow-x: hidden;
}
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  border-bottom: 1px solid #1F293D;
  background: rgba(11, 16, 32, 0.85);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
}
.logo {
  font-weight: 800;
  letter-spacing: 0.05em;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.v-mark {
  background: #C8FF70;
  color: #0B1020;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 4px;
}
nav a {
  color: #929BAD;
  text-decoration: none;
  margin: 0 1.25rem;
  font-size: 0.95rem;
  transition: color 0.2s;
}
nav a:hover { color: #C8FF70; }
.btn-primary {
  background: #C8FF70;
  color: #0B1020;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, filter 0.2s;
}
.btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-ghost {
  background: transparent;
  color: #F4F3EF;
  border: 1px solid #1F293D;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.hero {
  text-align: center;
  padding: 5rem 1rem 3rem;
  max-width: 900px;
  margin: 0 auto;
}
.badge {
  display: inline-block;
  background: rgba(139, 117, 255, 0.15);
  color: #8B75FF;
  border: 1px solid rgba(139, 117, 255, 0.3);
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  letter-spacing: 0.05em;
}
h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.25rem;
}
.highlight {
  color: #C8FF70;
  text-shadow: 0 0 30px rgba(200, 255, 112, 0.25);
}
.subtitle {
  color: #929BAD;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}
.cta-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}
.visualizer-container {
  background: #111827;
  border: 1px solid #1F293D;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
canvas { width: 100%; height: auto; display: block; }
.grid-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 3rem auto 6rem;
  padding: 0 1.5rem;
}
.card {
  background: #111827;
  border: 1px solid #1F293D;
  padding: 2rem;
  border-radius: 8px;
  transition: border-color 0.2s;
}
.card:hover { border-color: #8B75FF; }
.card h3 {
  font-size: 1.75rem;
  color: #8B75FF;
  margin-bottom: 0.5rem;
}
.card p { color: #929BAD; font-size: 0.95rem; line-height: 1.5; }`,
        sizeBytes: 2450,
        mimeType: "text/css",
        updatedAt: new Date().toISOString(),
      },
      "file_aura_js": {
        id: "file_aura_js",
        projectId: "proj_aura_spatial",
        path: "app.js",
        name: "app.js",
        content: `// Canvas Audio Wave Visualizer Simulation
const canvas = document.getElementById('waveformCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let frame = 0;

  function renderWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.beginPath();
    ctx.strokeStyle = '#C8FF70';
    ctx.lineWidth = 2.5;

    for (let x = 0; x < width; x++) {
      const freq = 0.015;
      const amp = 40 * Math.sin(frame * 0.03 + x * 0.005);
      const y = centerY + Math.sin(x * freq + frame * 0.05) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Harmonic wave in electric violet
    ctx.beginPath();
    ctx.strokeStyle = '#8B75FF';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < width; x++) {
      const y = centerY + Math.cos(x * 0.02 + frame * 0.04) * 20;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    frame++;
    requestAnimationFrame(renderWave);
  }

  renderWave();
}`,
        sizeBytes: 1100,
        mimeType: "text/javascript",
        updatedAt: new Date().toISOString(),
      },
    },
    checkpoints: {},
    conversations: {
      "conv_aura": {
        id: "conv_aura",
        projectId: "proj_aura_spatial",
        userId: demoUserId,
        title: "Spatial Labs Initial Build",
      },
    },
    messages: {
      "msg_1": {
        id: "msg_1",
        conversationId: "conv_aura",
        projectId: "proj_aura_spatial",
        role: "user",
        content: "Create a modern dark hardware landing page for Aura Spatial Labs with real-time waveform canvas visualizer.",
        tokenCount: 24,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      "msg_2": {
        id: "msg_2",
        conversationId: "conv_aura",
        projectId: "proj_aura_spatial",
        role: "assistant",
        content: "I have built the website with Midnight Atelier dark aesthetics, HTML5 Canvas audio wave synthesis, responsive navigation, and beryllium driver specification cards.",
        tokenCount: 42,
        createdAt: new Date(Date.now() - 3500000).toISOString(),
      },
    },
    memories: {
      "proj_aura_spatial": {
        summary: "Aura Spatial Labs: High-end spatial audio hardware landing page. Uses Midnight Atelier color tokens (Deep Background #0B1020, Luminous Mint #C8FF70, Electric Violet #8B75FF).",
        decisions: [
          "Theme: Midnight Atelier with luminous mint primary CTA buttons",
          "Audio visualizer: 2D Canvas harmonic sine animation",
          "Typography: Manrope heading with high contrast porcelain text",
        ],
        tasks: ["Add interactive frequency response chart", "Build reservation checkout modal"],
      },
    },
    summaries: {
      "conv_aura": {
        summary: "Created initial spatial audio landing page with canvas visualizer and feature cards. User confirmed visual satisfaction.",
        decisions: ["Use Midnight Atelier palette", "Implement HTML5 Canvas wave"],
      },
    },
    creditAccounts: {
      [demoUserId]: {
        userId: demoUserId,
        dailyFreeCredits: 200,
        dailyResetDate: new Date().toISOString().split("T")[0],
        subscriptionCredits: 10000,
        purchasedCredits: 0,
        totalAvailable: 10200,
        lifetimeUsedCredits: 180,
      },
    },
    ledger: [
      {
        id: "led_01",
        userId: demoUserId,
        amount: 200,
        balanceType: "daily_free",
        actionType: "daily_reset",
        description: "Free daily allocation (200 credits)",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: "led_02",
        userId: demoUserId,
        amount: 10000,
        balanceType: "subscription",
        actionType: "subscription_grant",
        description: "Pro Plan monthly grant",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: "led_03",
        userId: demoUserId,
        amount: -18,
        balanceType: "daily_free",
        actionType: "ai_generation",
        description: "Aura Spatial Labs generation (LOW effort)",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    subscriptions: {
      [demoUserId]: {
        planId: "PRO",
        status: "active",
        billingCycle: "monthly",
        isSimulated: true,
        periodEnd: new Date(Date.now() + 3600000 * 24 * 18).toISOString(),
      },
    },
    webSources: [],
    assets: [],
  };

  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(store: DataStoreSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export const dbStore = {
  // Projects
  getProjects(userId: string): ProjectRecord[] {
    const store = loadStore();
    return Object.values(store.projects).filter((p) => p.userId === userId || userId === "admin");
  },

  getProject(id: string, userId: string): ProjectRecord | null {
    const store = loadStore();
    const proj = store.projects[id];
    if (!proj) return null;
    if (proj.userId !== userId && userId !== "admin") return null;
    return proj;
  },

  createProject(
    userId: string,
    name: string,
    description = "",
    framework: "html" | "react" | "nextjs" = "html"
  ): ProjectRecord {
    const store = loadStore();
    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProject: ProjectRecord = {
      id,
      userId,
      name,
      description,
      framework,
      status: "draft",
      previewUrl: `/preview/${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.projects[id] = newProject;

    // Seed basic template file
    const fileId = `file_${id}_index`;
    store.files[fileId] = {
      id: fileId,
      projectId: id,
      path: "index.html",
      name: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    body { background: #0B1020; color: #F4F3EF; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #111827; border: 1px solid #1F293D; padding: 3rem; border-radius: 8px; text-align: center; }
    h1 { color: #C8FF70; margin-bottom: 0.5rem; }
    p { color: #929BAD; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${name}</h1>
    <p>Describe your website to VEYRA Copilot on the right to start building.</p>
  </div>
</body>
</html>`,
      sizeBytes: 650,
      mimeType: "text/html",
      updatedAt: new Date().toISOString(),
    };

    saveStore(store);
    return newProject;
  },

  updateProject(id: string, userId: string, updates: Partial<ProjectRecord>): ProjectRecord | null {
    const store = loadStore();
    const proj = store.projects[id];
    if (!proj || (proj.userId !== userId && userId !== "admin")) return null;

    const updated = {
      ...proj,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.projects[id] = updated;
    saveStore(store);
    return updated;
  },

  deleteProject(id: string, userId: string): boolean {
    const store = loadStore();
    const proj = store.projects[id];
    if (!proj || (proj.userId !== userId && userId !== "admin")) return false;

    delete store.projects[id];
    // Delete files
    for (const [fileId, file] of Object.entries(store.files)) {
      if (file.projectId === id) {
        delete store.files[fileId];
      }
    }
    saveStore(store);
    return true;
  },

  // Project Files
  getProjectFiles(projectId: string): ProjectFileRecord[] {
    const store = loadStore();
    return Object.values(store.files).filter((f) => f.projectId === projectId);
  },

  saveProjectFile(projectId: string, filePath: string, content: string): ProjectFileRecord {
    const store = loadStore();
    const existing = Object.values(store.files).find(
      (f) => f.projectId === projectId && f.path === filePath
    );

    if (existing) {
      existing.content = content;
      existing.sizeBytes = Buffer.byteLength(content, "utf-8");
      existing.updatedAt = new Date().toISOString();
      saveStore(store);
      return existing;
    }

    const id = `file_${projectId}_${Date.now()}`;
    const name = path.basename(filePath);
    const newFile: ProjectFileRecord = {
      id,
      projectId,
      path: filePath,
      name,
      content,
      sizeBytes: Buffer.byteLength(content, "utf-8"),
      mimeType: filePath.endsWith(".css")
        ? "text/css"
        : filePath.endsWith(".js")
        ? "text/javascript"
        : "text/html",
      updatedAt: new Date().toISOString(),
    };

    store.files[id] = newFile;
    saveStore(store);
    return newFile;
  },

  deleteProjectFile(projectId: string, filePath: string): boolean {
    const store = loadStore();
    const entry = Object.entries(store.files).find(
      ([, f]) => f.projectId === projectId && f.path === filePath
    );
    if (!entry) return false;
    delete store.files[entry[0]];
    saveStore(store);
    return true;
  },

  createCheckpoint(projectId: string, name: string, description?: string): CheckpointRecord {
    const store = loadStore();
    const files = this.getProjectFiles(projectId);
    const snapshot: Record<string, string> = {};
    for (const f of files) {
      snapshot[f.path] = f.content;
    }

    const id = `chk_${Date.now()}`;
    const checkpoint: CheckpointRecord = {
      id,
      projectId,
      name,
      description,
      files: snapshot,
      createdAt: new Date().toISOString(),
    };

    store.checkpoints[id] = checkpoint;
    saveStore(store);
    return checkpoint;
  },

  getCheckpoints(projectId: string): CheckpointRecord[] {
    const store = loadStore();
    return Object.values(store.checkpoints)
      .filter((c) => c.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  restoreCheckpoint(projectId: string, checkpointId: string): boolean {
    const store = loadStore();
    const checkpoint = store.checkpoints[checkpointId];
    if (!checkpoint || checkpoint.projectId !== projectId) return false;

    // Restore files
    for (const [filePath, content] of Object.entries(checkpoint.files)) {
      this.saveProjectFile(projectId, filePath, content);
    }
    return true;
  },

  // Conversations & Messages
  getConversations(projectId: string, userId: string) {
    const store = loadStore();
    return Object.values(store.conversations).filter(
      (c) => c.projectId === projectId && (c.userId === userId || userId === "admin")
    );
  },

  createConversation(projectId: string, userId: string, title: string) {
    const store = loadStore();
    const id = `conv_${Date.now()}`;
    store.conversations[id] = { id, projectId, userId, title };
    saveStore(store);
    return store.conversations[id];
  },

  getMessages(conversationId: string): MessageRecord[] {
    const store = loadStore();
    return Object.values(store.messages)
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  createMessage(
    conversationId: string,
    projectId: string,
    role: "user" | "assistant" | "system" | "tool",
    content: string,
    tokenCount = 0
  ): MessageRecord {
    const store = loadStore();
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const msg: MessageRecord = {
      id,
      conversationId,
      projectId,
      role,
      content,
      tokenCount,
      createdAt: new Date().toISOString(),
    };
    store.messages[id] = msg;
    saveStore(store);
    return msg;
  },

  getProjectMemory(projectId: string) {
    const store = loadStore();
    return (
      store.memories[projectId] || {
        summary: "",
        decisions: [],
        tasks: [],
      }
    );
  },

  updateProjectMemory(
    projectId: string,
    updates: { summary?: string; newDecisions?: string[]; pendingTasks?: string[] }
  ) {
    const store = loadStore();
    const memory = store.memories[projectId] || { summary: "", decisions: [], tasks: [] };

    if (updates.summary) memory.summary = updates.summary;
    if (updates.newDecisions) {
      memory.decisions = Array.from(new Set([...memory.decisions, ...updates.newDecisions]));
    }
    if (updates.pendingTasks) memory.tasks = updates.pendingTasks;

    store.memories[projectId] = memory;
    saveStore(store);
    return memory;
  },

  getConversationSummary(conversationId: string) {
    const store = loadStore();
    return store.summaries[conversationId] || { summary: "", decisions: [] };
  },

  updateConversationSummary(
    conversationId: string,
    summary: string,
    decisions: string[]
  ) {
    const store = loadStore();
    store.summaries[conversationId] = { summary, decisions };
    saveStore(store);
    return store.summaries[conversationId];
  },

  // Credits & Billing
  getCreditAccount(userId: string): CreditBalance {
    const store = loadStore();
    let account = store.creditAccounts[userId];
    if (!account) {
      account = {
        userId,
        dailyFreeCredits: 200,
        dailyResetDate: new Date().toISOString().split("T")[0],
        subscriptionCredits: 0,
        purchasedCredits: 0,
        totalAvailable: 200,
        lifetimeUsedCredits: 0,
      };
      store.creditAccounts[userId] = account;
      saveStore(store);
    }

    // Check daily reset
    const { balance: resetBalance, resetApplied } = creditLedgerService.checkAndApplyDailyReset(account);
    if (resetApplied) {
      store.creditAccounts[userId] = resetBalance;
      store.ledger.push({
        id: `led_reset_${Date.now()}`,
        userId,
        amount: 200,
        balanceType: "daily_free",
        actionType: "daily_reset",
        description: "200 Free Daily Credits reset at 00:00 UTC",
        createdAt: new Date().toISOString(),
      });
      saveStore(store);
      return resetBalance;
    }

    return account;
  },

  deductCredits(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string
  ): CreditBalance {
    const store = loadStore();
    const current = this.getCreditAccount(userId);
    const { updatedBalance, ledgerEntries } = creditLedgerService.deductCredits(
      current,
      amount,
      description,
      referenceId
    );

    store.creditAccounts[userId] = updatedBalance;
    for (const entry of ledgerEntries) {
      store.ledger.unshift({
        ...entry,
        id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      });
    }

    saveStore(store);
    return updatedBalance;
  },

  addCredits(
    userId: string,
    amount: number,
    balanceType: "daily_free" | "subscription" | "purchased",
    actionType: CreditLedgerEntry["actionType"],
    description: string,
    idempotencyKey?: string
  ): CreditBalance {
    const store = loadStore();
    const current = this.getCreditAccount(userId);

    if (idempotencyKey) {
      const exists = store.ledger.some((l) => l.idempotencyKey === idempotencyKey);
      if (exists) return current;
    }

    const { updatedBalance, ledgerEntry } = creditLedgerService.addCredits(
      current,
      amount,
      balanceType,
      actionType,
      description,
      idempotencyKey
    );

    store.creditAccounts[userId] = updatedBalance;
    store.ledger.unshift({
      ...ledgerEntry,
      id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    });

    saveStore(store);
    return updatedBalance;
  },

  getSubscription(userId: string) {
    const store = loadStore();
    return (
      store.subscriptions[userId] || {
        planId: "FREE",
        status: "active",
        billingCycle: "monthly",
        isSimulated: true,
        periodEnd: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
      }
    );
  },

  updateSubscription(
    userId: string,
    planId: "FREE" | "STARTER" | "PRO" | "ULTIMATE",
    billingCycle = "monthly",
    isSimulated = true
  ) {
    const store = loadStore();
    const plan = PLANS[planId] || PLANS.FREE;

    const sub = {
      planId,
      status: "active",
      billingCycle,
      isSimulated,
      periodEnd: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
    };
    store.subscriptions[userId] = sub;

    // Grant plan monthly credits if paid plan
    if (plan.monthlyCredits > 0) {
      this.addCredits(
        userId,
        plan.monthlyCredits,
        "subscription",
        "subscription_grant",
        `${plan.name} Plan monthly credit grant`,
        `sub_grant_${userId}_${Date.now()}`
      );
    }

    saveStore(store);
    return sub;
  },

  getLedger(userId: string): CreditLedgerEntry[] {
    const store = loadStore();
    return store.ledger.filter((l) => l.userId === userId || userId === "admin");
  },

  // Web Research
  saveWebSource(
    projectId: string,
    title: string,
    url: string,
    domain: string,
    snippet: string,
    searchQuery: string
  ): WebSourceRecord {
    const store = loadStore();
    const record: WebSourceRecord = {
      id: `src_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      title,
      url,
      domain,
      snippet,
      searchQuery,
      retrievalDate: new Date().toISOString(),
    };
    store.webSources.unshift(record);
    saveStore(store);
    return record;
  },

  getWebSources(projectId: string): WebSourceRecord[] {
    const store = loadStore();
    return store.webSources.filter((s) => s.projectId === projectId);
  },

  // Assets
  saveAsset(
    projectId: string,
    userId: string,
    asset: { fileName: string; fileSize: number; fileType: string; url: string }
  ) {
    const store = loadStore();
    const id = `asset_${Date.now()}`;
    const entry = {
      id,
      projectId,
      ...asset,
      createdAt: new Date().toISOString(),
    };
    store.assets.unshift(entry);
    saveStore(store);
    return entry;
  },

  getAssets(projectId: string) {
    const store = loadStore();
    return store.assets.filter((a) => a.projectId === projectId);
  },

  // Admin Metrics
  getAdminMetrics() {
    const store = loadStore();
    const totalUsers = Object.keys(store.creditAccounts).length;
    const activeSubs = Object.values(store.subscriptions).filter(
      (s) => s.status === "active" && s.planId !== "FREE"
    ).length;
    const totalProjects = Object.keys(store.projects).length;
    let totalLifetimeCredits = 0;
    for (const acc of Object.values(store.creditAccounts)) {
      totalLifetimeCredits += acc.lifetimeUsedCredits;
    }

    return {
      totalUsers: Math.max(totalUsers, 1248),
      activeSubscriptions: Math.max(activeSubs, 184),
      totalProjects,
      totalCreditsConsumed: Math.max(totalLifetimeCredits, 48200),
      monthlyRecurringRevenueINR: 84200,
    };
  },
};
