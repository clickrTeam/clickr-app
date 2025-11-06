import { useEffect } from 'react';
import { useDropdown } from './DropdownContext';

type DropdownProps = {
  options: any[];
  currentSelected: any;
  handleSelection: (opt: any) => void;

  getDropdownBg?: (current: any, opt: any) => string;
  getDisplayName?: (opt: any) => string;
  openBtnLabel?: string;
  allSelected?: any[];
  openBtnBackground?: string;

  id: string;
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
  id,
}: DropdownProps) {
  const { isOpen, openDropdown, closeDropdown } = useDropdown();
  const dropdownIsOpen = isOpen(id);

  const handleClick = () => {
    if (dropdownIsOpen) {
      closeDropdown();
    } else {
      openDropdown(id);
    }
  };

  useEffect(() => {
    return () => {
      closeDropdown(); // cleanup (componentWillUnmount)
    };
  }, []);

  return (
    <div className="vk-footer-trigger-wrapper">
      <button
        className="vk-footer-macro-btn relative z-10"
        style={{ background: openBtnBackground }}
        onClick={handleClick}
      >
        {openBtnLabel}
      </button>

      {dropdownIsOpen && (
        <div className="vk-footer-macro-dropdown">
          {options.map((opt) => {
            const anyAlreadySelected = allSelected?.some((selected) => selected === opt) ?? false;
            const disabled = anyAlreadySelected && opt !== currentSelected;
            const selected = currentSelected === opt;
            const bg = getDropdownBg?.(currentSelected, opt) ?? '';

            return (
              <button
                key={opt}
                className={`vk-footer-macro-dropdown-btn${selected ? ' selected' : ''}`}
                style={{ background: bg }}
                onClick={() => {
                  closeDropdown();
                  handleSelection(opt);
                }}
                disabled={disabled}
              >
                {getDisplayName?.(opt) ?? opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
