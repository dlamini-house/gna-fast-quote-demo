export default function Wordmark({ variant = 'dark', size = 'md' }) {
  const isLight = variant === 'light'
  const sizes = {
    sm: { gna: 'text-xl', sub: 'text-[9px]', curve: 46 },
    md: { gna: 'text-3xl', sub: 'text-xs', curve: 64 },
    lg: { gna: 'text-4xl', sub: 'text-sm', curve: 80 }
  }
  const s = sizes[size] || sizes.md

  return (
    <div className="flex flex-col items-center select-none">
      <span className={`${s.gna} font-extrabold text-brand-red tracking-tight leading-none`}>GNA</span>
      <span className={`${s.sub} font-bold tracking-[0.25em] mt-0.5 ${isLight ? 'text-white' : 'text-navy-900'}`}>
        FAST QUOTE
      </span>
      <svg width={s.curve} height={s.curve / 5} viewBox="0 0 64 13" className="mt-0.5">
        <path d="M2 2 Q32 15 62 2" stroke="#1F5FDB" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}
