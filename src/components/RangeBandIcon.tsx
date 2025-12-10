// Use public asset directly
const rangeBandIcon = '/media/brand/rangeband.svg';

interface RangeBandIconProps {
  className?: string;
  size?: number;
}

export function RangeBandIcon({ className = "", size = 24 }: RangeBandIconProps) {
  // RangeBand™ icon has correct aspect ratio built-in
  // Size parameter controls the height, width auto-scales
  return (
    <img 
      src={rangeBandIcon} 
      alt="RangeBand™" 
      className={className}
      style={{ height: size, width: 'auto' }}
    />
  );
}
