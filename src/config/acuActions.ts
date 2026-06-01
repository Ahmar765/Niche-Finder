// ============================================================
// NICHE FINDER — FULL ACTION ACU MAP
// ============================================================

export const NICHE_FINDER_ACU_ACTIONS = {
  // -------------------------
  // READ-ONLY / DISCOVERY
  // Free welcome ACUs can only be used here
  // -------------------------
  read_preview_niche_information: {
    cost: 25,
    allowsFreeAcu: true,
    label: "Read Niche Preview",
  },

  view_basic_search_result: {
    cost: 25,
    allowsFreeAcu: true,
    label: "View Basic Search Result",
  },

  view_basic_score_preview: {
    cost: 25,
    allowsFreeAcu: true,
    label: "View Basic Score Preview",
  },

  // -------------------------
  // SEARCH
  // Paid ACUs required
  // -------------------------
  niche_search: {
    cost: 100,
    allowsFreeAcu: true,
    label: "Niche Search",
  },

  no_idea_search: {
    cost: 125,
    allowsFreeAcu: false,
    label: "No Idea Search",
  },

  boring_business_search: {
    cost: 125,
    allowsFreeAcu: false,
    label: "Boring Business Search",
  },

  diaspora_opportunity_search: {
    cost: 150,
    allowsFreeAcu: false,
    label: "Diaspora Opportunity Search",
  },

  skills_to_business_search: {
    cost: 150,
    allowsFreeAcu: false,
    label: "Skills-to-Business Search",
  },

  asset_to_business_search: {
    cost: 150,
    allowsFreeAcu: false,
    label: "Asset-to-Business Search",
  },

  problem_to_business_search: {
    cost: 150,
    allowsFreeAcu: false,
    label: "Problem-to-Business Search",
  },

  // -------------------------
  // UNLOCKS / INSIGHTS
  // -------------------------
  unlock_full_opportunity: {
    cost: 150,
    allowsFreeAcu: false,
    label: "Unlock Full Opportunity",
  },

  unlock_locked_insights: {
    cost: 200,
    allowsFreeAcu: false,
    label: "Unlock Strategic Insights",
  },

  niche_expansion_map: {
    cost: 200,
    allowsFreeAcu: false,
    label: "Niche Expansion Map",
  },

  deep_niche_comparison: {
    cost: 250,
    allowsFreeAcu: false,
    label: "Deep Niche Comparison",
  },

  decision_assistant: {
    cost: 200,
    allowsFreeAcu: false,
    label: "Decision Assistant",
  },

  // -------------------------
  // VALIDATION
  // -------------------------
  market_validation: {
    cost: 250,
    allowsFreeAcu: false,
    label: "Market Validation Report",
  },

  benchmark_report: {
    cost: 250,
    allowsFreeAcu: false,
    label: "Benchmark Report",
  },

  confidence_report: {
    cost: 200,
    allowsFreeAcu: false,
    label: "Confidence Report",
  },

  risk_heatmap: {
    cost: 250,
    allowsFreeAcu: false,
    label: "Risk Heatmap",
  },

  regulation_warning_report: {
    cost: 150,
    allowsFreeAcu: false,
    label: "Regulation Warning Report",
  },

  // -------------------------
  // FINANCIALS
  // -------------------------
  cashflow_forecast_3yr: {
    cost: 250,
    allowsFreeAcu: false,
    label: "3-Year Cashflow Forecast",
  },

  profit_loss_3yr: {
    cost: 220,
    allowsFreeAcu: false,
    label: "3-Year Profit & Loss",
  },

  excel_financial_model: {
    cost: 350,
    allowsFreeAcu: false,
    label: "Excel Financial Model",
  },

  scenario_builder_single: {
    cost: 300,
    allowsFreeAcu: false,
    label: "Single Scenario Builder",
  },

  scenario_builder_bundle: {
    cost: 700,
    allowsFreeAcu: false,
    label: "Scenario Builder Bundle",
  },

  unit_economics_builder: {
    cost: 250,
    allowsFreeAcu: false,
    label: "Unit Economics Builder",
  },

  pricing_builder: {
    cost: 200,
    allowsFreeAcu: false,
    label: "Pricing Builder",
  },

  revenue_model_simulator: {
    cost: 250,
    allowsFreeAcu: false,
    label: "Revenue Model Simulator",
  },

  financial_dashboard_view: {
    cost: 150,
    allowsFreeAcu: false,
    label: "View Full Financial Dashboard",
  },

  financial_dashboard_refresh: {
    cost: 120,
    allowsFreeAcu: false,
    label: "Refresh Financial Dashboard",
  },

  financial_dashboard_pdf_export: {
    cost: 150,
    allowsFreeAcu: false,
    label: "Export Financial Dashboard PDF",
  },

  financial_dashboard_excel_export: {
    cost: 350,
    allowsFreeAcu: false,
    label: "Export Financial Dashboard Excel",
  },

  financial_dashboard_powerpoint_export: {
    cost: 200,
    allowsFreeAcu: false,
    label: "Export Financial Dashboard PowerPoint",
  },

  financial_scenario_dashboard: {
    cost: 300,
    allowsFreeAcu: false,
    label: "Generate Scenario Dashboard",
  },

  financial_unit_economics_dashboard: {
    cost: 250,
    allowsFreeAcu: false,
    label: "Generate Unit Economics Dashboard",
  },

  // -------------------------
  // EXECUTION
  // -------------------------
  first_1000_plan: {
    cost: 200,
    allowsFreeAcu: false,
    label: "First £1,000 Plan",
  },

  first_customer_plan: {
    cost: 200,
    allowsFreeAcu: false,
    label: "First Customer Plan",
  },

  business_starter_pack: {
    cost: 350,
    allowsFreeAcu: false,
    label: "Business Starter Pack",
  },

  execution_roadmap: {
    cost: 300,
    allowsFreeAcu: false,
    label: "Execution Roadmap",
  },

  operations_blueprint: {
    cost: 300,
    allowsFreeAcu: false,
    label: "Operations Blueprint",
  },

  sales_script_pack: {
    cost: 200,
    allowsFreeAcu: false,
    label: "Sales Script Pack",
  },

  launch_offer_generator: {
    cost: 200,
    allowsFreeAcu: false,
    label: "Launch Offer Generator",
  },

  marketing_channel_recommender: {
    cost: 200,
    allowsFreeAcu: false,
    label: "Marketing Channel Recommender",
  },

  // -------------------------
  // INVESTOR OUTPUTS
  // -------------------------
  business_plan: {
    cost: 500,
    allowsFreeAcu: false,
    label: "Investor Business Plan",
  },

  business_plan_pdf_export: {
    cost: 150,
    allowsFreeAcu: false,
    label: "Business Plan PDF Export",
  },

  investor_pitch_deck_standard: {
    cost: 500,
    allowsFreeAcu: false,
    label: "Standard Investor Pitch Deck",
  },

  investor_pitch_deck_premium: {
    cost: 650,
    allowsFreeAcu: false,
    label: "Premium Investor Pitch Deck",
  },

  investor_pitch_deck_elite: {
    cost: 850,
    allowsFreeAcu: false,
    label: "Elite Investor Pitch Deck",
  },

  powerpoint_export: {
    cost: 200,
    allowsFreeAcu: false,
    label: "PowerPoint Export",
  },

  investor_memo: {
    cost: 350,
    allowsFreeAcu: false,
    label: "Investor Memo",
  },

  market_entry_strategy: {
    cost: 350,
    allowsFreeAcu: false,
    label: "Market Entry Strategy",
  },

  full_investor_package: {
    cost: 1500,
    allowsFreeAcu: false,
    label: "Full Investor Package",
  },

  local_business_pack: {
    cost: 700,
    allowsFreeAcu: false,
    label: "Local Business Pack",
  },

  digital_business_pack: {
    cost: 900,
    allowsFreeAcu: false,
    label: "Digital Business Pack",
  },

  boring_business_pack: {
    cost: 750,
    allowsFreeAcu: false,
    label: "Boring Business Pack",
  },
  
  // -------------------------
  // SUPPORT
  // -------------------------
  support_chat_message: {
    cost: 1,
    allowsFreeAcu: true,
    label: "Support Chat Message",
  },

} as const;


export type NicheFinderAcuActionKey = keyof typeof NICHE_FINDER_ACU_ACTIONS;

export function getAcuCost(actionKey: NicheFinderAcuActionKey): number {
  const action = NICHE_FINDER_ACU_ACTIONS[actionKey];
  if (!action) {
    console.warn(`ACU cost for action "${actionKey}" not found. Defaulting to 0.`);
    return 0;
  }
  return action.cost;
}
