// ============================================================
// NICHE FINDER — ACU MONETISATION SYSTEM UPGRADE
// ============================================================

export const ACU_SYSTEM = {
  platformBaseCurrency: "GBP",

  conversion: {
    gbpToAcu: 100, // £1 = 100 ACUs
  },

  welcomeBonus: {
    enabled: true,
    amount: 100,
    type: "welcome_free_acu",
    grantedOncePerUser: true,
    expires: false,

    restrictions: {
      paidGenerationAllowed: false,
      exportsAllowed: false,
      unlockAllowed: false,
      investorOutputsAllowed: false,
      financialOutputsAllowed: false,
      templateSelectionAllowed: false,

      allowedActions: [
        "read_preview_niche_information",
        "view_basic_search_result",
        "view_basic_score_preview",
        "view_read_only_dashboard",
      ],
    },
  },

  walletTypes: {
    free: "free_acu",
    paid: "paid_acu",
    bonus: "bonus_acu",
    admin: "admin_acu",
  },

  spendingPriority: [
    "paid_acu",
    "bonus_acu",
    "admin_acu",
  ],

  freeAcuRule:
    "Free welcome ACUs cannot be used for generation, unlocks, exports, financials, pitch decks, business plans, investor packs, or full build actions.",
};
