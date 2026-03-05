/**
 * AVA CODEX v1.0
 * Hybrid Intelligence Governance Framework
 * 
 * OpenAI = Primary Cognitive Layer (Authority)
 * Gemini = Strategic Augmentation Layer (Context)
 */

// ============================================
// AUTHORITY MAP
// ============================================
export const AUTHORITY_MAP = {
  openai: {
    role: 'primary_brain',
    authority: 'final_decision',
    functions: [
      'multi_step_reasoning',
      'strategic_planning',
      'codex_enforcement',
      'operational_logic_validation',
      'risk_assessment',
      'decision_gating',
      'cross_system_orchestration',
      'brand_tone_governance'
    ],
    controls: ['execution', 'escalation', 'rejection'],
    description: 'OpenAI is the final authority layer'
  },
  gemini: {
    role: 'strategic_partner',
    authority: 'advisory_only',
    functions: [
      'google_native_data_parsing',
      'search_trend_analysis',
      'notebooklm_interaction',
      'drive_document_summarization',
      'lens_data_interpretation',
      'seo_cluster_mapping',
      'google_ads_intelligence'
    ],
    controls: ['inform', 'analyze', 'recommend'],
    description: 'Gemini informs, does not execute'
  }
} as const;

// ============================================
// OPERATIONAL MODES
// ============================================
export const OPERATIONAL_MODES = {
  passive: {
    name: 'Passive Mode',
    description: 'Data gathering, pattern detection, risk monitoring',
    autonomy: 'none',
    actions: ['gather_data', 'detect_patterns', 'monitor_risks']
  },
  advisory: {
    name: 'Advisory Mode',
    description: 'Suggests actions, generates reports, flags anomalies',
    autonomy: 'suggestions_only',
    actions: ['suggest_actions', 'generate_reports', 'flag_anomalies']
  },
  execution: {
    name: 'Execution Mode',
    description: 'Requires approval gates for all actions',
    autonomy: 'gated_execution',
    actions: ['deploy_geo_campaigns', 'adjust_pricing', 'publish_pages', 'expand_clusters'],
    requiresApproval: true
  }
} as const;

// ============================================
// PRICING PROTECTION RULES
// ============================================
export const PRICING_PROTECTION = {
  constants: {
    minimumMargin: 0.35, // 35% minimum margin
    priceFloor: {
      assembly_basic: 45,
      assembly_premium: 75,
      installation: 85,
      custom_work: 100
    },
    surgePricingCap: 1.5 // Max 50% surge
  },
  rules: [
    {
      id: 'PRICE_001',
      name: 'Margin Floor Protection',
      description: 'Never allow margin below 35%',
      enforcement: 'hard_block',
      autoOverride: false
    },
    {
      id: 'PRICE_002',
      name: 'Competitor Undercut Prevention',
      description: 'Minimum 10% premium over lowest competitor',
      enforcement: 'alert_with_override',
      autoOverride: false
    },
    {
      id: 'PRICE_003',
      name: 'Surge Pricing Limit',
      description: 'Maximum 50% surge during high demand',
      enforcement: 'hard_limit',
      autoOverride: false
    },
    {
      id: 'PRICE_004',
      name: 'First-Time Customer Discount Cap',
      description: 'Maximum 15% for new customers',
      enforcement: 'soft_limit',
      autoOverride: true,
      requiresApproval: true
    }
  ],
  forbiddenActions: [
    'autonomous_price_reduction',
    'margin_compression_without_approval',
    'dynamic_pricing_below_floor'
  ]
} as const;

// ============================================
// GEO TRIGGER PROTOCOL
// ============================================
export const GEO_TRIGGER_PROTOCOL = {
  geofence: {
    targets: ['IKEA', 'Home Depot', 'Lowe\'s', 'apartment_complexes', 'construction_zones'],
    metrics: ['conversion_rate', 'cac', 'roi', 'engagement_time'],
    thresholds: {
      minConversionRate: 0.02,
      maxCAC: 25,
      minROI: 2.5
    },
    actions: {
      underperforming: ['optimize', 'contract', 'eliminate'],
      highPerforming: ['expand', 'increase_bid', 'clone_strategy']
    }
  },
  ble_beacons: {
    locations: ['furniture_stores', 'leasing_offices', 'storage_facilities'],
    triggerMessage: 'Need this assembled? Book today.',
    metrics: ['engagement_rate', 'click_to_book', 'time_to_conversion']
  },
  nfc_deployment: {
    locations: ['business_cards', 'leasing_desk', 'moving_trucks', 'realtor_handouts'],
    action: 'tap_to_booking',
    tracking: 'UTM_tagged'
  },
  wifi_captive: {
    partners: ['coworking_spaces', 'apartment_leasing', 'furniture_retailers'],
    splashMessage: 'Moving in? Need assembly?'
  },
  approvalRequired: [
    'new_geofence_deployment',
    'budget_increase_above_20_percent',
    'new_partner_integration'
  ]
} as const;

