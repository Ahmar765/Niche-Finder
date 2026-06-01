
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Niche Finder',
  description: 'Learn about the mission and vision behind Niche Finder, the Venture Infrastructure Operating System.',
};

export default function AboutUsPage() {
  return (
    <>
      <article className="prose prose-invert prose-lg max-w-4xl mx-auto prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground">
        <h1>About Niche Finder</h1>
        <p className="lead">
          We are building the world’s premier venture infrastructure operating system, designed to help entrepreneurs find, validate, and build fundable business ideas with data-driven confidence.
        </p>

        <section>
          <h2>Our Mission</h2>
          <p>
            Our mission is to eliminate the primary cause of startup failure: building a product for a market that doesn't exist. We empower founders, builders, and investors with an OS that systematically uncovers high-potential niches, validates their commercial viability, and accelerates the path from idea to investor-ready venture.
          </p>
        </section>

        <section>
          <h2>The Problem We Exist to Solve</h2>
          <p>
            Millions of brilliant business ideas fail not because of poor execution, but because they are launched into poorly chosen markets with no real, validated demand. Traditional market research is slow, expensive, and often reliant on intuition. Aspiring entrepreneurs, particularly those with limited capital, lack the tools to identify opportunities with a genuine, validated prospect of success. The result is wasted time, wasted capital, and unrealised potential.
          </p>
        </section>
        
        <section>
          <h2>What Niche Finder Does</h2>
          <p>
            Niche Finder is a venture infrastructure operating system that transforms your initial constraints—such as country, industry, and budget—into a ranked list of specific, fundable business opportunities. Our system goes beyond generic ideas, providing deep analysis, automated financial modeling, and a clear, data-driven rationale for each recommendation.
          </p>
        </section>

        <section>
          <h2>What Makes Our Platform Different</h2>
          <p>
            We are not a simple idea generator. Niche Finder is an end-to-end operating system for opportunity validation and venture creation. Our key differentiators are:
          </p>
          <ul>
            <li><strong>Autonomous Venture Intelligence:</strong> Our system combines multiple AI layers to discover, score, and validate opportunities with commercial depth.</li>
            <li><strong>Proprietary Venture Scorecard:</strong> Every niche is evaluated against dozens of data points, resulting in a clear, comparable Overall Confidence Score that reflects its readiness, competitiveness, and prospect of success.</li>
            <li><strong>Execution-Ready Outputs:</strong> For each project, we provide a suite of investor-ready documents and financial models, enabling you to move from validation to fundraising with structured, professional assets.</li>
          </ul>
        </section>

        <section>
          <h2>How Our Model Works</h2>
          <p>
            Niche Finder operates on a transparent, pay-as-you-go model using <strong>Application Credit Units (ACUs)</strong>. This ensures you only pay for the value you receive. You are granted a complimentary balance upon signing up to explore the platform's read-only features. Paid ACUs are then consumed for specific, high-value actions such as generating new venture opportunities or creating investor-grade documents. Our model is designed for controlled, predictable consumption, putting you in charge of your spending.
          </p>
        </section>

        <section>
          <h2>Our Approach to Venture Intelligence</h2>
          <p>
            We view our platform's intelligence as a powerful co-pilot, not a replacement for human judgment. Our system is trained to act as a world-class venture analyst, processing vast amounts of information to identify patterns and opportunities that humans might miss. However, we stress that all generated outputs—from financial forecasts to market risks—are probabilistic and require your critical review. Our platform is a tool to enhance your decision-making, not to make decisions for you.
          </p>
        </section>

        <section>
          <h2>Who We Serve</h2>
          <p>
            Niche Finder is designed for ambitious entrepreneurs, early-stage founders, startup incubators, and angel investors who need a structured, data-driven approach to identifying and validating new ventures.
          </p>
        </section>

        <section className="text-center bg-secondary/30 p-8 rounded-xl">
          <h2 className="!mt-0">Ready to Find Your Niche?</h2>
          <p>
            Stop guessing. Start building. Your next venture is waiting to be discovered.
          </p>
          <div className="flex gap-4 mt-6 justify-center">
              <Button asChild size="lg">
                <Link href="/search">Find My Opportunity</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
          </div>
        </section>
      </article>
    </>
  );
}
