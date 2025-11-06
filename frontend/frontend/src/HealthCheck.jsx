import React, { useState } from 'react';

const SECTIONS = [
  {
    key: 'strategic',
    title: 'Section 2: Strategic Planning & Execution',
    questions: [
      { id: 'S2_Q1', label: "How robust and comprehensive is the organisation's strategy process?" },
      { id: 'S2_Q2', label: 'To what extent is strategy effectively translated into actionable operational plans?' },
      { id: 'S2_Q3', label: 'How well does the organisation track and measure progress against strategic goals?' },
      { id: 'S2_Q4', label: 'How effectively is the strategy communicated throughout the organisation?' },
      { id: 'S2_Q5', label: 'To what degree does the organisation demonstrate agility in adapting strategy to changing conditions?' },
      { id: 'S2_Q6', label: 'How well are resources (financial, human, technological) aligned with strategic priorities?' },
      { id: 'S2_Q7', label: 'To what extent are strategic initiatives successfully completed on time and within budget?' },
      { id: 'S2_Q8', label: 'How effectively does the organisation learn from past strategic successes and failures?' },
    ],
    observationsId: 'S2_Observations'
  },
  {
    key: 'leadership',
    title: 'Section 3: Leadership & Management Capability',
    questions: [
      { id: 'S3_Q1', label: 'How effectively does the leadership team collaborate and function as a cohesive unit?' },
      { id: 'S3_Q2', label: 'To what extent do leaders demonstrate the capabilities required to achieve strategic objectives?' },
      { id: 'S3_Q3', label: "How robust are the organisation's succession planning and leadership development processes?" },
      { id: 'S3_Q4', label: 'How effective is communication between leadership levels and across departments?' },
      { id: 'S3_Q5', label: 'To what degree do managers consistently establish clear expectations and hold teams accountable?' },
      { id: 'S3_Q6', label: 'How well do leaders balance operational demands with innovation and future growth needs?' },
      { id: 'S3_Q7', label: 'To what extent does the leadership team foster a culture of continuous improvement and learning?' },
      { id: 'S3_Q8', label: "How effectively do leaders model the organisation's values and desired behaviors ?" },
    ],
    observationsId: 'S3_Observations'
  },
  {
    key: 'operations',
    title: 'Section 4: Operational Efficiency & Process Management',
    questions: [
      { id: 'S4_Q1', label: "How well-documented and standardised are the organisation's core operational processes?" },
      { id: 'S4_Q2', label: 'To what extent does the organisation use metrics and KPIs to measure operational performance?' },
      { id: 'S4_Q3', label: 'How effectively does the organisation identify and eliminate bottlenecks and inefficiencies?' },
      { id: 'S4_Q4', label: 'To what degree are quality control measures implemented and followed consistently?' },
      { id: 'S4_Q5', label: 'How well does the organisation leverage technology to optimise operations and automate processes?' },
      { id: 'S4_Q6', label: 'To what extent are supply chain and vendor relationships effectively managed for reliability and value?' },
      { id: 'S4_Q7', label: "How robust are the organisation's risk management and business continuity planning processes?" },
    ],
    observationsId: 'S4_Observations'
  },
  {
    key: 'marketing',
    title: 'Section 5: Marketing & Customer Experience',
    questions: [
      { id: 'S5_Q1', label: "How clearly defined is the organisation's target market and customer segmentation?" },
      { id: 'S5_Q2', label: "To what extent does the organisation have a cohesive brand identity and messaging strategy?" },
      { id: 'S5_Q3', label: 'How effectively does the organisation utilise digital marketing channels and analytics?' },
      { id: 'S5_Q4', label: 'To what degree does the organisation gather and act upon customer feedback?' },
      { id: 'S5_Q5', label: 'How well does the organisation measure and optimise its customer acquisition costs and ROI?' },
      { id: 'S5_Q6', label: 'To what extent is there alignment between marketing promises and operational delivery?' },
      { id: 'S5_Q7', label: 'How effectively does the organisation cultivate customer loyalty and generate referrals?' },
    ],
    observationsId: 'S5_Observations'
  },
  {
    key: 'financial',
    title: 'Section 6: Financial Health & Resource Management',
    questions: [
      { id: 'S6_Q1', label: "How robust and comprehensive are the organisation's financial planning and budgeting processes?" },
      { id: 'S6_Q2', label: "To what extent does the organisation have clear visibility into its cost structure and profitability drivers?" },
      { id: 'S6_Q3', label: 'How effectively does the organisation manage working capital and cash flow?' },
      { id: 'S6_Q4', label: 'To what degree are financial metrics and KPIs used to inform operational decision-making?' },
      { id: 'S6_Q5', label: 'How well does the organisation allocate resources to align with strategic priorities?' },
      { id: 'S6_Q6', label: 'To what extent are procurement and vendor management processes optimised for cost and value?' },
      { id: 'S6_Q7', label: 'How effectively does the organisation manage its physical assets and facilities?' },
    ],
    observationsId: 'S6_Observations'
  },
  {
    key: 'assessor',
    title: 'Section 7: Assessor Information',
    assessor: true
  }
];