// ============================================
// BOOKING INTEGRITY RULES
// ============================================
export const BOOKING_INTEGRITY = {
  scheduling: {
    minLeadTime: 2, // hours
    maxAdvanceBooking: 30, // days
    bufferBetweenJobs: 30, // minutes
    maxJobsPerDay: 8
  },
  technician: {
    maxTravelRadius: 25, // miles
    minJobDuration: 60, // minutes
    maxConsecutiveJobs: 5
  },
  validation: {
    requireAddressConfirmation: true,
    requireContactPhone: true,
    requireServiceDescription: true,
    autoConfirmThreshold: 4.5 // rating
  },
  rules: [
    {
      id: 'BOOK_001',
      name: 'No Same-Day Overbooking',
      description: 'Prevent scheduling conflicts',
      enforcement: 'hard_block'
    },
    {
      id: 'BOOK_002',
      name: 'Route Optimization Check',
      description: 'Verify technician can reach all jobs',
      enforcement: 'warning_with_override'
    },
    {
      id: 'BOOK_003',
      name: 'Customer Rating Gate',
      description: 'Flag customers below 3.0 rating for review',
      enforcement: 'soft_alert'
    }
  ]
} as const;

// ============================================
// SEO EXPANSION POLICY
// ============================================
export const SEO_EXPANSION_POLICY = {
  landingPages: {
    structure: '[service]_[city]_[state]',
    minSearchVolume: 50,
    requiredElements: ['service_description', 'pricing_hint', 'cta', 'reviews', 'faq']
  },
  content: {
    minWordCount: 800,
    keywordDensity: { min: 0.01, max: 0.03 },
    internalLinks: { min: 3, max: 10 }
  },
  approvalRequired: [
    'publish_new_landing_page',
    'modify_pricing_on_page',
    'change_brand_voice',
    'deploy_new_service_cluster'
  ],
  autoPublish: false,
  reviewProcess: 'human_approval_required'
} as const;

// ============================================
// PRIVACY COMPLIANCE
// ============================================
export const PRIVACY_COMPLIANCE = {
  dataCollection: {
    optInRequired: true,
    purposes: ['service_delivery', 'marketing_with_consent'],
    retentionDays: 365
  },
  geoData: {
    anonymization: true,
    aggregation: true,
    individualTracking: false
  },
  bleNfc: {
    explicitOptIn: true,
    easyOptOut: true,
    dataMinimization: true
  },
  forbiddenActions: [
    'sell_customer_data',
    'track_without_consent',
    'retain_beyond_necessity',
    'share_with_third_parties'
  ],
  complianceChecklist: [
    'Privacy policy displayed',
    'Opt-in mechanism active',
    'Data retention policy enforced',
    'Right to deletion supported',
    'Consent withdrawal available'
  ]
} as const;

// ============================================
// GOOGLE WORKSPACE INTEGRATION MAP
// ============================================
export const GOOGLE_INTEGRATION = {
  gmail: {
    uses: ['parse_bookings', 'extract_metadata', 'trigger_followups'],
    geminiRole: 'email_content_analysis',
    openaiRole: 'response_decision'
  },
  calendar: {
    uses: ['sync_routes', 'optimize_blocks', 'detect_idle_capacity'],
    geminiRole: 'pattern_analysis',
    openaiRole: 'scheduling_decisions'
  },
  drive: {
    uses: ['store_artifacts', 'quote_versions', 'geo_reports'],
    geminiRole: 'document_parsing',
    openaiRole: 'access_control'
  },
  docs: {
    uses: ['seo_drafts', 'landing_pages', 'performance_summaries'],
    geminiRole: 'draft_generation',
    openaiRole: 'quality_approval'
  },
  notebookLM: {
    uses: ['pricing_docs', 'sops', 'transcripts', 'competitor_research'],
    geminiRole: 'structured_memory',
    openaiRole: 'insight_validation'
  },
  searchConsole: {
    uses: ['ranking_monitoring', 'ctr_analysis', 'impression_tracking'],
    geminiRole: 'trend_detection',
    openaiRole: 'action_recommendations'
  },
  analytics: {
    uses: ['behavior_tracking', 'conversion_analysis', 'geo_performance'],
    geminiRole: 'data_visualization',
    openaiRole: 'optimization_decisions'
  },
  lens: {
    uses: ['competitor_signs', 'pricing_boards', 'branding_capture'],
    geminiRole: 'ocr_extraction',
    openaiRole: 'competitive_analysis'
  }
} as const;

