-- ProPilot Seed Data
-- 3 starter templates: Consulting, Dev Agency, Marketing

-- ============================================================
-- System Templates
-- ============================================================

-- Template 1: Consulting Proposal
INSERT INTO public.templates (id, org_id, name, description, industry, is_system, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'Consulting Proposal',
  'Professional consulting engagement proposal with problem statement, methodology, timeline, and investment sections.',
  'Consulting',
  TRUE,
  NULL
);

INSERT INTO public.template_sections (template_id, name, order_index, ai_prompt, default_content, variables)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Executive Summary', 0,
   'Write a concise 2-3 paragraph executive summary for a consulting proposal. Highlight the client''s core challenge, the proposed solution approach, and the expected business outcome. Use professional, confident language.',
   '<p>We are pleased to present this proposal for {{client_company}}. Based on our discovery conversations, we understand your primary challenge is {{problem_statement}}.</p><p>Our approach will deliver {{expected_outcome}} within {{timeline}}.</p>',
   '["client_company", "problem_statement", "expected_outcome", "timeline"]'),

  ('00000000-0000-0000-0000-000000000001', 'Problem Statement', 1,
   'Write a detailed problem statement section. Describe the client''s current situation, the pain points they''re experiencing, and the business impact if the problem goes unsolved.',
   '<p>{{client_company}} is currently facing {{problem_description}}. This has resulted in {{business_impact}}.</p>',
   '["client_company", "problem_description", "business_impact"]'),

  ('00000000-0000-0000-0000-000000000001', 'Proposed Approach', 2,
   'Write a 3-phase methodology section. Describe the discovery, implementation, and review phases with specific activities in each. Be concrete and process-oriented.',
   '<h3>Phase 1: Discovery & Assessment</h3><p>We will conduct stakeholder interviews, review existing documentation, and deliver a findings report.</p><h3>Phase 2: Implementation</h3><p>Working alongside your team, we will execute the agreed plan with weekly progress check-ins.</p><h3>Phase 3: Review & Handoff</h3><p>Final deliverables review, knowledge transfer, and 30-day post-engagement support.</p>',
   '[]'),

  ('00000000-0000-0000-0000-000000000001', 'About Us', 3,
   'Write a credible "About Us" section for a consulting firm. Highlight relevant experience, notable clients or outcomes, and the specific expertise relevant to this engagement.',
   '<p>We bring deep expertise in {{expertise_area}} with {{years_experience}} years of experience helping companies like {{reference_client}} achieve {{reference_outcome}}.</p>',
   '["expertise_area", "years_experience", "reference_client", "reference_outcome"]'),

  ('00000000-0000-0000-0000-000000000001', 'Investment & Timeline', 4,
   'Write a clear investment and timeline section. Present the engagement fee, payment schedule, and project timeline. Be specific about what is and is not included.',
   '<h3>Investment</h3><p>The total investment for this engagement is <strong>{{price}}</strong>, payable as follows:</p><ul><li>50% upon contract signing</li><li>50% upon project completion</li></ul><h3>Timeline</h3><p>Estimated duration: {{duration}}. Start date: {{start_date}}.</p>',
   '["price", "duration", "start_date"]'),

  ('00000000-0000-0000-0000-000000000001', 'Next Steps', 5,
   'Write a clear call-to-action section with specific next steps for the prospect to accept the proposal and begin the engagement.',
   '<p>To move forward, please sign and return this proposal by <strong>{{expiry_date}}</strong>. Upon acceptance, we will schedule a kickoff call within 48 hours.</p><p>Questions? Reply to this email or book a call: {{calendar_link}}</p>',
   '["expiry_date", "calendar_link"]');

-- Template 2: Dev Agency Proposal
INSERT INTO public.templates (id, org_id, name, description, industry, is_system, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  NULL,
  'Dev Agency Proposal',
  'Software development project proposal covering scope, tech stack, sprint plan, and pricing.',
  'Technology',
  TRUE,
  NULL
);

