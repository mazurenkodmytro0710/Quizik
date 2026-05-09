import { cn } from "@/lib/utils";

interface AnswerOptionProps {
  label: string;
  text: string;
  selected: boolean;
  disabled: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  onClick: () => void;
}

export function AnswerOption({
  label,
  text,
  selected,
  disabled,
  isCorrect,
  isWrong,
  onClick,
}: AnswerOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left rounded-2xl px-4 py-3 border-2 transition-all duration-150 flex items-start gap-3 min-h-[52px]",
        "text-sm font-medium leading-snug",
        !disabled && !selected && "border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-400 text-white",
        selected && !isCorrect && !isWrong && "border-violet-500 bg-violet-500/20 text-white",
        isCorrect && "border-emerald-500 bg-emerald-500/20 text-emerald-300",
        isWrong && "border-red-500 bg-red-500/20 text-red-300",
        !selected && isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-400",
        disabled && !selected && !isCorrect && !isWrong && "border-white/5 bg-white/3 text-white/30 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold uppercase mt-0.5",
        !selected && !isCorrect && !isWrong && "border-white/20 text-white/50",
        selected && !isCorrect && !isWrong && "border-violet-400 bg-violet-500 text-white",
        isCorrect && "border-emerald-400 bg-emerald-500 text-white",
        isWrong && "border-red-400 bg-red-500 text-white",
      )}>
        {label}
      </span>
      <span className="flex-1">{text}</span>
    </button>
  );
}
