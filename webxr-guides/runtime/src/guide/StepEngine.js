export default class StepEngine {
  constructor(guide) {
    this.guide = guide;
    this.currentStepIndex = -1;
    this.isActive = false;

    this.validate();
  }

  validate() {
    if (!this.guide || !Array.isArray(this.guide.steps) || this.guide.steps.length === 0) {
      throw new Error('Invalid guide: must have at least one step');
    }
  }

  start() {
    if (this.isActive) {
      console.warn('StepEngine: Guide already started');
      return;
    }
    this.isActive = true;
    this.currentStepIndex = 0;
    console.log(`[StepEngine] Guide started: "${this.guide.title}"`);
    console.log(`[StepEngine] Step ${this.currentStepIndex + 1}/${this.guide.steps.length}`);
    console.log(`[StepEngine] ${this.getCurrentStep().title}`);
  }

  getCurrentStep() {
    if (this.currentStepIndex < 0 || this.currentStepIndex >= this.guide.steps.length) {
      return null;
    }
    return this.guide.steps[this.currentStepIndex];
  }

  completeCurrentStep() {
    const step = this.getCurrentStep();
    if (!step) {
      console.warn('StepEngine: No current step to complete');
      return;
    }
    console.log(`[StepEngine] Step completed: "${step.title}"`);

    if (this.currentStepIndex === this.guide.steps.length - 1) {
      console.log(`[StepEngine] Guide finished: "${this.guide.title}"`);
      this.isActive = false;
    }
  }

  nextStep() {
    if (this.currentStepIndex >= this.guide.steps.length - 1) {
      console.warn('StepEngine: Already at final step');
      return false;
    }
    this.currentStepIndex++;
    const step = this.getCurrentStep();
    console.log(`[StepEngine] Step ${this.currentStepIndex + 1}/${this.guide.steps.length}`);
    console.log(`[StepEngine] ${step.title}`);
    return true;
  }

  previousStep() {
    if (this.currentStepIndex <= 0) {
      console.warn('StepEngine: Already at first step');
      return false;
    }
    this.currentStepIndex--;
    const step = this.getCurrentStep();
    console.log(`[StepEngine] Step ${this.currentStepIndex + 1}/${this.guide.steps.length}`);
    console.log(`[StepEngine] ${step.title}`);
    return true;
  }
}
