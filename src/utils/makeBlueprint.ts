export const MAKE_BLUEPRINT_TEMPLATE = {
  name: "SHEZI × MANI AI - Intelligent Automation Workflow",
  description: "Official Make.com Scenario Blueprint connecting incoming triggers (Webhooks, WhatsApp, Telegram, Forms) to SHEZI × MANI AI with automatic language detection (Urdu, Pashto, English), STEM problem solving, and JSON response dispatching.",
  version: 1,
  flow: [
    {
      id: 1,
      module: "gateway:CustomWebHook",
      version: 1,
      parameters: {
        hook: 104928,
        maxResults: 1
      },
      filter: null,
      metadata: {
        designer: { x: 0, y: 0, name: "1. Incoming User Message" },
        restore: { parameters: { hook: { label: "SHEZI × MANI AI Webhook Receiver" } } }
      }
    },
    {
      id: 2,
      module: "json:ParseJSON",
      version: 1,
      parameters: {
        type: "string",
        json: "{{1.data}}"
      },
      filter: null,
      metadata: {
        designer: { x: 260, y: 0, name: "2. Validate & Parse Payload" }
      }
    },
    {
      id: 3,
      module: "http:ActionMakeRequest",
      version: 3,
      parameters: {
        url: "{{APP_URL}}/api/webhook/make",
        method: "POST",
        headers: [
          { name: "Content-Type", value: "application/json" },
          { name: "User-Agent", value: "Make-com-Automation/2.5" },
          { name: "X-Requested-With", value: "SHEZI-MANI-AI" }
        ],
        body: JSON.stringify({
          message: "{{2.message}}",
          language: "{{2.language || 'auto'}}",
          enable_search: "{{2.enable_search || false}}",
          context: "{{2.context || []}}"
        }),
        serializeUrl: false,
        shareCookies: false,
        parseResponse: true
      },
      filter: {
        name: "Has Valid Message",
        conditions: [[{ a: "{{2.message}}", o: "exist" }]]
      },
      metadata: {
        designer: { x: 520, y: 0, name: "3. SHEZI × MANI AI Engine" }
      }
    },
    {
      id: 4,
      module: "router:router",
      version: 1,
      metadata: {
        designer: { x: 780, y: 0, name: "4. Language & Channel Router" }
      },
      routes: [
        {
          id: 5,
          module: "gateway:WebhookRespond",
          version: 1,
          parameters: {
            status: 200,
            headers: [{ name: "Content-Type", value: "application/json" }],
            body: JSON.stringify({
              status: "success",
              ai_reply: "{{3.data.reply}}",
              detected_language: "{{3.data.detected_language}}",
              execution_time_ms: "{{3.data.execution_ms}}"
            })
          },
          filter: {
            name: "Always Return JSON Reply",
            conditions: [[{ a: "{{3.status}}", o: "equal", b: "200" }]]
          },
          metadata: {
            designer: { x: 1040, y: -100, name: "5A. Dispatch Webhook Reply" }
          }
        }
      ]
    }
  ]
};

export const SAMPLE_WEBHOOK_PAYLOADS = [
  {
    title: "Urdu Biology Query (اردو میں حیاتیات)",
    language: "Urdu",
    payload: {
      message: "ڈی این اے (DNA) کی ساخت اور نقل کا عمل (Replication) آسان الفاظ میں سمجھائیں۔",
      language: "ur",
      enable_search: false,
      user_id: "student_urdu_901"
    }
  },
  {
    title: "Pashto Science Query (پښتو ساینس)",
    language: "Pashto",
    payload: {
      message: "د فوتوسنتز (Photosynthesis) عمل څه شی دی او بوټي څنګه خپله غذا جوړوي؟",
      language: "ps",
      enable_search: false,
      user_id: "student_pashto_402"
    }
  },
  {
    title: "Mathematics & Calculus Step-by-Step",
    language: "English",
    payload: {
      message: "Explain the fundamental theorem of calculus and compute the definite integral ∫ from 0 to π of sin(x) dx step by step.",
      language: "en",
      enable_search: false,
      user_id: "math_user_108"
    }
  },
  {
    title: "Full-Stack Web App Development Plan",
    language: "English",
    payload: {
      message: "Create a complete architectural blueprint for a real-time collaborative whiteboard app using React, Node.js, WebSockets, and Redis. Include DB schema and API endpoints.",
      language: "en",
      enable_search: false,
      user_id: "architect_dev_77"
    }
  },
  {
    title: "Real-Time Web Search Grounding Query",
    language: "English",
    payload: {
      message: "What are the latest discoveries from the James Webb Space Telescope regarding early galaxies?",
      language: "auto",
      enable_search: true,
      user_id: "researcher_web_33"
    }
  }
];

export const MAKE_SETUP_GUIDE_STEPS = [
  {
    step: 1,
    title: "Create a Make.com Scenario",
    instruction: "Log in to your Make.com account and click 'Create a new scenario'. You can also import the pre-built blueprint JSON using 'More > Import Blueprint'."
  },
  {
    step: 2,
    title: "Add the Webhook Module",
    instruction: "Add a 'Custom Webhook' module to trigger the scenario whenever your external app (Telegram bot, WhatsApp Cloud API, form submission, or frontend) sends a message."
  },
  {
    step: 3,
    title: "Configure the HTTP Request Module",
    instruction: "Add an 'HTTP - Make a request' module. Set Method to 'POST' and URL to the SHEZI × MANI AI endpoint. Set Content-Type to 'application/json' and pass the user message."
  },
  {
    step: 4,
    title: "Add Webhook Response / Delivery",
    instruction: "Add a 'Webhook Response' module to return the AI's intelligent answer in Urdu, Pashto, or English back to your user or downstream automation pipeline."
  },
  {
    step: 5,
    title: "Turn On Scheduling & Verify",
    instruction: "Toggle the scenario from OFF to ON. Run a test request in Make.com and see the real-time response in SHEZI × MANI AI's live inspector."
  }
];
