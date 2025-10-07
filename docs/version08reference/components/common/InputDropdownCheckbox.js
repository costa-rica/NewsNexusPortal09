// import { useState } from "react";
import { useState, useEffect, useRef } from "react";
import styles from "../../styles/InputDropdownCheckbox.module.css"; // optional

export default function InputDropdownCheckbox({
  inputObjectArray,
  setInputObjectArray,
  displayName,
  inputDefaultText = "Select...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const dropdownRef = useRef(null);
  const handleToggleSelect = (stateId) => {
    const updated = inputObjectArray.map((elem) =>
      elem.id === stateId ? { ...elem, selected: !elem.selected } : elem
    );
    setInputObjectArray(updated);
  };

  const selectedElements = inputObjectArray.filter((elem) => elem.selected);
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };
  const filteredItems = inputObjectArray.filter((elem) =>
    elem[displayName].toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.selectorContainer}>
      <div className={styles.selectorInput} onClick={() => setIsOpen(true)}>
        {selectedElements.length > 0
          ? selectedElements.map((elem) => elem.name).join(", ")
          : inputDefaultText}
      </div>

      {isOpen && (
        // <div className={styles.dropdown}>
        <div className={styles.dropdown} ref={dropdownRef}>
          <div className={styles.dropdownHeader}>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeBtn}
            >
              ×
            </button>
          </div>
          <input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            className={styles.searchInput}
            placeholder="Search..."
          />
          <div className={styles.dropdownList}>
            {filteredItems.map((elem) => (
              <div
                key={elem.id}
                className={styles.dropdownItem}
                onClick={() => handleToggleSelect(elem.id)}
              >
                <input type="checkbox" readOnly checked={elem.selected} />
                {elem[displayName]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
