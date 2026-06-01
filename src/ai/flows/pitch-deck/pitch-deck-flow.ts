'use server';

import PptxGenJS from "pptxgenjs";
import { z } from "zod";
import { getPitchTemplate, type PitchTemplate } from "./pitch-templates";
import { UniversalAIClient } from "@/backend/ai/universal-ai-provider";
import { buildInvestorPitchPrompt, type SelectedNichePitchInput } from "./pitch-prompt-builder";
import type { NicheFinderAcuActionKey } from "@/config/acuActions";

export interface PitchDeckInput {
  projectName: string;
  niche: string;
  country: string;
  problem: string;
  solution: string;
  targetMarket: string;
  businessModel: string;
  financials: {
    revenueYear1: number;
    revenueYear2: number;
    revenueYear3: number;
    profitYear1?: number; // Making these optional to match new prompt builder
    profitYear2?: number;
    profitYear3?: number;
  };
}

const SlideSchema = z.object({
  title: z.string(),
  bullets: z.array(z.string()),
});
const AIResponseSchema = z.object({
  slides: z.array(SlideSchema),
});
export type Slides = z.infer<typeof AIResponseSchema>['slides'];


const generateAIContent = async (template: PitchTemplate, data: PitchDeckInput): Promise<Slides> => {
  const aiClient = new UniversalAIClient();
  
  // Map the simpler PitchDeckInput to the more detailed SelectedNichePitchInput
  // for the new prompt builder, using placeholders where necessary.
  const nichePitchInput: SelectedNichePitchInput = {
    projectName: data.projectName,
    nicheTitle: data.niche,
    country: data.country,
    sector: 'Not Specified', // This info isn't in PitchDeckInput
    problem: data.problem,
    solution: data.solution,
    targetCustomer: data.targetMarket,
    marketDrivers: [], // Placeholder
    readinessScore: 8, // Placeholder
    competitivenessScore: 7, // Placeholder
    successScore: 8, // Placeholder
    confidenceScore: 85, // Placeholder
    businessModel: data.businessModel,
    revenueStreams: [data.businessModel], // Placeholder
    pricingModel: 'Not Specified', // Placeholder
    competitors: ['Indirect Competitor A', 'New Entrant B'], // Placeholder
    competitiveAdvantages: ['Proprietary technology', 'First-mover advantage'], // Placeholder
    goToMarketChannels: ['Direct Sales', 'Online Marketing'], // Placeholder
    milestones: ['Q1: Launch MVP', 'Q3: Reach 1k users'], // Placeholder
    financials: {
        ...data.financials,
        profitYear1: data.financials.profitYear1 ?? data.financials.revenueYear1 * 0.3,
        profitYear2: data.financials.profitYear2 ?? data.financials.revenueYear2 * 0.4,
        profitYear3: data.financials.profitYear3 ?? data.financials.revenueYear3 * 0.45,
    },
  };

  const prompt = buildInvestorPitchPrompt({
    templateId: template.id,
    niche: nichePitchInput,
  });


    const result = await aiClient.generateText({
        systemPrompt: prompt,
        messages: [{ role: 'user', content: `Generate the pitch deck content for ${data.projectName} now based on the detailed system prompt.` }],
        jsonMode: true,
        allowFallback: true,
        temperature: 0.6,
        maxOutputTokens: 8192,
        featureType: 'long_chat',
        tier: 'professional',
        preferredProvider: 'openai',
    });
    
    const parsed = AIResponseSchema.parse(JSON.parse(result.text));
    return parsed.slides;
};


const exportToPowerPoint = async (slides: Slides, template: PitchTemplate): Promise<string> => {
    const pptx = new PptxGenJS();
    
    pptx.defineLayout({ name: 'A4', width: 11.7, height: 8.3 });
    pptx.layout = 'A4';

    slides.forEach((slideData, index) => {
        const slide = pptx.addSlide();
        
        slide.background = { color: template.theme.background.replace('#','') };

        slide.addText(slideData.title, {
            x: 0.5,
            y: 0.25,
            w: '90%',
            h: 0.75,
            fontSize: 28,
            bold: true,
            color: template.theme.primary.replace('#',''),
        });

        slide.addText(slideData.bullets.join('\n\n'), {
            x: 0.5,
            y: 1.2,
            w: '90%',
            h: '75%',
            fontSize: 14,
            bullet: true,
            color: template.theme.text.replace('#',''),
        });

         slide.addText(`${index + 1}`, {
            x: '90%',
            y: '92%',
            w: '5%',
            h: '5%',
            fontSize: 10,
            color: template.theme.accent.replace('#',''),
            align: 'right'
        });
    });

    return await pptx.write('base64');
};


export const generatePitchDeckFlow = async (templateId: string, data: PitchDeckInput): Promise<{ fileContent: string, fileName: string }> => {
    const template = getPitchTemplate(templateId);

    // 1. Generate AI content for the slides
    const slides = await generateAIContent(template, data);
    
    // 2. Export the content to a PowerPoint file (in memory as base64)
    const fileContent = await exportToPowerPoint(slides, template);
    
    // 3. Define the filename for download
    const fileName = `PitchDeck_${template.name.replace(/\s+/g, '_')}_${Date.now()}.pptx`;
    
    return { fileContent, fileName };
}
