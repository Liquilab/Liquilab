import { FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export function TechnicalBriefPage() {
  const downloadMarkdown = () => {
    const mdContent = `# Liquilab - Technical Integration Briefing
**Figma Make → Production Repository Integration**

[... full markdown content would go here ...]
`;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Liquilab-Technical-Integration-Brief.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0B1530] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="font-heading text-white/95">
                Technical Integration Brief
              </h1>
              <p className="font-['Inter',sans-serif] text-white/70">
                Figma Make → Production Repository Integration
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-[#0F1A36]/95 border border-[#3B82F6]/30 rounded-xl p-8 mb-8">
          <h2 className="font-heading text-white/95 mb-4">
            Executive Summary
          </h2>
          <p className="font-['Inter',sans-serif] text-white/70 mb-4">
            We are building the Liquilab DeFi analytics platform using <strong className="text-white/95">Figma Make</strong>, an AI-powered React/Tailwind prototyping tool. To ensure seamless integration into our production repository, we need detailed information about our technical infrastructure.
          </p>
          <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
              <p className="font-['Inter',sans-serif] text-white/95">
                <strong>Goal:</strong> Enable smooth migration of Figma Make prototype code into production with minimal friction
              </p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="font-heading text-white/95 mb-4">
            Current Status
          </h2>
          
          <div className="mb-6">
            <h3 className="font-['Inter',sans-serif] text-white/95 mb-3">
              What We've Built in Figma Make
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "14 core pages (Home, Pool Detail, Wallet, etc.)",
                "25+ reusable React components",
                "ShadCN UI component library integration",
                "Complete design system (Navy/Blue/Aqua)",
                "Responsive Tailwind CSS v4 layouts",
                "HashRouter-based SPA routing"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5" />
                  <span className="font-['Inter',sans-serif] text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-['Inter',sans-serif] text-white/95 mb-3">
              Tech Stack
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                "React 18+ TypeScript",
                "Tailwind CSS v4",
                "React Router",
                "Recharts",
                "Lucide React",
                "ShadCN UI"
              ].map((tech, i) => (
                <div key={i} className="bg-[#0B1530]/50 border border-white/5 rounded-lg px-3 py-2">
                  <span className="font-['Inter',sans-serif] text-white/70">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Information Needed - Checklist Preview */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="font-heading text-white/95 mb-4">
            Information Needed from Your Team
          </h2>
          <p className="font-['Inter',sans-serif] text-white/70 mb-6">
            The full brief includes detailed checklists for 10 key areas:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { num: 1, title: "Repository Structure", items: "Repo URL, branch naming, folder structure" },
              { num: 2, title: "Build & Dev Environment", items: "Package manager, build tool, Node version" },
              { num: 3, title: "Styling & Design System", items: "CSS approach, Tailwind config, design tokens" },
              { num: 4, title: "Routing & State", items: "Router type, state management, API client" },
              { num: 5, title: "Component Libraries", items: "UI library, icons, charts, animations" },
              { num: 6, title: "Backend Integration", items: "API architecture, auth flow, WebSocket" },
              { num: 7, title: "Environment & Deployment", items: "Env vars, platform, CI/CD pipeline" },
              { num: 8, title: "Testing & Quality", items: "Test framework, E2E, coverage requirements" },
              { num: 9, title: "Code Standards", items: "Git workflow, PR requirements, commit conventions" },
              { num: 10, title: "Special Considerations", items: "Browser support, PWA, accessibility, i18n" }
            ].map(section => (
              <div key={section.num} className="bg-[#0B1530]/50 border border-white/5 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="h-6 w-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-['Inter',sans-serif] text-white/95">{section.num}</span>
                  </div>
                  <div>
                    <div className="font-['Inter',sans-serif] text-white/95 mb-1">
                      {section.title}
                    </div>
                    <div className="font-['Inter',sans-serif] text-white/[0.58]">
                      {section.items}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Scenarios */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="font-heading text-white/95 mb-4">
            Integration Scenarios
          </h2>
          
          <div className="space-y-4">
            {[
              {
                title: "Scenario A: Clean Migration",
                desc: "Export Figma Make code → New folder in your repo",
                best: "New project or major redesign",
                color: "#10B981"
              },
              {
                title: "Scenario B: Incremental Integration",
                desc: "Migrate page-by-page into existing structure",
                best: "Gradual rollout alongside existing app",
                color: "#3B82F6"
              },
              {
                title: "Scenario C: Component Library",
                desc: "Extract reusable components into shared package",
                best: "Enhancing current app with new components",
                color: "#1BE8D2"
              }
            ].map((scenario, i) => (
              <div key={i} className="border border-white/10 rounded-lg p-5">
                <h3 className="font-['Inter',sans-serif] text-white/95 mb-2" style={{ color: scenario.color }}>
                  {scenario.title}
                </h3>
                <p className="font-['Inter',sans-serif] text-white/70 mb-2">
                  {scenario.desc}
                </p>
                <p className="font-['Inter',sans-serif] text-white/[0.58]">
                  <strong className="text-white/70">Best for:</strong> {scenario.best}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Timeline */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="font-heading text-white/95 mb-4">
            Recommended Timeline
          </h2>
          
          <div className="space-y-3">
            {[
              { phase: "Phase 1: Information Gathering", timeline: "1-2 days", action: "Technical team fills out checklist" },
              { phase: "Phase 2: Integration Strategy Session", timeline: "30 min call", action: "Discuss optimal approach" },
              { phase: "Phase 3: Prototype Adaptation", timeline: "2-5 days", action: "Adjust code to match infrastructure" },
              { phase: "Phase 4: Migration & Testing", timeline: "3-7 days", action: "Move to repo, run tests" },
              { phase: "Phase 5: Production Readiness", timeline: "5-10 days", action: "Connect APIs, deploy staging" }
            ].map((phase, i) => (
              <div key={i} className="flex items-start gap-4 bg-[#0B1530]/50 border border-white/5 rounded-lg p-4">
                <div className="h-8 w-8 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-['Inter',sans-serif] text-white/95">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="font-['Inter',sans-serif] text-white/95 mb-1">
                    {phase.phase}
                  </div>
                  <div className="font-['Inter',sans-serif] text-white/70 mb-1">
                    {phase.action}
                  </div>
                  <div className="font-['Inter',sans-serif] text-white/[0.58]">
                    Timeline: {phase.timeline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-['Inter',sans-serif] text-white/95 mb-2">
                What Needs Adaptation
              </h3>
              <div className="space-y-2">
                {[
                  "API integration - Currently using mock data",
                  "Authentication - Demo mode, needs real auth",
                  "Environment variables - Placeholders need replacement",
                  "Routing - May need HashRouter → BrowserRouter",
                  "State management - Local state → global state solution",
                  "Build config - Match your build tool settings"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] flex-shrink-0 mt-1.5" />
                    <span className="font-['Inter',sans-serif] text-white/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="bg-gradient-to-r from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-8 text-center">
          <h2 className="font-heading text-white/95 mb-2">
            Ready to Start Integration?
          </h2>
          <p className="font-['Inter',sans-serif] text-white/70 mb-6">
            Download the complete technical brief with all checklists and send it to your account manager
          </p>
          <Button
            onClick={downloadMarkdown}
            className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Full Technical Brief (.md)
          </Button>
          <p className="font-['Inter',sans-serif] text-white/[0.58] mt-4">
            The brief is also available in the project root: <code className="bg-[#0B1530]/50 px-2 py-1 rounded">/Technical-Integration-Brief.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}
