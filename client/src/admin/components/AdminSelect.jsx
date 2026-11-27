import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function AdminSelect({
  value,
  onChange,
  options,
  className = "form-select glass-input",
  ariaLabel,
  disabled = false,
  required = false,
}) {
  const id = useId();
  const root = useRef(null);
  const menu = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const selectedIndex = options.findIndex((option) => String(option.value) === String(value ?? ""));
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;
    const updatePosition = () => {
      const rect = root.current?.getBoundingClientRect();
      if (!rect) return;
      const maxHeight = Math.min(280, window.innerHeight * 0.45);
      const below = window.innerHeight - rect.bottom - 8;
      const above = rect.top - 8;
      const expectedHeight = Math.min(options.length * 38 + 8, maxHeight);
      const opensAbove = below < expectedHeight && above > below;
      const available = opensAbove ? above : below;
      setPosition({
        left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
        width: rect.width,
        top: opensAbove ? undefined : rect.bottom + 6,
        bottom: opensAbove ? window.innerHeight - rect.top + 6 : undefined,
        maxHeight: Math.max(80, Math.min(maxHeight, available)),
      });
    };
    const closeOutside = (event) => {
      if (!root.current?.contains(event.target) && !menu.current?.contains(event.target)) setOpen(false);
    };
    updatePosition();
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    menu.current?.querySelector(`[data-option-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const openMenu = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const choose = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    const lastIndex = options.length - 1;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (open) setActiveIndex((index) => Math.min(lastIndex, index + 1));
      else openMenu();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (open) setActiveIndex((index) => Math.max(0, index - 1));
      else openMenu();
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(lastIndex);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && options[activeIndex]) choose(options[activeIndex]);
      else openMenu();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={`admin-select${open ? " is-open" : ""}`} ref={root}>
      <button
        type="button"
        className={`admin-select-trigger ${className}`}
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={open && options[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => open ? setOpen(false) : openMenu()}
        onKeyDown={handleKeyDown}
      >
        <span>{selected?.label ?? ""}</span>
        <i className="bi bi-chevron-down" aria-hidden="true" />
      </button>
      {open && position && createPortal(
        <div
          className="admin-select-menu"
          id={`${id}-listbox`}
          role="listbox"
          aria-label={ariaLabel}
          ref={menu}
          style={{ ...position, position: "fixed" }}
        >
          {options.map((option, index) => (
            <div
              id={`${id}-option-${index}`}
              className={`admin-select-option${index === activeIndex ? " active" : ""}${index === selectedIndex ? " selected" : ""}`}
              key={String(option.value)}
              role="option"
              aria-selected={index === selectedIndex}
              data-option-index={index}
              onPointerMove={() => setActiveIndex(index)}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {index === selectedIndex && <i className="bi bi-check2" aria-hidden="true" />}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
