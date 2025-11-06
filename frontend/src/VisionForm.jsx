import React, { useState } from 'react';

const STEPS = [
  {
    key: 'identityCulture',
    title: 'Organisational Identity & Culture',
    fields: [
      { id: 'corePurposeImpact', label: 'Core Purpose & Impact', type: 'textarea', placeholder: 'In 3 years, what problem do you solve and why does it matter?' },
      { id: 'culturalAtmosphere', label: 'Cultural Atmosphere', type: 'textarea', placeholder: 'Energy, culture, interactions you notice when walking in...' },
      { id: 'teamCharacteristics', label: 'Team Characteristics', type: 'textarea', placeholder: 'Skills, attitudes, work styles, shared characteristics...' }
    ]
  },
  {
    key: 'marketPosition',
    title: 'Market Position & Recognition',
    fields: [
      { id: 'marketLeadership', label: 'Market Leadership', type: 'textarea', placeholder: 'What are you known for in 3 years?' },
      { id: 'clientCommunityRelationships', label: 'Client/Community Relationships', type: 'textarea', placeholder: 'How do clients/community talk about you?' },
      { id: 'competitiveAdvantage', label: 'Competitive Advantage', type: 'textarea', placeholder: 'What can you do that others cannot replicate?' }
    ]
  },
  {
    key: 'operationalExcellence',
    title: 'Operational Excellence',
    fields: [
      { id: 'serviceProductDelivery', label: 'Service/Product Delivery', type: 'textarea', placeholder: 'Client journey from first contact to completion...' },
      { id: 'internalOperations', label: 'Internal Operations', type: 'textarea', placeholder: 'Processes, systems, workflows, decision-making...' },
      { id: 'innovationTechnology', label: 'Innovation & Technology', type: 'textarea', placeholder: 'Role of technology and innovation...' }
    ]
  },
  {
    key: 'growthScale',
    title: 'Growth & Scale',
    fields: [
      { id: 'sizeScope', label: 'Size & Scope', type: 'textarea', placeholder: 'Team size, reach, volume of work, clients served...' },
      { id: 'geographicPresence', label: 'Geographic Presence', type: 'textarea', placeholder: 'Where you operate and influence; partnerships...' },
      { id: 'serviceProductRange', label: 'Service/Product Range', type: 'textarea', placeholder: 'Offerings and how they evolved...' }
    ]
  },
  {
    key: 'financialSustainability',
    title: 'Financial & Resource Sustainability',
    fields: [
      { id: 'financialHealth', label: 'Financial Health', type: 'textarea', placeholder: 'Revenue/funding, sustainability, what success looks like?' },
      { id: 'resourceManagement', label: 'Resource Management', type: 'textarea', placeholder: 'Manage and utilise people, facilities, tech, partnerships...' }
    ]
  },
  {
    key: 'leadershipGovernance',
    title: 'Leadership & Governance',
    fields: [
      { id: 'leadershipTeam', label: 'Leadership Team', type: 'textarea', placeholder: 'Structure, strengths, how they work together?' },
      { id: 'decisionMaking', label: 'Decision Making', type: 'textarea', placeholder: 'Process, speed, quality of decisions?' },
      { id: 'successionDevelopment', label: 'Succession & Development', type: 'textarea', placeholder: 'Talent pipeline and succession planning?' }
    ]
  },
  {
    key: 'visualSensory',
    title: 'Visual & Sensory Details',
    fields: [
      { id: 'physicalEnvironment', label: 'Physical Environment', type: 'textarea', placeholder: 'Workplace look/feel, layout, tech, spaces...' },
      { id: 'dayInTheLife', label: 'A Day in the Life', type: 'textarea', placeholder: 'Typical successful day, who does what...' },
      { id: 'celebrationAchievement', label: 'Celebration & Achievement', type: 'textarea', placeholder: 'Moment of celebration/achievement...' },
      { id: 'externalRecognition', label: 'External Recognition', type: 'textarea', placeholder: 'Award/recognition you receive and why...' }
    ]
  },
  {
    key: 'stakeholderEcosystem',
    title: 'Stakeholder Ecosystem',
    fields: [
      { id: 'keyPartnerships', label: 'Key Partnerships', type: 'textarea', placeholder: 'Most important partners and collaborators...' },
      { id: 'communityImpact', label: 'Community Impact', type: 'textarea', placeholder: 'Positive changes you contribute to in 3 years...' }
    ]
  },
  {
    key: 'personalReflection',
    title: 'Personal Reflection',
    fields: [
      { id: 'personalRole', label: 'Personal Role', type: 'textarea', placeholder: 'Your role, contribution, impact, growth...' },
      { id: 'personalFulfilment', label: 'Personal Fulfilment', type: 'textarea', placeholder: 'What excites you most; what makes you proud...' }
    ]
  },
  {
    key: 'challengesGrowth',
    title: 'Challenges & Growth',
    fields: [
      { id: 'challengesOvercome', label: 'Challenges Overcome', type: 'textarea', placeholder: 'Significant challenges navigated and learnings...' },
      { id: 'continuousImprovement', label: 'Continuous Improvement', type: 'textarea', placeholder: 'How you continue to evolve and improve...' }
    ]
  },
  {
    key: 'finalReflection',
    title: 'Final Reflection',
    fields: [
      { id: 'oneSentenceVision', label: 'One Powerful Sentence', type: 'textarea', placeholder: 'Describe your future in one inspiring sentence...' },
      { id: 'mostImportantThing', label: 'Most Important Thing', type: 'textarea', placeholder: 'The most important thing that must happen...' }
    ]
  },
  {
    key: 'respondentInfo',
    title: 'Respondent Information',
    fields: [
      { id: 'respondentName', label: 'Name', type: 'text', placeholder: 'Your name' },
      { id: 'respondentRole', label: 'Role', type: 'text', placeholder: 'Your role' },
      { id: 'respondentDate', label: 'Date', type: 'date' },
      { id: 'respondentOrganisation', label: 'Organisation', type: 'text', placeholder: 'Organisation name' }
    ]
  }
];

