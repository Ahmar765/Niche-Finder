
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'How It Works | Niche Finder OS',
  description: 'Learn how the Niche Finder Operating System uses venture intelligence to help you discover, validate, and build your next venture.',
};

export default function HowItWorksPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-4xl mx-auto prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground">
      <h1>The Niche Finder OS: How It Works</h1>
      <p className="lead">
        Niche Finder is a venture infrastructure operating system. It transforms the complex process of venture creation into a clear, automated, step-by-step journey, taking you from a raw idea to an investor-ready plan with speed, clarity, and data-driven confidence.
      </p>

      <section>
        <h2>Who The OS Is For</h2>
        <p>
          Niche Finder is built for the architects of tomorrow's economy:
        </p>
        <ul>
          <li><strong>Aspiring & Early-Stage Entrepreneurs</strong> seeking to find and validate a fundable business idea before committing significant time and capital.</li>
          <li><strong>Startup Incubators & Accelerators</strong> looking for a tool to help their cohorts systematically evaluate opportunities.</li>
          <li><strong>Angel Investors & Venture Analysts</strong> who need a rapid, data-driven way to assess the viability of potential investments.</li>
          <li><strong>Existing Business Owners</strong> exploring opportunities for diversification or expansion into new markets.</li>
        </ul>
      </section>

      <section>
        <h2>The Venture Project Lifecycle</h2>
        <p>Our OS guides you through a structured project lifecycle, ensuring no step is missed.</p>
        <ol>
          <li><strong>Search:</strong> Use the Search Canvas to define your constraints. The system's Opportunity Discovery Agent generates a set of distinct, hyper-specific venture projects.</li>
          <li><strong>Shortlist:</strong> Review your ranked list of opportunities. Each is presented with a title, a short summary, and a proprietary Overall Confidence Score, allowing you to quickly compare potential. This creates a `shortlisted` project in your portfolio.</li>
          <li><strong>Unlock:</strong> When a project shows promise, use your paid Application Credit Units (ACUs) to unlock the full Deep-Dive Analysis. This provides an investor-grade breakdown and moves the project to an `unlocked` state.</li>
          <li><strong>Build & Generate:</strong> Use the OS to generate market validation reports, financial forecasts, and business plans. Each action consumes ACUs, generates a saved asset, and progresses your project status (e.g., `validated`, `financial_ready`).</li>
          <li><strong>Package & Export:</strong> Create investor-ready pitch decks and download professional Excel models and PDFs, moving your project to `pitch_ready` and `investor_ready`.</li>
        </ol>
      </section>

      <section>
        <h2>The AI Venture Intelligence Engine</h2>
        <p>
          Our platform's core is a sophisticated multi-agent AI system trained to act as a venture analyst. When you submit a search, it evaluates your criteria against a vast dataset of economic indicators, market trends, and business models to generate its recommendations. The scores it provides are derived from a proprietary neural scoring model that assesses factors like market readiness, competitiveness, and potential for success.
        </p>
        <p className="font-bold">
          Crucially, all generated outputs are probabilistic and designed to augment, not replace, your judgment. You are the final decision-maker.
        </p>
      </section>

      <section>
        <h2>How Credits (ACUs) and Billing Work</h2>
        <p>
          The OS operates on a transparent, prepaid credit system using <strong>Application Credit Units (ACUs)</strong>. This model puts you in complete control of your spending.
        </p>
        <ul>
            <li><strong>Welcome Bonus:</strong> New users receive a complimentary balance of Welcome ACUs to explore the platform's read-only features.</li>
            <li><strong>Paid Actions:</strong> All generative actions (like searching for ideas, unlocking full reports, or creating documents like financial forecasts or pitch decks) require purchased "Paid ACUs".</li>
            <li><strong>Transparent Costs:</strong> Every paid action clearly displays the ACU cost before you commit. You only pay for what you use.</li>
            <li><strong>Topping Up:</strong> You can purchase additional ACUs at any time through our secure payment portal. Unused paid ACUs do not expire.</li>
        </ul>
      </section>

      <section>
        <h2>What You Remain Responsible For</h2>
        <p>Niche Finder is a powerful tool, but your expertise is essential. You are always responsible for:</p>
        <ul>
          <li><strong>Critical Review:</strong> Thoroughly reviewing and fact-checking all generated outputs, including financial data and market analysis.</li>
          <li><strong>Due Diligence:</strong> Conducting your own independent research and seeking professional legal, financial, and business advice.</li>
          <li><strong>Final Decisions:</strong> Making the final call on which venture to pursue and how to execute it. Our platform provides decision support, not decisions themselves.</li>
        </ul>
      </section>
      
       <section>
        <h2>Privacy and The Venture Memory Layer</h2>
        <p>
          Your trust is our priority. Every action you take is autosaved to your private Venture Memory. This allows the OS to learn your preferences and provide increasingly intelligent recommendations over time. We do not sell your personal data to third parties. For full details, please review our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>
      
      <section>
        <div className="text-center p-8 bg-secondary/30 rounded-xl not-prose">
            <h2 className="!mt-0">Ready to Build Your Next Venture?</h2>
            <p>Start your search today and turn your entrepreneurial vision into a data-driven, investor-ready execution plan.</p>
            <div className="mt-6">
                <Button asChild size="lg">
                    <Link href="/search">Find My Opportunity</Link>
                </Button>
            </div>
        </div>
      </section>
      
      <p className="text-center text-sm text-muted-foreground mt-8">
        By continuing to use Niche Finder, you agree to our <Link href="/terms">Terms of Use</Link> and acknowledge our <Link href="/privacy">Privacy Policy</Link>, <Link href="/disclaimer">Disclaimer</Link>, and <Link href="/cookies">Cookies Policy</Link>.
      </p>
    </article>
  );
}
