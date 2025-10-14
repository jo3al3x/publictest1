import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Download, RefreshCw, MessageCircle } from 'lucide-react';

const BusinessConsultancyApp = () => {
  const [currentStep, setCurrentStep] = useState('landing');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [businessPlan, setBusinessPlan] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startConsultation = () => {
    setCurrentStep('chat');
    const initialMessage = {
      role: 'assistant',
      content: "Hello! I'm your AI business consultant. I'm going to help you create a comprehensive 3-year strategic business plan. I'll ask you 10 key questions about your business, and then I'll generate a detailed roadmap for your success.\n\nLet's start with the first question:\n\n**What's your business or business idea, and what industry are you in?**\n\nTell me as much detail as you'd like!"
    };
    setMessages([initialMessage]);
    setConversationHistory([
      {
        role: 'system',
        content: `You are an expert business consultant conducting a consultation. You need to ask the user 10 specific questions to gather information for a 3-year business plan. 

The 10 questions you must ask (one at a time, conversationally):
1. What's your business or business idea, and what industry are you in?
2. What stage is your business currently in? (pre-launch, early startup, growing, or established)
3. What's your current monthly revenue? (Enter 0 if pre-revenue)
4. How many people are on your team, and what's your available budget for growth?
5. Who are your ideal customers? Be as specific as possible.
6. Who are your main competitors, and what's your unique advantage?
7. What do you want to achieve in the next 3 years?
8. What's your biggest challenge or obstacle right now?
9. What should be your primary growth focus? (revenue, market expansion, product development, team building, or operational efficiency)
10. How will you measure success? What are your key metrics?

IMPORTANT INSTRUCTIONS:
- Ask ONE question at a time
- Keep your responses conversational and friendly
- Acknowledge their answer before asking the next question
- Keep track of how many questions you've asked
- After question 10, say: "Thank you! I have all the information I need. I'm now going to generate your comprehensive 3-year strategic business plan. Please click the 'Generate Plan' button to proceed."
- DO NOT generate the business plan yourself - just indicate that you're ready
- Be encouraging and supportive throughout`
      },
      initialMessage
    ]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const updatedHistory = [...conversationHistory, userMessage];

      const response = await fetch('http://localhost:3002/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedHistory
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages([...newMessages, assistantMessage]);
      setConversationHistory([...updatedHistory, assistantMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I encountered an error connecting to the server. Please make sure:\n\n1. The backend server is running (npm start in backend folder)\n2. The server is accessible at http://localhost:3002\n3. Your OpenAI API key is set in the .env file\n\nCheck the console for more details."
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBusinessPlan = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3002/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationHistory: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.choices[0].message.content;
      
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const planData = JSON.parse(responseText);
      setBusinessPlan(planData);
      setCurrentStep('results');
    } catch (error) {
      console.error('Error generating business plan:', error);
      alert("There was an error generating your business plan. Please ensure the backend server is running on port 3002 and your API key is configured correctly.");
    } finally {
      setIsLoading(false);
    }
  };

  const restartConsultation = () => {
    setCurrentStep('landing');
    setMessages([]);
    setConversationHistory([]);
    setBusinessPlan(null);
    setInputMessage('');
  };

  const downloadPlan = () => {
    if (!businessPlan) return;
    
    const planText = `
STRATEGIC BUSINESS PLAN

EXECUTIVE SUMMARY
${businessPlan.executiveSummary}

BUSINESS OVERVIEW
Industry: ${businessPlan.businessOverview.industry}
Current Stage: ${businessPlan.businessOverview.stage}
Key Strengths: ${businessPlan.businessOverview.keyStrengths.join(', ')}
Primary Challenge: ${businessPlan.businessOverview.primaryChallenge}

YEAR ONE STRATEGY
Focus: ${businessPlan.yearOne.focus}
Revenue Target: ${businessPlan.yearOne.revenueTarget}
Team Growth: ${businessPlan.yearOne.teamGrowth}

Key Objectives:
${businessPlan.yearOne.keyObjectives.map(obj => `• ${obj}`).join('\n')}

Quarterly Milestones:
Q1: ${businessPlan.yearOne.quarterlyMilestones.Q1}
Q2: ${businessPlan.yearOne.quarterlyMilestones.Q2}
Q3: ${businessPlan.yearOne.quarterlyMilestones.Q3}
Q4: ${businessPlan.yearOne.quarterlyMilestones.Q4}

YEAR TWO STRATEGY
Focus: ${businessPlan.yearTwo.focus}
Revenue Target: ${businessPlan.yearTwo.revenueTarget}
Team Growth: ${businessPlan.yearTwo.teamGrowth}

Key Objectives:
${businessPlan.yearTwo.keyObjectives.map(obj => `• ${obj}`).join('\n')}

Quarterly Milestones:
Q1: ${businessPlan.yearTwo.quarterlyMilestones.Q1}
Q2: ${businessPlan.yearTwo.quarterlyMilestones.Q2}
Q3: ${businessPlan.yearTwo.quarterlyMilestones.Q3}
Q4: ${businessPlan.yearTwo.quarterlyMilestones.Q4}

YEAR THREE STRATEGY
Focus: ${businessPlan.yearThree.focus}
Revenue Target: ${businessPlan.yearThree.revenueTarget}
Team Growth: ${businessPlan.yearThree.teamGrowth}

Key Objectives:
${businessPlan.yearThree.keyObjectives.map(obj => `• ${obj}`).join('\n')}

Quarterly Milestones:
Q1: ${businessPlan.yearThree.quarterlyMilestones.Q1}
Q2: ${businessPlan.yearThree.quarterlyMilestones.Q2}
Q3: ${businessPlan.yearThree.quarterlyMilestones.Q3}
Q4: ${businessPlan.yearThree.quarterlyMilestones.Q4}

IMMEDIATE ACTION STEPS
${businessPlan.actionSteps.immediate.map(action => `• ${action}`).join('\n')}

NEXT 3 MONTHS
${businessPlan.actionSteps.nextThreeMonths.map(action => `• ${action}`).join('\n')}

NEXT 6 MONTHS
${businessPlan.actionSteps.nextSixMonths.map(action => `• ${action}`).join('\n')}

RISK ASSESSMENT
Primary Risks:
${businessPlan.riskAssessment.primaryRisks.map(risk => `• ${risk}`).join('\n')}

Mitigation Strategies:
${businessPlan.riskAssessment.mitigationStrategies.map(strategy => `• ${strategy}`).join('\n')}

RESOURCE REQUIREMENTS
Funding: ${businessPlan.resourceRequirements.funding}
Key Hires: ${businessPlan.resourceRequirements.keyHires.join(', ')}
Tools & Systems: ${businessPlan.resourceRequirements.toolsAndSystems.join(', ')}
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-600 rounded-full p-4">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              AI Business Consultant
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Chat with our AI consultant to create a personalized 3-year strategic business plan. 
              Have a natural conversation and get comprehensive insights for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-blue-100 rounded-full p-3 w-fit mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversational</h3>
              <p className="text-gray-600">Chat naturally with our AI consultant like you would with a real business advisor</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-green-100 rounded-full p-3 w-fit mb-4">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Powered by ChatGPT to provide intelligent, personalized business advice</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-purple-100 rounded-full p-3 w-fit mb-4">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Plan</h3>
              <p className="text-gray-600">Get a detailed 3-year roadmap with quarterly milestones and action steps</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startConsultation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              Start Chat Consultation
              <MessageCircle className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-500 mt-4">Free consultation • Conversational interface</p>
            <p className="text-xs text-green-600 mt-2">✅ Secure backend with API key protection</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'chat') {
    const shouldShowGenerateButton = conversationHistory.some(msg => 
      msg.role === 'assistant' && msg.content.toLowerCase().includes('generate plan')
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto h-screen flex flex-col">
          <div className="bg-white rounded-t-xl shadow-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-full p-2">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">AI Business Consultant</h2>
                <p className="text-sm text-gray-500">Powered by ChatGPT</p>
              </div>
            </div>
            <button
              onClick={restartConsultation}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
              Restart
            </button>
          </div>

          <div className="bg-white flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {shouldShowGenerateButton && (
            <div className="bg-white p-4 border-t">
              <button
                onClick={generateBusinessPlan}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:bg-gray-300"
              >
                {isLoading ? 'Generating Your Plan...' : 'Generate My 3-Year Business Plan'}
                <Download className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-b-xl shadow-lg p-4 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'results' && businessPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-indigo-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Your Strategic Business Plan</h1>
                  <p className="opacity-90">Personalized 3-year roadmap for growth</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={downloadPlan}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={restartConsultation}
                    className="bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-800"
                  >
                    New Plan
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Executive Summary</h2>
                <p className="text-gray-700 leading-relaxed">{businessPlan.executiveSummary}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Industry & Stage</h3>
                    <p className="text-gray-700">{businessPlan.businessOverview.industry}</p>
                    <p className="text-gray-600 text-sm">{businessPlan.businessOverview.stage}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Primary Challenge</h3>
                    <p className="text-gray-700">{businessPlan.businessOverview.primaryChallenge}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Key Strengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {businessPlan.businessOverview.keyStrengths.map((strength, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Year {year} Strategy</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Focus</h3>
                        <p className="text-gray-700">{yearData.focus}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Revenue Target</h3>
                        <p className="text-gray-700 font-semibold">{yearData.revenueTarget}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">Key Objectives</h3>
                      <ul className="space-y-2">
                        {yearData.keyObjectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Quarterly Milestones</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(yearData.quarterlyMilestones).map(([quarter, milestone]) => (
                          <div key={quarter} className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium text-gray-900 text-sm">{quarter}</h4>
                            <p className="text-gray-700 text-sm mt-1">{milestone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                );
              })}

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Action Steps</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Immediate Actions</h3>
                    <ul className="space-y-2">
                      {businessPlan.actionSteps.immediate.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span className="text-gray-700 text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Next 3 Months</h3>
                    <ul className="space-y-2">
                      {businessPlan.actionSteps.nextThreeMonths.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span className="text-gray-700 text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Next 6 Months</h3>
                    <ul className="space-y-2">
                      {businessPlan.actionSteps.nextSixMonths.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span className="text-gray-700 text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Assessment & Resources</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Primary Risks</h3>
                    <ul className="space-y-2 mb-4">
                      {businessPlan.riskAssessment.primaryRisks.map((risk, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span className="text-gray-700 text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                    <h3 className="font-medium text-gray-900 mb-3">Mitigation Strategies</h3>
                    <ul className="space-y-2">
                      {businessPlan.riskAssessment.mitigationStrategies.map((strategy, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span className="text-gray-700 text-sm">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Resource Requirements</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">Funding Needs</h4>
                        <p className="text-gray-700 text-sm">{businessPlan.resourceRequirements.funding}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">Key Hires</h4>
                        <p className="text-gray-700 text-sm">{businessPlan.resourceRequirements.keyHires.join(', ')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">Tools & Systems</h4>
                        <p className="text-gray-700 text-sm">{businessPlan.resourceRequirements.toolsAndSystems.join(', ')}</p>
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
