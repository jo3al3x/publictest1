import React, { useState } from 'react';
import { Brain, Download, MessageCircle } from 'lucide-react';
import HealthCheck from './HealthCheck';
import VisionForm from './VisionForm.jsx';

const BusinessConsultancyApp = () => {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3002';
  const [currentStep, setCurrentStep] = useState('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [businessPlan, setBusinessPlan] = useState(null);
  const [healthRatings, setHealthRatings] = useState(null);
  const [visionAnswers, setVisionAnswers] = useState(null);
  const [slidesMarkdown, setSlidesMarkdown] = useState('');
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleHealthSubmit = async (payload) => {
    setIsLoading(true);
    try {
      setHealthRatings(payload.ratings);
      await fetch(`${API_BASE}/api/healthcheck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
      setCurrentStep('vision');
    } catch (e) {
      console.error('Error saving health check:', e);
      alert('There was an error saving your Health Check. Ensure the backend is running on port 3002.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisionSubmit = async (answers) => {
    setIsLoading(true);
    try {
      setVisionAnswers(answers);
      await fetch(`${API_BASE}/api/vision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      }).catch(() => {});

      const response = await fetch(`${API_BASE}/api/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratings: healthRatings, vision: answers })
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      let responseText = data.choices[0].message.content;
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const planData = JSON.parse(responseText);
      setBusinessPlan(planData);
      setCurrentStep('results');
    } catch (e) {
      console.error('Error generating from vision:', e);
      alert('There was an error generating your roadmap.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSlides = async () => {
    if (!businessPlan) return;
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/present-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratings: healthRatings, vision: visionAnswers, plan: businessPlan })
      });
      if (!resp.ok) throw new Error(`API Error: ${resp.status}`);
      const data = await resp.json();
      const md = (data.content || '').replace(/```(markdown)?\n?/g, '').replace(/```\n?/g, '').trim();
      setSlidesMarkdown(md);
      const parts = md.split(/\n---\n|\n\s*---\s*\n|---\n/).map(s => s.trim()).filter(Boolean);
      setSlides(parts);
      setCurrentSlide(0);
    } catch (e) {
      console.error('Error loading slides:', e);
      alert('Unable to load slides presentation.');
    } finally {
      setIsLoading(false);
    }
  };

  const restartConsultation = () => {
    setCurrentStep('landing');
    setBusinessPlan(null);
    setHealthRatings(null);
    setVisionAnswers(null);
    setSlides([]);
    setSlidesMarkdown('');
    setCurrentSlide(0);
  };

  const downloadPlan = () => {
    if (!businessPlan) return;
    const bullet = (arr) => (arr || []).map(item => `- ${item}`).join('\n');
    const planText = `
STRATEGIC BUSINESS PLAN

EXECUTIVE SUMMARY
${businessPlan.executiveSummary}

BUSINESS OVERVIEW
Industry: ${businessPlan.businessOverview.industry}
Current Stage: ${businessPlan.businessOverview.stage}
Key Strengths:\n${bullet(businessPlan.businessOverview.keyStrengths)}
Primary Challenge: ${businessPlan.businessOverview.primaryChallenge}

YEAR ONE STRATEGY
Focus: ${businessPlan.yearOne.focus}
Revenue Target: ${businessPlan.yearOne.revenueTarget}
Team Growth: ${businessPlan.yearOne.teamGrowth}

Key Objectives:\n${bullet(businessPlan.yearOne.keyObjectives)}

Quarterly Milestones:
Q1: ${businessPlan.yearOne.quarterlyMilestones.Q1}
Q2: ${businessPlan.yearOne.quarterlyMilestones.Q2}
Q3: ${businessPlan.yearOne.quarterlyMilestones.Q3}
Q4: ${businessPlan.yearOne.quarterlyMilestones.Q4}

YEAR TWO STRATEGY
Focus: ${businessPlan.yearTwo.focus}
Revenue Target: ${businessPlan.yearTwo.revenueTarget}
Team Growth: ${businessPlan.yearTwo.teamGrowth}

Key Objectives:\n${bullet(businessPlan.yearTwo.keyObjectives)}

Quarterly Milestones:
Q1: ${businessPlan.yearTwo.quarterlyMilestones.Q1}
Q2: ${businessPlan.yearTwo.quarterlyMilestones.Q2}
Q3: ${businessPlan.yearTwo.quarterlyMilestones.Q3}
Q4: ${businessPlan.yearTwo.quarterlyMilestones.Q4}

YEAR THREE STRATEGY
Focus: ${businessPlan.yearThree.focus}
Revenue Target: ${businessPlan.yearThree.revenueTarget}
Team Growth: ${businessPlan.yearThree.teamGrowth}

Key Objectives:\n${bullet(businessPlan.yearThree.keyObjectives)}

Quarterly Milestones:
Q1: ${businessPlan.yearThree.quarterlyMilestones.Q1}
Q2: ${businessPlan.yearThree.quarterlyMilestones.Q2}
Q3: ${businessPlan.yearThree.quarterlyMilestones.Q3}
Q4: ${businessPlan.yearThree.quarterlyMilestones.Q4}

IMMEDIATE ACTION STEPS
${bullet(businessPlan.actionSteps.immediate)}

NEXT 3 MONTHS
${bullet(businessPlan.actionSteps.nextThreeMonths)}

NEXT 6 MONTHS
${bullet(businessPlan.actionSteps.nextSixMonths)}

RISK ASSESSMENT
Primary Risks:\n${bullet(businessPlan.riskAssessment.primaryRisks)}

Mitigation Strategies:\n${bullet(businessPlan.riskAssessment.mitigationStrategies)}

RESOURCE REQUIREMENTS
Funding: ${businessPlan.resourceRequirements.funding}
Key Hires: ${businessPlan.resourceRequirements.keyHires?.join(', ')}
Tools & Systems: ${businessPlan.resourceRequirements.toolsAndSystems?.join(', ')}
    `.trim();

    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Strategic_Business_Plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (currentStep === 'landing') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center p-6">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-500 rounded-full p-4 shadow-lg shadow-indigo-500/20">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Business Health Check & Vision</h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Complete a quick 1–5 Health Check and a Vivid Vision questionnaire.
              We’ll generate a tailored 3-year roadmap with quarterly milestones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/10 text-white">
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-full p-3 w-fit mb-4">
                <MessageCircle className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Health Check</h3>
              <p className="text-slate-300">Rate key dimensions (1–5) across strategy, leadership, operations, marketing, and finance</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/10 text-white">
              <div className="bg-green-500/20 border border-green-400/30 rounded-full p-3 w-fit mb-4">
                <Brain className="w-6 h-6 text-green-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-slate-300">ChatGPT transforms your inputs into a clear, actionable roadmap</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/10 text-white">
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-full p-3 w-fit mb-4">
                <Download className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comprehensive Plan</h3>
              <p className="text-slate-300">Detailed 3-year roadmap with quarterly milestones and action steps</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setCurrentStep('healthcheck')}
              className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 hover:opacity-90 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              Start Health Check
              <MessageCircle className="w-5 h-5" />
            </button>
            <p className="text-sm text-slate-400 mt-4">Free • 2-step guided forms</p>
            <p className="text-xs text-slate-500 mt-2">Secure backend with API key protection</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'healthcheck') {
    return <HealthCheck onSubmit={handleHealthSubmit} isSubmitting={isLoading} />;
  }

  if (currentStep === 'vision') {
    return <VisionForm onSubmit={handleVisionSubmit} isSubmitting={isLoading} onBack={() => setCurrentStep('healthcheck')} />;
  }

  if (currentStep === 'results' && businessPlan) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black p-4">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/10">
            <div className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Your Strategic Business Plan</h1>
                  <p className="opacity-90">Personalized 3-year roadmap for growth</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={loadSlides}
                    disabled={isLoading}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold border border-white/10 disabled:opacity-60"
                  >
                    {isLoading ? 'Preparing Slides…' : 'Present as Slides'}
                  </button>
                  <button
                    onClick={downloadPlan}
                    className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-100"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={restartConsultation}
                    className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90"
                  >
                    New Plan
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8 text-slate-200">
              {slides.length > 0 && (
                <section className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <h2 className="text-xl font-semibold text-white mb-2">Slide Deck Preview</h2>
                  <div className="bg-white/5 rounded p-4 whitespace-pre-wrap text-sm min-h-[200px]">
                    {slides[currentSlide]}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      className="px-3 py-2 rounded border border-white/10 text-slate-200 hover:bg-white/10 disabled:opacity-60"
                      onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
                      disabled={currentSlide === 0}
                    >Prev</button>
                    <div className="text-sm text-slate-400">Slide {currentSlide + 1} / {slides.length}</div>
                    <button
                      className="px-3 py-2 rounded border border-white/10 text-slate-200 hover:bg-white/10 disabled:opacity-60"
                      onClick={() => setCurrentSlide(s => Math.min(slides.length - 1, s + 1))}
                      disabled={currentSlide === slides.length - 1}
                    >Next</button>
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Executive Summary</h2>
                <p className="leading-relaxed">{businessPlan.executiveSummary}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Business Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-white mb-2">Industry & Stage</h3>
                    <p>{businessPlan.businessOverview.industry}</p>
                    <p className="text-slate-400 text-sm">{businessPlan.businessOverview.stage}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-2">Primary Challenge</h3>
                    <p>{businessPlan.businessOverview.primaryChallenge}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-white mb-2">Key Strengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {businessPlan.businessOverview.keyStrengths.map((strength, index) => (
                      <span key={index} className="bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-sm">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {[1, 2, 3].map((year) => {
                const yearData = businessPlan[`year${year === 1 ? 'One' : year === 2 ? 'Two' : 'Three'}`];
                return (
                  <section key={year} className="border-l-4 border-indigo-500 pl-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Year {year} Strategy</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="font-medium text-white mb-2">Focus</h3>
                        <p>{yearData.focus}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-white mb-2">Revenue Target</h3>
                        <p className="font-semibold">{yearData.revenueTarget}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-medium text-white mb-3">Key Objectives</h3>
                      <ul className="space-y-2">
                        {yearData.keyObjectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium text-white mb-3">Quarterly Milestones</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(yearData.quarterlyMilestones).map(([quarter, milestone]) => (
                          <div key={quarter} className="bg-white/5 p-3 rounded-lg">
                            <h4 className="font-medium text-white text-sm">{quarter}</h4>
                            <p className="text-slate-200 text-sm mt-1">{milestone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                );
              })}

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Action Steps</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-white mb-3">Immediate Actions</h3>
                    <ul className="space-y-2">
                      {businessPlan.actionSteps.immediate.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span className="text-slate-200 text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-3">Next 3 Months</h3>
                    <ul className="space-y-2">
                      {businessPlan.actionSteps.nextThreeMonths.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span className="text-slate-200 text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-3">Next 6 Months</h3>
                    <ul className="space-y-2">
                      {businessPlan.actionSteps.nextSixMonths.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span className="text-slate-200 text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Risk Assessment & Resources</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-white mb-3">Primary Risks</h3>
                    <ul className="space-y-2 mb-4">
                      {businessPlan.riskAssessment.primaryRisks.map((risk, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span className="text-slate-200 text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                    <h3 className="font-medium text-white mb-3">Mitigation Strategies</h3>
                    <ul className="space-y-2">
                      {businessPlan.riskAssessment.mitigationStrategies.map((strategy, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span className="text-slate-200 text-sm">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-3">Resource Requirements</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-white text-sm">Funding Needs</h4>
                        <p className="text-slate-200 text-sm">{businessPlan.resourceRequirements.funding}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-sm">Key Hires</h4>
                        <p className="text-slate-200 text-sm">{businessPlan.resourceRequirements.keyHires.join(', ')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-sm">Tools & Systems</h4>
                        <p className="text-slate-200 text-sm">{businessPlan.resourceRequirements.toolsAndSystems.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BusinessConsultancyApp;
