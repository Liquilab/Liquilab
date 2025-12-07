import liquidropIcon from 'figma:asset/818dfd5fb73bb9a8aa51f5e0f7c516dfb6a1a2f3.png';

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  fontFamily?: string;
}

export function Logo({ size = "md", showText = true, className = "", fontFamily }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-10 h-10"
  };
  
  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <img 
          src={liquidropIcon} 
          alt="Liquilab" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {showText && (
        <span 
          className={`${textSizeClasses[size]} text-white/95 font-semibold`} 
          style={{ fontFamily: fontFamily || 'var(--font-heading-test, var(--font-heading))' }}
        >
          Liquilab
        </span>
      )}
    </div>
  );
}
