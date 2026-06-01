# **App Name**: Niche Finder AI

## Core Features:

- Niche Identification: Identify profitable business niches with startup costs ≤ $10,000 USD/EUR, using the country as the primary search key and applying the five-sector model. AI Tool to reason about startup costs.
- Economic Constraint Enforcement: Implement an Active Credit Unit (ACU) system to govern AI executions, ensuring that for every $1 in, the user realizes $3 out. Log the details to Firestore.
- Modular AI Scoring Engine: Develop a scoring engine with deterministic weights to evaluate niches, rating them on a scale of 0-10: 8-10 (Green: High), 5-7 (Amber: Moderate), 0-4 (Red: Low).
- Sector Taxonomy Display: Display business niches categorized according to the Five-Sector Model: Primary, Secondary, Tertiary, Quaternary, and Quinary.
- Mobile-Friendly Interface: Develop a mobile-friendly interface using USSD/WhatsApp logic, in addition to the Next.js 14 web frontend.
- Environment Configuration: Manage separate Firebase environments (dev/staging/prod) with corresponding configurations, ensuring security rules align with economic boundaries.
- Niche Detail View: Displays complete details and scoring information for each niche. 

## Style Guidelines:

- Primary color: Vibrant blue (#29ABE2) to reflect innovation and trust within the tech sector.
- Background color: Light blue (#E1F5FE), a desaturated shade of the primary hue for a clean and professional feel.
- Accent color: Turquoise (#30D5C8), an analogous color, offers a refreshing and energetic feel.
- Body and headline font: 'Inter', a grotesque-style sans-serif for a modern, neutral, and objective look that will work well in both headlines and body text.
- Use simple, modern icons to represent each business sector. 
- Design a clean, intuitive layout optimized for both web and mobile (USSD/WhatsApp) interfaces.
- Incorporate subtle animations on niche discovery and data updates to enhance user engagement.