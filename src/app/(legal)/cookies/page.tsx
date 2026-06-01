
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookies Policy | Niche Finder',
  description: 'Learn how Niche Finder uses cookies to operate and improve the platform.',
};

export default function CookiesPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-4xl mx-auto prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground">
      <h1>Cookies Policy</h1>
      <p className="text-muted-foreground">Last updated: 17th May 2026</p>
      <p className="lead">
        This Cookies Policy explains how Niche Finder Ltd. ("we", "us", or "our") uses cookies and similar technologies to recognise you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
      </p>

      <section>
        <h2>What are cookies?</h2>
        <p>
          A cookie is a small data file placed on your device when you visit a website. Cookies are widely used to make websites work, or to work more efficiently, as well as to provide reporting information.
        </p>
        <p>
          Cookies set by us are called "first-party cookies". Cookies set by parties other than us are called "third-party cookies", which enable third-party features like analytics and marketing.
        </p>
      </section>

      <section>
        <h2>Why do we use cookies?</h2>
        <p>
          We use cookies for several reasons. Some are required for technical reasons for our Platform to operate ("essential cookies"). Others help us analyse traffic and user behaviour to improve our service ("analytics cookies"), while others are used for marketing purposes ("marketing cookies").
        </p>
      </section>

      <section>
        <h2>What types of cookies do we use?</h2>
        <p>The specific types of cookies served through our website and their purposes are described below:</p>
        
        <h3>Strictly Necessary Cookies</h3>
        <p>These cookies are essential for the Platform to function and cannot be switched off. They are used to manage your authentication state, maintain your session, and remember your cookie consent preferences.</p>
        <ul>
            <li><strong>Firebase Auth Cookies:</strong> Used by Google Firebase to manage your authentication state and keep you logged in securely.</li>
            <li><strong>localConsent:</strong> The cookie used to store your consent choices from our cookie banner. It expires after 30 days.</li>
        </ul>
        
        <h3>Analytics and Performance Cookies</h3>
        <p>These cookies collect information to help us analyse traffic and understand how users interact with our Platform. This helps us improve our service. We only load these cookies with your explicit consent.</p>
        <ul>
            <li><strong>Google Analytics:</strong> Helps us understand user behaviour on our site to improve features and usability.</li>
        </ul>

        <h3>Marketing Cookies</h3>
        <p>These cookies are used to make advertising messages more relevant to you and to measure the effectiveness of our campaigns. We only load these cookies with your explicit consent.</p>
        <ul>
            <li><strong>Meta Pixel (Facebook):</strong> Allows us to measure, optimise and build audiences for our advertising campaigns on the Meta platform.</li>
        </ul>
      </section>

      <section>
        <h2>How can you control cookies?</h2>
        <p>
          You have the right to decide whether to accept or reject non-essential cookies. You can exercise your cookie preferences at any time by using our cookie consent banner, which appears on your first visit. Rejecting non-essential cookies will not prevent you from using our Platform.
        </p>
        <p>
          Most web browsers also allow you to control cookies through their settings. Please visit your browser's help menu for more information.
        </p>
      </section>

       <section>
        <h2>Contact Us</h2>
        <p>If you have any questions about our use of cookies, please email us at <a href="mailto:privacy@nichefinder.io">privacy@nichefinder.io</a>.</p>
      </section>
    </article>
  );
}