export default function VisionForm({ onSubmit, isSubmitting, onBack }) {
  const [answers, setAnswers] = useState(() => (
    STEPS.flatMap(s => s.fields).reduce((acc, f) => ({ ...acc, [f.id]: '' }), {})
  ));
  const [errors, setErrors] = useState({});
  const [stepIndex, setStepIndex] = useState(0);

  const current = STEPS[stepIndex];
  const total = STEPS.length;

  const validateStep = () => {
    const stepErrors = {};
    for (const f of current.fields) {
      const val = (answers[f.id] ?? '').toString();
      if (!val.trim()) stepErrors[f.id] = 'Required';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStepIndex(i => Math.min(total - 1, i + 1));
  };
  const handlePrev = () => setStepIndex(i => Math.max(0, i - 1));
  const handleChange = (id, value) => setAnswers(prev => ({ ...prev, [id]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const allErrors = {};
    for (const step of STEPS) {
      for (const f of step.fields) {
        const val = (answers[f.id] ?? '').toString();
        if (!val.trim()) allErrors[f.id] = 'Required';
      }
    }
    setErrors(allErrors);
    if (Object.keys(allErrors).length === 0) onSubmit(answers);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black p-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-t-xl shadow-lg border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Future Leaders - Vivid Vision</h2>
              <p className="text-slate-300 mt-1">Step {stepIndex + 1} of {total}: {current.title}</p>
            </div>
            <div className="text-sm text-slate-400">All questions required</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-b-xl shadow-lg border border-white/10 p-6 space-y-6">
          {current.fields.map((f) => (
            <div key={f.id}>
              <label className="block font-medium text-white mb-2">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  className="w-full border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-400 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder={f.placeholder}
                  value={answers[f.id]}
                  onChange={(e) => handleChange(f.id, e.target.value)}
                />
              ) : (
                <input
                  type={f.type}
                  className="w-full border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-400 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={f.placeholder}
                  value={answers[f.id]}
                  onChange={(e) => handleChange(f.id, e.target.value)}
                />
              )}
              {errors[f.id] && <div className="mt-1 text-sm text-red-400">{errors[f.id]}</div>}
            </div>
          ))}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => (stepIndex === 0 ? onBack() : handlePrev())} className="px-4 py-2 rounded-lg text-slate-200 border border-white/10 hover:bg-white/10">Back</button>
            {stepIndex < total - 1 ? (
              <button type="button" onClick={handleNext} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-3 rounded-lg font-medium">Next</button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-60">
                {isSubmitting ? 'Saving & Generating…' : 'Save & Generate Roadmap'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

