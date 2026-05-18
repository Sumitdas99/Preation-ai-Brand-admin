import { ChevronDown } from "lucide-react";
import type { SectionAVM } from "../types";
import { TemplateStrip } from "../primitives/TemplateStrip";

interface Props {
  data: SectionAVM;
  disabled?: boolean;
  onTextChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onTemplateChange: (templateId: string) => void;
}

export function SectionA({
  data,
  disabled,
  onTextChange,
  onLanguageChange,
  onTemplateChange,
}: Props) {
  const counter = data.charCounterTemplate
    .replace("{count}", String(data.textareaValue.length))
    .replace("{max}", String(data.maxChars));

  return (
    <section>
      <div className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm [contain:layout_paint]">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-3.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1F44] text-sm font-semibold text-white">
            {data.badgeLetter}
          </span>
          <h3 className="text-xl font-semibold leading-none text-slate-600">
            {data.title}
          </h3>
          <span className="ml-auto text-sm font-medium text-slate-500">
            {data.headerMeta}
          </span>
        </header>

        <div className="px-6 pt-4">
          <TemplateStrip
            data={data.templateStrip}
            disabled={disabled}
            onSelectTemplate={onTemplateChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-6 pb-6 pt-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-2">
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                {data.textareaLabel}
              </span>
              <textarea
                rows={5}
                maxLength={data.maxChars}
                value={data.textareaValue}
                disabled={disabled}
                onChange={(e) => onTextChange(e.target.value)}
                className="mt-2 block w-full resize-none rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              />
            </label>
            <div className="flex justify-end text-xs font-medium text-slate-500">
              {counter}
            </div>
            <p className="text-xs font-medium leading-relaxed text-slate-500">
              {data.helperText}
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {data.languageLabel}
                </span>
                <div className="relative mt-2">
                  <select
                    value={data.languageValue}
                    disabled={disabled}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3.5 py-3 pr-9 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    {data.languageOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </label>
              {data.languageHelperText ? (
                <p className="text-xs leading-relaxed text-slate-500">
                  {data.languageHelperText}
                </p>
              ) : null}
            </div>

            {data.scope ? (
              <div className="space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {data.scope.label}
                </span>
                <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-3">
                  <span className="rounded bg-red-700/85 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                    {data.scope.value}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    {data.scope.sourceLabel}
                  </span>
                </div>
                {data.scope.helperText ? (
                  <p className="text-xs leading-relaxed text-slate-500">
                    {data.scope.helperText}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
