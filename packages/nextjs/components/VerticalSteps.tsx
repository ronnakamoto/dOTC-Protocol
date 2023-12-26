import { ReactNode } from "react";

interface Step {
  label: string;
  content: ReactNode;
  isDisabled?: boolean;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onJumpToStep: (step: number) => void;
}

export default function VerticalSteps({ steps, currentStep, onNext, onPrev, onSubmit, onJumpToStep }: StepsProps) {
  return (
    <div className="grid grid-cols-12 gap-4 w-full">
      <div className="col-span-4">
        <div className="steps steps-vertical w-full">
          {steps.map((step, index) => (
            <div key={step.label}>
              <div
                onClick={() => onJumpToStep(index)}
                className={`step cursor-pointer ${
                  index === currentStep
                    ? "step-primary text-primary text-lg font-extrabold transition-colors duration-500 ease-in-out delay-200"
                    : ""
                } ${step.isDisabled ? "step-disabled" : ""}`}
              >
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-8 border border-l-2 border-primary border-b-0 border-r-0 p-2 pl-4 border-t-0">
        {steps[currentStep].content}
      </div>

      <div className="col-span-12 pt-5 flex justify-end">
        {currentStep > 0 && (
          <button className="btn btn-sm btn-primary mr-2" onClick={onPrev}>
            Previous
          </button>
        )}
        {currentStep < steps.length - 1 && (
          <button className="btn btn-sm btn-primary" onClick={onNext}>
            Next
          </button>
        )}
        {currentStep === steps.length - 1 && (
          <button className="btn btn-sm btn-primary" onClick={() => onSubmit()}>
            Create Deal
          </button>
        )}
      </div>
    </div>
  );
}
