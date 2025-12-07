import rangeBandIcon from 'figma:asset/fcbf39d540d0739f54dbb64772264ebc23c82f8d.png';

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
