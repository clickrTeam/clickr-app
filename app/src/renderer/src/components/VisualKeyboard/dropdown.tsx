import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDropdown } from './DropdownContext';

type DropdownProps = {
  options: any[];
  currentSelected: any;
  handleSelection: (opt: any) => void;
  extraClass?: string;

  getDropdownBg?: (current: any, opt: any) => string;
  getDisplayName?: (opt: any) => string;
  openBtnLabel?: string;
  allSelected?: any[];
  openBtnBackground?: string;

  id: string;
};

type Position = {
  bottom: number;
  left: number;
};

const DropdownMenu = ({
  isOpen,
  position,
  options,
  currentSelected,
  allSelected,
  getDropdownBg,
  getDisplayName,
  onSelect,
  onClose
}: {
  isOpen: boolean;
  position: Position;
  options: any[];
  currentSelected: any;
  allSelected?: any[];
  getDropdownBg?: (current: any, opt: any) => string;
  getDisplayName?: (opt: any) => string;
  onSelect: (opt: any) => void;
  onClose: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Add event listener with a slight delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed vk-footer-macro-dropdown"
      style={{
        bottom: position.bottom + 'px',
        left: position.left + 'px',
        width: '175px',
        maxHeight: '300px',
      }}
    >
      {options.map((opt) => {
        const anyAlreadySelected = allSelected?.some((selected) => selected === opt) ?? false;
        const disabled = anyAlreadySelected && opt !== currentSelected;
        const selected = currentSelected === opt;
        const bg = getDropdownBg?.(currentSelected, opt) ?? '';

        return (
          <button
            key={opt}
            className={`vk-footer-macro-dropdown-btn${selected ? ' selected ' : ' '}`}
            style={{ background: bg || undefined }}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) {
                onSelect(opt);
              }
            }}
            disabled={disabled}
          >
            {(getDisplayName?.(opt) ?? opt)}
          </button>
        );
      })}
    </div>,
    document.body
  );
};

export default function Dropdown({
  options,
  currentSelected,
  allSelected,
  handleSelection,
  getDropdownBg,
  getDisplayName,
  openBtnLabel = 'Add',
  openBtnBackground,
  extraClass,
  id,
}: DropdownProps) {
  const { isOpen, openDropdown, closeDropdown } = useDropdown();
  const dropdownIsOpen = isOpen(id);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<Position>({ bottom: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      setPosition({
        bottom: windowHeight - rect.top + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dropdownIsOpen) {
      closeDropdown();
    } else {
      updatePosition();
      openDropdown(id);
    }
  };

  useEffect(() => {
    if (dropdownIsOpen) {
      updatePosition();
      const handleScroll = () => {
        updatePosition();
      };
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [dropdownIsOpen, updatePosition]);

  useEffect(() => {
    return () => {
      closeDropdown();
    };
  }, []);

  const handleSelect = useCallback((opt: any) => {
    handleSelection(opt);
    closeDropdown();
  }, [handleSelection, closeDropdown]);

  return (
    <div className="vk-footer-trigger-wrapper">
      <button
        className={`vk-footer-macro-btn relative z-10 ${extraClass ?? ''}`}
        ref={buttonRef}
        style={{ background: openBtnBackground }}
        onClick={handleClick}
      >
        {openBtnLabel}
      </button>
      <DropdownMenu
        key={allSelected?.length}
        isOpen={dropdownIsOpen}
        position={position}
        options={options}
        currentSelected={currentSelected}
        allSelected={allSelected}
        getDropdownBg={getDropdownBg}
        getDisplayName={getDisplayName}
        onSelect={handleSelect}
        onClose={closeDropdown}
      />
    </div>
  );
}
