const BAR_COUNT = 64

function buildBarHeights(seed: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const wave = Math.sin((i + seed) * 0.45) * 28
    const wave2 = Math.cos((i + seed) * 0.28) * 18
    return Math.max(15, Math.min(95, 52 + wave + wave2))
  })
}

const BULL_BARS = buildBarHeights(0)
const BEAR_BARS = buildBarHeights(9)

function ChartLine({
  className,
  d,
  strokeWidth = 2.5,
}: {
  className: string
  d: string
  strokeWidth?: number
}) {
  return (
    <path
      d={d}
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className={className}
    />
  )
}

function CandleRow({
  bars,
  className,
}: {
  bars: number[]
  className: string
}) {
  return (
    <div className={`flex h-full items-end gap-1 px-1 ${className}`}>
      {bars.map((height, i) => (
        <div
          key={i}
          className="chart-bar w-2 shrink-0 rounded-sm sm:w-2.5"
          style={{
            height: `${height}%`,
            animationDelay: `${(i % 10) * 0.22}s`,
          }}
        />
      ))}
    </div>
  )
}

function ScrollingChart({
  scrollClass,
  bobClass,
  lineClass,
  top,
  height,
  d,
  strokeWidth,
}: {
  scrollClass: string
  bobClass: string
  lineClass: string
  top: string
  height: string
  d: string
  strokeWidth?: number
}) {
  return (
    <div
      className={`absolute w-[220%] ${scrollClass}`}
      style={{ top, height }}
    >
      <div className={`h-full w-full ${bobClass}`}>
        <svg
          viewBox="0 0 1600 400"
          preserveAspectRatio="none"
          className={`h-full w-full ${lineClass}`}
        >
          <ChartLine className="stroke-current" d={d} strokeWidth={strokeWidth} />
        </svg>
      </div>
    </div>
  )
}

export function AnimatedChartBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#f4f7fb] dark:bg-[#0c1018]" />

      <div className="chart-grid absolute inset-0" />

      <div className="absolute inset-0">
        <ScrollingChart
          scrollClass="chart-scroll-slow"
          bobClass="chart-bob-slow"
          lineClass="text-emerald-600 opacity-50 dark:text-emerald-400 dark:opacity-40"
          top="22%"
          height="45%"
          strokeWidth={3}
          d="M0,280 C140,240 220,120 360,160 S560,320 720,200 S920,80 1080,140 S1280,260 1440,180 L1600,200"
        />
        <ScrollingChart
          scrollClass="chart-scroll-medium"
          bobClass="chart-bob-medium"
          lineClass="text-slate-500 opacity-35 dark:text-slate-400 dark:opacity-30"
          top="38%"
          height="40%"
          d="M0,300 C180,260 280,180 440,220 S640,360 820,240 S1020,120 1180,180 S1360,300 1600,220"
        />
        <ScrollingChart
          scrollClass="chart-scroll-fast"
          bobClass="chart-bob-fast"
          lineClass="text-rose-500 opacity-40 dark:text-rose-400 dark:opacity-35"
          top="52%"
          height="38%"
          d="M0,220 C160,260 300,140 480,190 S680,320 860,200 S1060,100 1240,160 S1420,280 1600,190"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[50%] min-h-[220px] overflow-hidden">
        <div className="chart-scroll-medium absolute inset-0 w-[220%]">
          <CandleRow bars={BULL_BARS} className="chart-bull h-full w-1/2" />
          <CandleRow
            bars={BEAR_BARS}
            className="chart-bear absolute inset-y-0 left-1/2 h-full w-1/2"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-[#f4f7fb] via-[#f4f7fb]/75 to-transparent dark:from-[#0c1018] dark:via-[#0c1018]/75" />
    </div>
  )
}
