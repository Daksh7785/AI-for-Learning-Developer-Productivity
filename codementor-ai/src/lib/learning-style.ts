export type LearningStyle = 'visual' | 'textual' | 'interactive' | 'auditory';

export interface LearningStyleProfile {
  primaryStyle: LearningStyle;
  secondaryStyle?: LearningStyle;
  confidenceScore: number;
  preferences: {
    prefersDiagrams: boolean;
    prefersCodeExamples: boolean;
    prefersStepByStep: boolean;
    prefersConceptualOverview: boolean;
    prefersHandsOnPractice: boolean;
  };
  interactionHistory: InteractionRecord[];
}

export interface InteractionRecord {
  timestamp: Date;
  type: 'question' | 'code_view' | 'diagram_view' | 'explanation_request' | 'practice_attempt';
  content: string;
  responseLength: number;
  userSatisfaction?: number; // 1-5 scale
}

export class LearningStyleDetector {
  private profile: LearningStyleProfile;
  private interactionHistory: InteractionRecord[] = [];

  constructor() {
    this.profile = this.initializeProfile();
  }

  private initializeProfile(): LearningStyleProfile {
    return {
      primaryStyle: 'textual',
      confidenceScore: 0,
      preferences: {
        prefersDiagrams: false,
        prefersCodeExamples: true,
        prefersStepByStep: true,
        prefersConceptualOverview: false,
        prefersHandsOnPractice: false,
      },
      interactionHistory: [],
    };
  }

  recordInteraction(record: InteractionRecord) {
    this.interactionHistory.push(record);
    this.profile.interactionHistory.push(record);
    this.updateProfile();
  }

  private updateProfile() {
    if (this.interactionHistory.length < 5) {
      this.profile.confidenceScore = Math.min(
        this.profile.confidenceScore + 10,
        50
      );
      return;
    }

    const recentInteractions = this.interactionHistory.slice(-20);
    const styleScores = this.calculateStyleScores(recentInteractions);

    // Determine primary style
    const sortedStyles = Object.entries(styleScores).sort((a, b) => b[1] - a[1]);
    this.profile.primaryStyle = sortedStyles[0][0] as LearningStyle;
    this.profile.secondaryStyle = sortedStyles[1][0] as LearningStyle;

    // Update confidence score based on consistency
    const maxScore = sortedStyles[0][1];
    const secondScore = sortedStyles[1][1];
    const consistency = maxScore - secondScore;
    this.profile.confidenceScore = Math.min(
      Math.round((consistency / maxScore) * 100),
      100
    );

    // Update preferences based on interaction patterns
    this.updatePreferences(recentInteractions);
  }

  private calculateStyleScores(
    interactions: InteractionRecord[]
  ): Record<LearningStyle, number> {
    const scores: Record<LearningStyle, number> = {
      visual: 0,
      textual: 0,
      interactive: 0,
      auditory: 0,
    };

    interactions.forEach(interaction => {
      switch (interaction.type) {
        case 'diagram_view':
          scores.visual += 3;
          scores.interactive += 1;
          break;
        case 'code_view':
          scores.textual += 2;
          scores.interactive += 1;
          break;
        case 'explanation_request':
          scores.textual += 2;
          scores.auditory += 1;
          break;
        case 'practice_attempt':
          scores.interactive += 3;
          break;
        case 'question':
          scores.textual += 1;
          scores.auditory += 1;
          break;
      }

      // Consider user satisfaction
      if (interaction.userSatisfaction && interaction.userSatisfaction >= 4) {
        scores[this.profile.primaryStyle] += 2;
      }
    });

    return scores;
  }

  private updatePreferences(interactions: InteractionRecord[]) {
    const diagramViews = interactions.filter(i => i.type === 'diagram_view').length;
    const codeViews = interactions.filter(i => i.type === 'code_view').length;
    const practiceAttempts = interactions.filter(i => i.type === 'practice_attempt').length;
    const explanationRequests = interactions.filter(
      i => i.type === 'explanation_request'
    ).length;

    const total = interactions.length || 1;

    this.profile.preferences.prefersDiagrams = diagramViews / total > 0.3;
    this.profile.preferences.prefersCodeExamples = codeViews / total > 0.4;
    this.profile.preferences.prefersStepByStep = explanationRequests / total > 0.3;
    this.profile.preferences.prefersHandsOnPractice = practiceAttempts / total > 0.2;
    this.profile.preferences.prefersConceptualOverview =
      explanationRequests / total > 0.25;
  }

