"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type IconComponentType = React.ElementType<{ className?: string }>;
export interface InteractiveMenuItem {
  label: string;
  href: string;
  icon: IconComponentType;
}

export interface InteractiveMenuProps {
  items: InteractiveMenuItem[];
  accentColor?: string;
  activeDeliveryCount?: number;
}

const defaultAccentColor = 'var(--component-active-color-default)';

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ 
  items, 
  accentColor,
  activeDeliveryCount = 0
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const newIndex = items.findIndex((item) => item.href === pathname);
    if (newIndex >= 0) {
      setActiveIndex(newIndex);
    }
  }, [pathname, items]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];

      if (activeItemElement && activeTextElement) {
        // use getBoundingClientRect or offsetWidth
        const textWidth = activeTextElement.offsetWidth || 30;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    const timer = setTimeout(setLineWidth, 50);

    window.addEventListener('resize', setLineWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', setLineWidth);
    };
  }, [activeIndex, items]);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    router.push(items[index].href);
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor;
    return { '--component-active-color': activeColor } as React.CSSProperties;
  }, [accentColor]); 

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--component-bg)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] border-t border-[var(--component-line-inactive-color)] pb-safe"
      role="navigation"
      style={navStyle}
    >
      <div className="flex justify-around items-end pt-2 pb-3 px-2">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const isTextActive = isActive;
          const IconComponent = item.icon;

          return (
            <button
              key={item.label}
              className={`relative flex flex-col items-center justify-center flex-1 transition-all duration-300 outline-none menu__item ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(index)}
              ref={(el) => { itemRefs.current[index] = el; }}
              style={{ '--lineWidth': '0px' } as React.CSSProperties} 
            >
              <div 
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-[var(--component-active-color)] transition-all duration-300 ease-out z-10`}
                  style={{ 
                      width: isActive ? 'var(--lineWidth)' : '0px',
                      opacity: isActive ? 1 : 0,
                      top: '-10px'
                  }}
              />
              
              <div className={`relative p-2 rounded-2xl mb-1 transition-colors duration-300 menu__icon ${isActive ? 'text-primary-foreground bg-[var(--component-active-color)]' : 'text-[var(--component-inactive-color)] hover:bg-[var(--component-active-bg)]/50 hover:text-foreground'}`}>
                <IconComponent className={`w-[22px] h-[22px] transition-transform duration-300 icon ${isActive ? 'animate-[iconBounce_0.5s_ease-in-out]' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                
                {item.href === "/basket-goals" && activeDeliveryCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[var(--component-bg)] flex items-center justify-center text-[8px] text-white font-black">
                      {activeDeliveryCount}
                    </span>
                  </span>
                )}
              </div>
              <strong
                className={`text-[11px] leading-tight font-medium transition-all duration-300 overflow-visible whitespace-nowrap menu__text ${isTextActive ? 'text-[var(--component-active-color)] opacity-100 translate-y-0 active' : 'text-[var(--component-inactive-color)] opacity-70 translate-y-[2px]'}`}
                ref={(el) => { textRefs.current[index] = el; }}
              >
                {item.label}
              </strong>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export { InteractiveMenu };
