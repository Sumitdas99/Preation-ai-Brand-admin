interface Props {
  text?: string;
}

export function AuditFooter({ text }: Props) {
  if (!text) return null;
  return (
    <div className="px-4 pb-4 pt-0 text-[10.5px] leading-snug text-muted-foreground">
      {text}
    </div>
  );
}