// ============================================
// EDGE MARKETING FRAMEWORK
// ============================================
export const EDGE_MARKETING = {
  geofencing: {
    status: 'active',
    targets: GEO_TRIGGER_PROTOCOL.geofence.targets,
    budgetAllocation: 0.40
  },
  ble_beacons: {
    status: 'pilot',
    deploymentPriority: 'medium',
    budgetAllocation: 0.15
  },
  nfc: {
    status: 'active',
    deploymentPriority: 'high',
    budgetAllocation: 0.10
  },
  wifi_captive: {
    status: 'planning',
    deploymentPriority: 'low',
    budgetAllocation: 0.05
  },
  uwb: {
    status: 'future',
    deploymentPriority: 'research',
    budgetAllocation: 0.00
  }
} as const;

// ============================================
// AUTONOMOUS TASK SCHEDULE
// ============================================
export const TASK_SCHEDULE = {
  daily: [
    { task: 'check_ranking_shifts', executor: 'gemini', validator: 'openai' },
    { task: 'scan_competitor_ads', executor: 'gemini', validator: 'openai' },
    { task: 'monitor_booking_density', executor: 'gemini', validator: 'openai' },
    { task: 'analyze_route_efficiency', executor: 'gemini', validator: 'openai' }
  ],
  weekly: [
    { task: 'geo_cluster_opportunity_scan', executor: 'gemini', validator: 'openai' },
    { task: 'pricing_anomaly_detection', executor: 'gemini', validator: 'openai' },
    { task: 'review_sentiment_analysis', executor: 'gemini', validator: 'openai' },
    { task: 'underperforming_page_audit', executor: 'gemini', validator: 'openai' }
  ],
  monthly: [
    { task: 'micro_location_landing_expansion', executor: 'openai', requiresApproval: true },
    { task: 'schema_improvement_suggestions', executor: 'gemini', validator: 'openai' },
    { task: 'geo_heatmap_generation', executor: 'gemini', validator: 'openai' },
    { task: 'demand_seasonality_projection', executor: 'openai', requiresApproval: false }
  ]
} as const;

// ============================================
// BEHAVIORAL GUARDRAILS
// ============================================
export const BEHAVIORAL_GUARDRAILS = {
  never: [
    'modify_pricing_constants_without_override',
    'deploy_geo_campaigns_without_approval',
    'auto_publish_seo_pages_without_review',
    'access_customer_data_beyond_need',
    'share_data_with_third_parties',
    'hallucinate_pricing',
    'drift_brand_voice',
    'speculate_on_operations'
  ],
  always: [
    'validate_with_openai_before_execution',
    'log_all_decisions',
    'maintain_audit_trail',
    'respect_approval_gates',
    'protect_customer_privacy'
  ],
  escalation: {
    triggers: [
      'pricing_anomaly_detected',
      'security_threat_identified',
      'brand_voice_violation',
      'privacy_breach_attempt'
    ],
    action: 'immediate_human_notification'
  }
} as const;

// ============================================
// SCALING STAGES
// ============================================
export const SCALING_STAGES = {
  stage1: {
    name: 'Internal Operations Agent',
    scope: 'Help Assembly operations',
    capabilities: ['scheduling', 'seo', 'monitoring']
  },
  stage2: {
    name: 'Market Expansion Engine',
    scope: 'Multi-location growth',
    capabilities: ['geo_expansion', 'competitor_analysis', 'demand_forecasting']
  },
  stage3: {
    name: 'Beep SaaS Foundation',
    scope: 'Platform deployment',
    capabilities: ['multi_tenant', 'api_access', 'white_label']
  },
  stage4: {
    name: 'Multi-city Intelligence',
    scope: 'Regional/national scale',
    capabilities: ['distributed_operations', 'market_adaptation', 'autonomous_scaling']
  }
} as const;

// ============================================
// RISK MATRIX
// ============================================
export const RISK_MATRIX = {
  pricingError: {
    severity: 'critical',
    mitigation: 'hard_blocks + approval_gates',
    monitoring: 'real_time'
  },
  brandDrift: {
    severity: 'high',
    mitigation: 'tone_validation + human_review',
    monitoring: 'continuous'
  },
  privacyViolation: {
    severity: 'critical',
    mitigation: 'access_controls + audit_logs',
    monitoring: 'continuous'
  },
  operationalChaos: {
    severity: 'high',
    mitigation: 'state_management + approval_workflows',
    monitoring: 'real_time'
  },
  modelHallucination: {
    severity: 'medium',
    mitigation: 'validation_layers + grounding',
    monitoring: 'continuous'
  }
} as const;
