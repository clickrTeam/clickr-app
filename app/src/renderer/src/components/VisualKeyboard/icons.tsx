import React from 'react';
import { BindType } from '../../../../models/Bind';

interface ArrowBackgroundProps {
  bindType: BindType;
  children?: React.ReactNode;
  className?: string;
}

export const ConditionalArrowBackground: React.FC<ArrowBackgroundProps> = ({
  bindType,
  children,
  className = ''
}) => {
  if (bindType !== BindType.PressKey && bindType !== BindType.ReleaseKey) {
    return <>{children}</>;
  }

  const isUpArrow = bindType === BindType.ReleaseKey;

  return (
    <div
      className={`relative ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          zIndex: 1,
        }}
      >
        <defs>
          <linearGradient
            id="keyBindGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            {isUpArrow ? (
              <>
                <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
                <stop offset="50%" stopColor="transparent" />
                <stop offset="100%" stopColor="transparent" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
              </>
            )}
          </linearGradient>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#keyBindGradient)"
        />
      </svg>
      <div
        className="relative z-10"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
    </div>
  );
};
