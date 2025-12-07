function RangebandInRange({ className }: { className?: string }) {
  return (
    <div className={className} data-name="Rangeband / In Range">
      <div className="absolute inset-[16.04%_14.51%_83.96%_17.41%]">
        <div className="absolute bottom-0 left-0 right-0 top-[-3px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 352 3">
            <line id="Line 2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeOpacity="0.7" strokeWidth="3" x1="1.5" x2="350.5" y1="1.5" y2="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[73.58%] left-[36.36%] right-[58.22%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
          <g id="Group 3">
            <circle cx="14" cy="14" fill="var(--fill-0, #10B981)" id="Ellipse 6" opacity="0.3" r="14" />
            <circle cx="14" cy="14" fill="var(--fill-0, #10B981)" id="Ellipse 5" r="11" />
          </g>
        </svg>
      </div>
      <div className="absolute bottom-0 contents font-['Manrope',sans-serif] font-semibold leading-[normal] left-[41.59%] not-italic right-[38.68%] text-nowrap top-[54.72%] whitespace-pre">
        <p className="absolute inset-[54.72%_39.85%_17.92%_41.97%] text-[24px] text-[rgba(255,255,255,0.95)]">1.27500</p>
        <p className="absolute bottom-0 left-[41.59%] right-[38.68%] text-[16px] text-[rgba(255,255,255,0.5)] top-[82.08%]">USDT0/FXRP</p>
      </div>
      <div className="absolute bottom-[13.21%] contents font-['Manrope',sans-serif] font-medium leading-[normal] left-0 not-italic right-[79.88%] text-[16px] text-nowrap top-[68.87%] tracking-[0.8px] whitespace-pre">
        <p className="absolute bottom-[13.21%] left-0 right-[92.26%] text-[rgba(255,255,255,0.7)] top-[68.87%]">Aggr</p>
        <p className="absolute inset-[68.87%_79.88%_13.21%_9.67%] text-[rgba(255,255,255,0.5)]">(5.0%)</p>
      </div>
      <div className="absolute bottom-[8.49%] font-['Manrope',sans-serif] font-medium leading-[normal] left-[84.53%] not-italic right-0 text-[0px] text-[12px] text-[rgba(255,255,255,0.7)] text-nowrap text-right top-[63.21%] tracking-[0.6px] whitespace-pre">
        <p className="mb-0">Powered by</p>
        <p className="text-[rgba(255,255,255,0.95)]">RANGEBAND</p>
      </div>
      <p className="absolute bottom-[76.42%] font-['Manrope',sans-serif] font-medium leading-[normal] left-0 not-italic right-[86.07%] text-[14px] text-[rgba(255,255,255,0.5)] text-nowrap top-[7.55%] tracking-[0.7px] whitespace-pre">0.980000</p>
      <p className="absolute bottom-[76.42%] font-['Manrope',sans-serif] font-medium leading-[normal] left-[88.39%] not-italic right-0 text-[14px] text-[rgba(255,255,255,0.5)] text-nowrap top-[7.55%] tracking-[0.7px] whitespace-pre">1.93000</p>
    </div>
  );
}

export default function RowRangeband() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative size-full" data-name="Row / Rangeband">
      <RangebandInRange className="h-[106px] relative shrink-0 w-[517px]" />
      <div className="absolute h-0 left-0 top-[260px] w-[1301px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1301 1">
            <line id="Line 3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="0.5" x1="0.25" x2="1300.75" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
    </div>
  );
}