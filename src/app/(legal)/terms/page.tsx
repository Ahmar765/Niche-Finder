
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use | Niche Finder',
  description: 'The Terms of Use governing your access to and use of the Niche Finder platform.',
};

export default function TermsOfUsePage() {
  return (
    <article className="prose prose-invert prose-lg max-w-4xl mx-auto prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground">
      <h1>Terms of Use</h1>
      <p className="text-muted-foreground">Last updated: 17th May 2026</p>
      <p className="lead">
        Welcome to Niche Finder. These Terms of Use ("Terms") govern your access to and use of our website, platform, and services (collectively, the "Platform"). By creating an account or using our Platform, you agree to be bound by these Terms and our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <section>
        <h2>1. The Platform</h2>
        <p>
          Niche Finder provides a venture infrastructure operating system designed to assist entrepreneurs in identifying, validating, and developing business opportunities. Our services include AI-driven analysis, data scoring, financial modeling, and document generation (the "Services").
        </p>
      </section>
      
      <section>
        <h2>2. Account Registration and Eligibility</h2>
        <p>
          You must be at least 18 years old to use the Platform. You are responsible for providing accurate registration information and for all activities that occur under your account. You must keep your account credentials confidential.
        </p>
      </section>

      <section>
        <h2>3. Application Credit Units (ACUs) and Billing</h2>
        <ul>
          <li><strong>ACU Wallet:</strong> The Platform operates on a prepaid system using <strong>Application Credit Units ("ACUs")</strong>, which are held in your user wallet. ACUs are required to use most Services, particularly those involving AI generation, data analysis, or document export.</li>
          <li><strong>Purchasing ACUs:</strong> You may purchase ACUs through our designated payment methods. All purchases are final and non-refundable except as required by law. ACUs are a limited license to use features on the Platform; they are not a currency, have no monetary value outside of our Platform, and cannot be redeemed for cash.</li>
          <li><strong>Consumption of ACUs:</strong> We will clearly indicate the ACU cost of an action before you confirm it. For certain AI-driven tasks, we may debit a fixed cost for the action upon initiation. You are responsible for monitoring your ACU balance.</li>
          <li><strong>Free & Promotional ACUs:</strong> We may, at our discretion, grant you free or promotional ACUs. These credits are for limited, read-only, or promotional purposes and cannot be used for all Services, as detailed in our on-platform documentation and our <Link href="/how-it-works">"How It Works"</Link> page. Paid ACUs are required for all generation, unlock, and export features.</li>
          <li><strong>Pricing:</strong> We reserve the right to change the pricing for ACUs or the ACU cost of any Service at any time.</li>
          <li><strong>Non-Refundable:</strong> ACUs consumed for successfully completed actions (e.g., a generated report) are non-refundable. If a generation fails due to a technical error on our part, the debited ACUs will be refunded to your wallet.</li>
        </ul>
      </section>

      <section>
        <h2>4. AI Functionality and User Responsibility</h2>
        <p>
          Our Platform uses Artificial Intelligence ("AI") to generate content, scores, financial models, and other analysis ("Outputs"). You acknowledge and agree to the following:
        </p>
        <ul>
          <li><strong>Probabilistic Nature:</strong> AI Outputs are probabilistic and may contain inaccuracies, errors, or outdated information. They are not a substitute for professional advice.</li>
          <li><strong>For Informational Use Only:</strong> All Outputs are provided for informational purposes only and do not constitute financial, legal, investment, or business advice.</li>
          <li><strong>Your Sole Responsibility: You are solely responsible for reviewing, validating, and verifying all Outputs before relying on them.</strong> You must conduct your own independent due diligence and consult with qualified professionals. Niche Finder is not liable for any decisions, actions, losses, or damages resulting from your reliance on any Outputs.</li>
        </ul>
        <p>
          Please review our full <Link href="/disclaimer">Disclaimer</Link>, which is incorporated into these Terms.
        </p>
      </section>
      
      <section>
        <h2>5. Acceptable Use Policy</h2>
        <p>You agree not to misuse the Platform or help anyone else to do so. You must not:</p>
        <ul>
            <li>Scrape, reverse-engineer, or attempt to extract our proprietary data, scoring models, or AI prompts.</li>
            <li>Use automated systems to access the Platform in a manner that sends more request messages to our servers than a human can reasonably produce.</li>
            <li>Share your account credentials or allow others to use your account.</li>
            <li>Use the Platform for any illegal or fraudulent activity.</li>
            <li>Upload or transmit any malicious code, viruses, or harmful data.</li>
        </ul>
      </section>

      <section>
        <h2>6. Intellectual Property</h2>
        <p>
          We and our licensors own all right, title, and interest in and to the Platform and its underlying technology, including our scoring engine, AI models, and branding. You retain ownership of the factual content within the final documents (like business plans) you create and export. However, you do not gain any ownership rights in the underlying Platform, its design, or its components.
        </p>
      </section>
      
       <section>
        <h2>7. Suspension and Termination</h2>
        <p>
          We may suspend or terminate your access to the Platform at any time, without notice, for any reason, including a breach of these Terms. If we terminate your account for cause, your right to use the Platform and any ACUs in your wallet will be forfeited without a refund.
        </p>
      </section>
      
      <section>
        <h2>8. Disclaimers and Limitation of Liability</h2>
        <p>
          The Platform is provided "as is". To the fullest extent permitted by law, we disclaim all warranties and shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, resulting from your use of the Platform. Our total liability in any matter arising out of or related to these terms is limited to the greater of (a) £100 or (b) the aggregate amount you have paid for ACUs in the three months preceding the event giving rise to the liability.
        </p>
      </section>
      
      <section>
        <h2>9. Governing Law</h2>
        <p>
          These Terms shall be governed by the laws of England and Wales. The courts of England and Wales will have exclusive jurisdiction to resolve any dispute arising from these Terms.
        </p>
      </section>
      
      <section>
        <h2>10. Changes to Terms</h2>
        <p>
          We may modify these Terms at any time. We will notify you of any material changes. Your continued use of the Platform after any such change constitutes your acceptance of the new Terms.
        </p>
      </section>

      <section>
        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at <a href="mailto:support@nichefinder.io">support@nichefinder.io</a>.
        </p>
      </section>
    </article>
  );
}
