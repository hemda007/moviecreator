export const STORY_QUESTIONS = [
  {
    id: 'title',
    question: "What's the working title of this documentary?",
    placeholder: "e.g., 'The 45-Day Transformation'",
    type: 'text',
  },
  {
    id: 'logline',
    question: 'In one sentence, what is this documentary about? (The logline)',
    placeholder:
      'e.g., A small EdTech company bets everything on an internal AI bootcamp to transform its team in 45 days.',
    type: 'textarea',
  },
  {
    id: 'core_question',
    question: "What's the central question or tension this documentary explores?",
    placeholder:
      'e.g., Can a non-tech education team genuinely transform into AI-first professionals in just 45 days?',
    type: 'textarea',
  },
  {
    id: 'audience',
    question: 'Who is the primary audience for this documentary?',
    placeholder:
      'e.g., EdTech founders, small business owners, people curious about AI adoption',
    type: 'text',
  },
  {
    id: 'tone',
    question: 'What tone/mood are you going for?',
    options: [
      'Inspirational & uplifting',
      'Raw & honest (warts and all)',
      'Cinematic & dramatic',
      'Casual & behind-the-scenes',
      'Educational & informative',
      'Mix of raw honesty + inspiration',
    ],
    type: 'select',
  },
  {
    id: 'duration',
    question: 'Target duration?',
    options: [
      'Short-form (5-10 min)',
      'Medium (15-25 min)',
      'Feature-length (30-60 min)',
      'Series (multiple episodes)',
    ],
    type: 'select',
  },
  {
    id: 'key_characters',
    question:
      'Who are the key people/characters in this story? List them with their roles.',
    placeholder:
      "e.g.,\n- Hem (Founder, driving the vision)\n- Dhaval (Co-founder, technical perspective)\n- Team members going through the bootcamp\n- External mentors/trainers",
    type: 'textarea',
  },
  {
    id: 'story_arc',
    question:
      "What's the journey? Describe the beginning, middle, and end you envision.",
    placeholder:
      'Beginning: The decision to do the bootcamp, the why\nMiddle: The struggle, breakthroughs, doubts\nEnd: The transformation, what changed',
    type: 'textarea',
  },
  {
    id: 'key_moments',
    question:
      'What are the 3-5 KEY moments or scenes you absolutely want to capture?',
    placeholder:
      "e.g.,\n1. The announcement meeting where the bootcamp idea is pitched\n2. A struggling team member having their 'aha' moment\n3. The final showcase/demo day",
    type: 'textarea',
  },
  {
    id: 'conflict',
    question:
      'Every good documentary has tension. What are the challenges, doubts, or conflicts?',
    placeholder:
      'e.g., Team skepticism, time pressure, fear of AI replacing jobs, balancing daily work with learning',
    type: 'textarea',
  },
  {
    id: 'visual_style',
    question: 'What visual references or style inspire you?',
    placeholder:
      "e.g., 'The Social Dilemma' interview style, 'Jiro Dreams of Sushi' intimate feel, talking heads + b-roll",
    type: 'textarea',
  },
  {
    id: 'interviews_planned',
    question:
      'How many interviews are you planning? Who will be interviewed?',
    placeholder:
      'e.g., 8-10 interviews — founder, co-founder, 5 team members, 2 trainers',
    type: 'textarea',
  },
  {
    id: 'b_roll',
    question:
      'What B-roll footage do you plan to capture or already have?',
    placeholder:
      'e.g., Office shots, screen recordings of team working, whiteboard sessions, casual conversations',
    type: 'textarea',
  },
  {
    id: 'desired_outcome',
    question:
      'After watching this documentary, what should the viewer FEEL and DO?',
    placeholder:
      'e.g., Feel inspired that even small teams can embrace AI. Consider doing something similar in their org.',
    type: 'textarea',
  },
  {
    id: 'distribution',
    question: 'Where will this be published?',
    options: [
      'YouTube (public)',
      'YouTube (unlisted/private)',
      'Internal only',
      'Social media clips + full version',
      'Film festivals / competitions',
      'Multiple platforms',
    ],
    type: 'select',
  },
]
