import { type ComponentProps } from "react";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 mt-3 block text-[11px] font-medium text-ink-2 first:mt-0">
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export function FieldInput(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function FieldTextarea(props: ComponentProps<"textarea">) {
  return (
    <textarea {...props} className={`${inputClass} resize-none ${props.className ?? ""}`} />
  );
}

export function FieldSelect(props: ComponentProps<"select">) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function CheckboxRow({
  children,
  ...props
}: ComponentProps<"input"> & { children: React.ReactNode }) {
  return (
    <label className="mt-3.5 flex items-center gap-2 text-[12.5px] text-ink">
      <input
        type="checkbox"
        {...props}
        className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
      />
      {children}
    </label>
  );
}