  getProfile(): LearningStyleProfile {
    return { ...this.profile };
  }

  getAdaptedExplanation(baseExplanation: string): string {
    const style = this.profile.primaryStyle;
    const prefs = this.profile.preferences;

    switch (style) {
      case 'visual':
        return this.adaptForVisual(baseExplanation, prefs);
      case 'textual':
        return this.adaptForTextual(baseExplanation, prefs);
      case 'interactive':
        return this.adaptForInteractive(baseExplanation, prefs);
      case 'auditory':
        return this.adaptForAuditory(baseExplanation, prefs);
      default:
        return baseExplanation;
    }
  }

  private adaptForVisual(explanation: string, prefs: any): string {
    let adapted = explanation;

    if (prefs.prefersDiagrams) {
      adapted = `
📊 **Visual Explanation**

${explanation}

💡 **Tip:** Consider viewing the architecture diagram to see how these components connect visually.
      `.trim();
    }

    if (prefs.prefersConceptualOverview) {
      adapted = `
🎯 **Big Picture View**

${explanation}

🔍 **Key Concept:** Focus on understanding the overall structure first, then dive into details.
      `.trim();
    }

    return adapted;
  }

  private adaptForTextual(explanation: string, prefs: any): string {
    let adapted = explanation;

    if (prefs.prefersCodeExamples) {
      adapted = `
📝 **Detailed Explanation**

${explanation}

💻 **Code Example:** Here's how this looks in practice:
      `.trim();
    }

    if (prefs.prefersStepByStep) {
      adapted = `
📋 **Step-by-Step Guide**

${this.addStepByStepStructure(explanation)}
      `.trim();
    }

    return adapted;
  }

  private adaptForInteractive(explanation: string, prefs: any): string {
    let adapted = explanation;

    if (prefs.prefersHandsOnPractice) {
      adapted = `
🎮 **Interactive Learning**

${explanation}

🚀 **Try This:** Practice by modifying the code and observing the changes.
      `.trim();
    }

    adapted += `

📚 **Next Steps:** 
1. Review the code example
2. Try it yourself
3. Ask questions if stuck
    `;

    return adapted;
  }

  private adaptForAuditory(explanation: string, prefs: any): string {
    let adapted = explanation;

    adapted = `
🎧 **Learn by Explaining**

${explanation}

💬 **Discussion Point:** Try explaining this concept in your own words to reinforce understanding.
    `.trim();

    return adapted;
  }

  private addStepByStepStructure(explanation: string): string {
    const sentences = explanation.split('. ');
    const steps = sentences.map((sentence, index) => {
      return `${index + 1}. ${sentence.trim()}`;
    });

    return steps.join('\n');
  }

  getSuggestedLearningResources(topic: string): string[] {
    const style = this.profile.primaryStyle;
    const resources: Record<LearningStyle, string[]> = {
      visual: [
        `📊 View the architecture diagram for ${topic}`,
        `🎨 Watch a visual walkthrough of ${topic}`,
        `🖼️ Study the component relationships`,
      ],
      textual: [
        `📖 Read the detailed documentation for ${topic}`,
        `📝 Study the code examples`,
        `📚 Review the implementation details`,
      ],
      interactive: [
        `🎮 Try the interactive tutorial for ${topic}`,
        `💻 Practice with hands-on exercises`,
        `🔧 Experiment with the code`,
      ],
      auditory: [
        `🎧 Listen to an explanation of ${topic}`,
        `💬 Discuss ${topic} with peers`,
        `🗣️ Explain ${topic} in your own words`,
      ],
    };

    return resources[style];
  }

  reset() {
    this.profile = this.initializeProfile();
    this.interactionHistory = [];
  }

  exportProfile(): string {
    return JSON.stringify(this.profile, null, 2);
  }

  importProfile(profileJson: string): void {
    try {
      const profile = JSON.parse(profileJson);
      this.profile = profile;
      this.interactionHistory = profile.interactionHistory || [];
    } catch (error) {
      console.error('Failed to import profile:', error);
    }
  }
}
