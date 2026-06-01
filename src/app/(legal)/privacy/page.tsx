
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Niche Finder',
  description: 'Understand how Niche Finder collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-4xl mx-auto prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: 17th May 2026</p>
        <p className="lead">
            Welcome to Niche Finder. We are committed to protecting your personal data and your right to privacy. This Privacy Policy explains how Niche Finder Ltd. ("we", "us", "our") collects, uses, discloses, and safeguards your information when you use our platform.
        </p>
        
        <section>
            <h2>1. What Data We Collect</h2>
            <p>We collect various types of information to provide and improve our service to you:</p>
            <ul>
                <li><strong>Personal Identification Information:</strong> Name and email address when you register. If you sign in via a third-party provider (e.g., Google), we receive your basic profile information as permitted by your settings with that provider.</li>
                <li><strong>User Profile Data:</strong> Optional information you may provide, such as your country of residence and a short bio.</li>
                <li><strong>Transaction & Wallet Data:</strong> Records of your Application Credit Unit (ACU) purchases, a full auditable ledger of your ACU consumption, and your current wallet balance. Your full payment details are handled by our payment processor (Stripe) and are never stored on our servers.</li>
                <li><strong>Usage & Input Data:</strong> Information on how you interact with our platform, including the search criteria you submit (e.g., country, budget, sectors), the features you use, and the content of files you may upload for analysis. This data is essential for the AI to perform its function.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and device information, collected automatically for security analytics and fraud prevention.</li>
                <li><strong>Communications:</strong> Any information you send to us when you contact our support team, including chat logs and email correspondence.</li>
            </ul>
        </section>
        
        <section>
            <h2>2. How We Use Your Data</h2>
            <p>We process your data based on our legitimate interest in operating our platform and for the performance of our contract with you. This includes:</p>
            <ul>
                <li><strong>To Provide and Manage our Service:</strong> To create and secure your account, operate the AI features, manage your ACU wallet, and provide customer support.</li>
                <li><strong>For Billing and Transactions:</strong> To process your payments for ACU top-ups and to maintain an auditable ledger of your credit consumption for your reference and for our accounting.</li>
                <li><strong>For AI Processing:</strong> To pass your inputs (e.g., search criteria, document text) to our AI service providers to generate the outputs you have requested.</li>
                <li><strong>For Security and Fraud Prevention:</strong> To protect our platform and user accounts from unauthorised access, fraud, or abuse.</li>
                <li><strong>For Service Improvement:</strong> To analyse aggregated and anonymised usage patterns to understand feature popularity, identify bugs, and improve the user experience. <strong>We do not use your personal inputs to train our own AI models without your explicit, separate consent.</strong></li>
                <li><strong>To Communicate With You:</strong> To send essential service-related announcements, security alerts, and support messages.</li>
            </ul>
        </section>

        <section>
            <h2>3. AI Processing and Third-Party Data Usage</h2>
            <p>When you use our AI features, the inputs you provide are sent to our third-party AI service providers (e.g., OpenAI, Google) to generate the outputs. We have Data Processing Agreements with these providers.</p>
            <p><strong>Crucially, as per our agreements with these providers, they do not use your business data or personal information to train their general AI models.</strong> Your inputs are processed solely to provide the service to us and are not retained by them for other purposes.</p>
        </section>

        <section>
            <h2>4. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal data. We only share your information with the following trusted third parties to the extent necessary to provide our service:</p>
            <ul>
                <li><strong>AI Service Providers:</strong> To power our AI-driven features (e.g., Google, OpenAI).</li>
                <li><strong>Payment Processors:</strong> To securely handle payments (e.g., Stripe).</li>
                <li><strong>Cloud Hosting Providers:</strong> To host our platform and store your data securely (e.g., Google Cloud Platform, Firebase).</li>
                <li><strong>Analytics Providers:</strong> To help us understand platform usage with anonymised data (e.g., Google Analytics).</li>
            </ul>
            <p>We may also disclose your data if required by law or to protect our legal rights.</p>
        </section>
        
        <section>
            <h2>5. Data Retention</h2>
            <p>We retain your personal data only for as long as necessary to fulfill the purposes for which we collected it. Your core account information and transaction history (for tax and legal compliance) are retained for 7 years after your account becomes inactive. Other data, such as search history, may be deleted sooner. You may request the deletion of your account and associated data at any time, subject to our legal obligations.</p>
        </section>

        <section>
            <h2>6. Data Security</h2>
            <p>We implement a variety of industry-standard security measures, including encryption and access controls, to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee its absolute security.</p>
        </section>

        <section>
            <h2>7. Your Data Protection Rights</h2>
            <p>Under applicable data protection laws (such as GDPR), you have various rights regarding your personal data:</p>
            <ul>
                <li>The right to access, update, or delete the information we have on you.</li>
                <li>The right of rectification.</li>
                <li>The right to object to processing.</li>
                <li>The right of restriction.</li>
                <li>The right to data portability.</li>
                <li>The right to withdraw consent.</li>
            </ul>
            <p>To exercise these rights, please contact us at <a href="mailto:privacy@nichefinder.io">privacy@nichefinder.io</a>. We will respond to your request within the timeframe required by law.</p>
        </section>
        
        <section>
            <h2>8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. The updated version will be indicated by a "Last updated" date. We encourage you to review it frequently.</p>
        </section>
        
        <section>
            <h2>9. Contact Us</h2>
            <p>If you have any questions or comments about this policy, you may email our Data Protection Officer at <a href="mailto:privacy@nichefinder.io">privacy@nichefinder.io</a> or by post to:</p>
            <p>
                Data Protection Officer
                <br/>
                Niche Finder Ltd.
                <br/>
                71-75 Shelton Street, Covent Garden
                <br />
                London, United Kingdom
                <br />
                WC2H 9JQ
            </p>
        </section>
    </article>
  );
}