export default function HealthCheck({ onSubmit, isSubmitting }) {
  const initialRatings = SECTIONS.flatMap(s => s.questions || []).reduce((acc, q) => {
    acc[q.id] = 3; // default mid score
    return acc;
  }, {});

  const [ratings, setRatings] = useState(initialRatings);
  const [observations, setObservations] = useState({});
  const [assessor, setAssessor] = useState({ name: '', jobTitle: '', date: '', organisation: '' });
  const [errors, setErrors] = useState({});
  const [stepIndex, setStepIndex] = useState(0);

  const current = SECTIONS[stepIndex];
  const total = SECTIONS.length;

  const handleRatingChange = (id, value) => {
    setRatings(prev => ({ ...prev, [id]: Number(value) }));
  };

  const validateStep = () => {
    const stepErrors = {};
    if (current.assessor) {
      // Optional to require assessor; leaving optional for now
    } else if (current.questions) {
      for (const q of current.questions) {
        if (!ratings[q.id]) stepErrors[q.id] = 'Required';
      }
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStepIndex(i => Math.min(total - 1, i + 1));
  };

  const handlePrev = () => setStepIndex(i => Math.max(0, i - 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple final validation: ensure all rating questions have values
    const allErrors = {};
    for (const s of SECTIONS) {
      if (s.questions) {
        for (const q of s.questions) {
          if (!ratings[q.id]) allErrors[q.id] = 'Required';
        }
      }
    }
    setErrors(allErrors);
    if (Object.keys(allErrors).length === 0) {
      onSubmit({ ratings, observations, assessor });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black p-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-t-xl shadow-lg border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Business Health Check</h2>
              <p className="text-slate-300 mt-1">Step {stepIndex + 1} of {total}: {current.title}</p>
            </div>
            <div className="text-sm text-slate-400">1 = Poor, 5 = Excellent</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-b-xl shadow-lg border border-white/10 p-6 space-y-6">
          {!current.assessor && current.questions && (
            <>
              {current.questions.map((q, idx) => (
                <div key={q.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-slate-400">Question {idx + 1}</div>
                      <label className="block font-medium text-white">{q.label}</label>
                    </div>
                    <div className="text-xs text-slate-400">1–5</div>
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {[1,2,3,4,5].map((n) => (
                      <label key={n} className={`flex items-center justify-center gap-2 py-2 rounded border cursor-pointer select-none transition-colors ${ratings[q.id] === n ? 'bg-indigo-500/20 border-indigo-400/60 text-indigo-200' : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'}`}>
                        <input
                          type="radio"
                          name={q.id}
                          value={n}
                          checked={ratings[q.id] === n}
                          onChange={(e) => handleRatingChange(q.id, e.target.value)}
                          className="hidden"
                        />
                        {n}
                      </label>
                    ))}
                  </div>
                  {errors[q.id] && <div className="mt-2 text-sm text-red-400">{errors[q.id]}</div>}
                </div>
              ))}

              {current.observationsId && (
                <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <label className="block font-medium text-white mb-2">Observations (optional)</label>
                  <textarea
                    className="w-full border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-400 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                    placeholder="Add examples, stories, and contextual information to back up your answers."
                    value={observations[current.observationsId] || ''}
                    onChange={(e) => setObservations(prev => ({ ...prev, [current.observationsId]: e.target.value }))}
                  />
                </div>
              )}
            </>
          )}

          {current.assessor && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-white mb-2">Name</label>
                <input className="w-full border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-400 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={assessor.name} onChange={(e)=>setAssessor(a=>({...a,name:e.target.value}))} placeholder="Your name" />
              </div>
              <div>
                <label className="block font-medium text-white mb-2">Job Title</label>
                <input className="w-full border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-400 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={assessor.jobTitle} onChange={(e)=>setAssessor(a=>({...a,jobTitle:e.target.value}))} placeholder="Your role" />
              </div>
              <div>
                <label className="block font-medium text-white mb-2">Date</label>
                <input type="date" className="w-full border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-400 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={assessor.date} onChange={(e)=>setAssessor(a=>({...a,date:e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium text-white mb-2">Organisation</label>
                <input className="w-full border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-400 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={assessor.organisation} onChange={(e)=>setAssessor(a=>({...a,organisation:e.target.value}))} placeholder="Organisation name" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button type="button" onClick={handlePrev} className="px-4 py-2 rounded-lg text-slate-200 border border-white/10 hover:bg-white/10" disabled={stepIndex===0}>Back</button>
            {stepIndex < total - 1 ? (
              <button type="button" onClick={handleNext} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium border border-white/10">Next</button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-60">
                {isSubmitting ? 'Submitting…' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
