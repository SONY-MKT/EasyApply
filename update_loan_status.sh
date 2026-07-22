sed -i 's/const isPast = idx < currentStepIndex;/const isPast = idx < currentStepIndex \&\& step.key !== '\''approved'\'';/' src/components/LoanStatus.tsx