INSERT INTO public.template_sections (template_id, name, order_index, ai_prompt, default_content, variables)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'Project Overview', 0,
   'Write a project overview section for a software development proposal. Describe the product being built, the core problem it solves, and the key success metrics.',
   '<p>This proposal outlines our plan to build <strong>{{project_name}}</strong> for {{client_company}}. The core goal is {{project_goal}}, with success measured by {{success_metrics}}.</p>',
   '["project_name", "client_company", "project_goal", "success_metrics"]'),

  ('00000000-0000-0000-0000-000000000002', 'Scope of Work', 1,
   'Write a detailed scope of work section. List the specific features and deliverables included in this engagement. Be precise — this becomes the project contract.',
   '<h3>Included in Scope</h3><ul><li>{{feature_1}}</li><li>{{feature_2}}</li><li>{{feature_3}}</li></ul><h3>Explicitly Out of Scope</h3><ul><li>Native mobile apps (web only)</li><li>Third-party API integrations beyond listed</li></ul>',
   '["feature_1", "feature_2", "feature_3"]'),

  ('00000000-0000-0000-0000-000000000002', 'Technical Approach', 2,
   'Write a technical approach section describing the tech stack, architecture decisions, and development methodology. Explain why each major technology was chosen.',
   '<h3>Tech Stack</h3><p>{{tech_stack_description}}</p><h3>Architecture</h3><p>We will build using a {{architecture_type}} architecture, optimized for {{key_requirement}}.</p><h3>Development Process</h3><p>Two-week sprints with demo and feedback sessions every sprint.</p>',
   '["tech_stack_description", "architecture_type", "key_requirement"]'),

  ('00000000-0000-0000-0000-000000000002', 'Team & Timeline', 3,
   'Write a team and timeline section. Introduce the key team members, their roles, and provide a high-level sprint plan with milestones.',
   '<h3>Your Team</h3><p>Lead Engineer, Product Designer, and QA Engineer — all dedicated to your project.</p><h3>Sprint Plan</h3><p><strong>Sprint 1–2:</strong> Foundation & core authentication<br><strong>Sprint 3–4:</strong> {{milestone_2}}<br><strong>Sprint 5–6:</strong> {{milestone_3}}<br><strong>Sprint 7:</strong> Testing, hardening, and launch</p>',
   '["milestone_2", "milestone_3"]'),

  ('00000000-0000-0000-0000-000000000002', 'Investment', 4,
   'Write a pricing section for a software development engagement. Present the total cost, breakdown by phase, and payment schedule. Include what support is provided post-launch.',
   '<h3>Project Investment</h3><p>Total: <strong>{{total_price}}</strong></p><table><tr><th>Phase</th><th>Duration</th><th>Cost</th></tr><tr><td>Discovery & Design</td><td>2 weeks</td><td>{{phase_1_price}}</td></tr><tr><td>Development</td><td>{{dev_duration}}</td><td>{{dev_price}}</td></tr><tr><td>Launch & Handoff</td><td>1 week</td><td>Included</td></tr></table><p><strong>Post-launch:</strong> 30 days of bug fixes included.</p>',
   '["total_price", "phase_1_price", "dev_duration", "dev_price"]');

-- Template 3: Marketing Agency Proposal
INSERT INTO public.templates (id, org_id, name, description, industry, is_system, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  NULL,
  'Marketing Agency Proposal',
  'Digital marketing campaign proposal covering strategy, channels, deliverables, and monthly retainer.',
  'Marketing',
  TRUE,
  NULL
);

INSERT INTO public.template_sections (template_id, name, order_index, ai_prompt, default_content, variables)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'Situation Analysis', 0,
   'Write a situation analysis section for a marketing proposal. Summarize the client''s current market position, key challenges, and growth opportunity based on the meeting notes.',
   '<p>{{client_company}} currently serves {{target_market}} but faces {{main_challenge}}. The opportunity: {{opportunity_description}}.</p>',
   '["client_company", "target_market", "main_challenge", "opportunity_description"]'),

  ('00000000-0000-0000-0000-000000000003', 'Strategy & Channels', 1,
   'Write a marketing strategy section. Define the target audience, positioning, and the specific channels and tactics that will be used.',
   '<h3>Target Audience</h3><p>{{audience_description}}</p><h3>Channels</h3><ul><li><strong>{{channel_1}}:</strong> {{channel_1_rationale}}</li><li><strong>{{channel_2}}:</strong> {{channel_2_rationale}}</li></ul>',
   '["audience_description", "channel_1", "channel_1_rationale", "channel_2", "channel_2_rationale"]'),

  ('00000000-0000-0000-0000-000000000003', 'Monthly Deliverables', 2,
   'Write a deliverables section listing exactly what the client will receive each month. Be specific — this builds trust and manages expectations.',
   '<h3>Monthly Deliverables</h3><ul><li>{{deliverable_1}}</li><li>{{deliverable_2}}</li><li>{{deliverable_3}}</li><li>Monthly performance report with recommendations</li></ul>',
   '["deliverable_1", "deliverable_2", "deliverable_3"]'),

  ('00000000-0000-0000-0000-000000000003', 'Success Metrics', 3,
   'Write a success metrics section. Define the KPIs that will be tracked, how they will be measured, and what targets you are committed to hitting.',
   '<h3>Key Performance Indicators</h3><p>We will report on the following metrics monthly:</p><ul><li><strong>{{kpi_1}}:</strong> Target {{kpi_1_target}}</li><li><strong>{{kpi_2}}:</strong> Target {{kpi_2_target}}</li></ul>',
   '["kpi_1", "kpi_1_target", "kpi_2", "kpi_2_target"]'),

  ('00000000-0000-0000-0000-000000000003', 'Investment', 4,
   'Write a retainer pricing section for a marketing agency. Present the monthly fee, what it covers, contract length, and cancellation terms.',
   '<h3>Monthly Retainer</h3><p><strong>{{monthly_fee}}/month</strong></p><p>Minimum commitment: {{min_commitment}}. Cancel with {{notice_period}} written notice after minimum term.</p><p>Includes all deliverables listed above plus up to {{revision_rounds}} revision rounds per piece of content.</p>',
   '["monthly_fee", "min_commitment", "notice_period", "revision_rounds"]');
