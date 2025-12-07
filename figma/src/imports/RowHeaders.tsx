export default function RowHeaders() {
  return (
    <div className="relative size-full" data-name="Row / Headers">
      <div className="flex flex-row justify-center size-full">
        <div className="box-border content-stretch flex font-['Manrope',sans-serif] font-light gap-[10px] items-start justify-center leading-[normal] not-italic p-[10px] relative size-full text-[16px] text-[rgba(255,255,255,0.7)]">
          <p className="absolute h-[19px] left-0 top-0 w-[141px]">Pool specifications</p>
          <p className="absolute h-[19px] left-[491px] top-0 w-[30px]">TVL</p>
          <p className="absolute h-[19px] left-[661px] top-0 w-[116px]">Unclaimed fees</p>
          <p className="absolute h-[19px] left-[925px] top-0 w-[77px]">Incentives</p>
          <p className="absolute h-[19px] left-[1193px] top-0 w-[31px]">APR</p>
        </div>
      </div>
    </div>
  );
}