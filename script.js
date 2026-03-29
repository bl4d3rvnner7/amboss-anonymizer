// ==UserScript==
// @name         AMBOSS Anonymizer
// @namespace    https://github.com/bl4d3rvnner7/amboss-anonymizer
// @version      1.2
// @icon         https://next.amboss.com/de/static/assets/5dd152c6ee89d94c.png
// @description  Censors name and avatar on AMBOSS with toggle panel
// @author       scarlettaowner
// @match        https://next.amboss.com/*
// @run-at       document-idle
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = "amboss-anonymizer-enabled";
    let enabled = localStorage.getItem(STORAGE_KEY) !== "false";

    function censorInteractiveBoxes() {
        if (!enabled) return;

        const buttons = document.querySelectorAll('button[data-ds-id="InteractiveBox"]');

        buttons.forEach(button => {

            const avatar = button.querySelector('[data-ds-id="Avatar"]');
            if (!avatar) return;

            if (button.dataset.anonymized === "true") return;
            button.dataset.anonymized = "true";

            const avatarText = avatar.querySelector('span');
            if (avatarText) {
                avatarText.dataset.original = avatarText.textContent;
                avatarText.textContent = "•";
            }

            avatar.dataset.originalLabel = avatar.getAttribute("aria-label");
            avatar.setAttribute("aria-label", "Anonymous");

            const nameSpan = button.querySelector(
                'p[data-ds-id="TextClamped"] span'
            );

            if (nameSpan) {
                nameSpan.dataset.original = nameSpan.textContent;
                nameSpan.textContent = "██████";
            }
        });
    }

    function restoreInteractiveBoxes() {
        const buttons = document.querySelectorAll('button[data-ds-id="InteractiveBox"]');

        buttons.forEach(button => {

            const avatar = button.querySelector('[data-ds-id="Avatar"]');
            if (!avatar) return;

            button.dataset.anonymized = "false";

            const avatarText = avatar.querySelector('span');
            if (avatarText && avatarText.dataset.original) {
                avatarText.textContent = avatarText.dataset.original;
            }

            if (avatar.dataset.originalLabel) {
                avatar.setAttribute("aria-label", avatar.dataset.originalLabel);
            }

            const nameSpan = button.querySelector(
                'p[data-ds-id="TextClamped"] span'
            );

            if (nameSpan && nameSpan.dataset.original) {
                nameSpan.textContent = nameSpan.dataset.original;
            }
        });
    }

    function updateState(newState) {
        enabled = newState;
        localStorage.setItem(STORAGE_KEY, enabled);
        toggleButton.style.background = enabled ? "#22c55e" : "#ef4444";
        toggleButton.textContent = enabled ? "ON" : "OFF";

        if (enabled) {
            censorInteractiveBoxes();
        } else {
            restoreInteractiveBoxes();
        }
    }

    function createControlPanel() {
        const panel = document.createElement("div");
        panel.style.position = "fixed";
        panel.style.right = "20px";
        panel.style.bottom = "30px";
        panel.style.transform = "none";
        panel.style.background = "#1f2937";
        panel.style.padding = "12px 16px";
        panel.style.borderRadius = "10px";
        panel.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
        panel.style.zIndex = "99999";
        panel.style.color = "white";
        panel.style.fontFamily = "Lato, -apple-system, BlinkMacSystemFont, sans-serif";
        panel.style.fontSize = "14px";
        panel.style.display = "flex";
        panel.style.alignItems = "center";
        panel.style.gap = "10px";

        const label = document.createElement("span");
        const isGerman = navigator.language.startsWith("de");
        label.textContent = isGerman ? "Anonymisieren" : "Anonymize";

        toggleButton = document.createElement("button");
        toggleButton.style.border = "none";
        toggleButton.style.padding = "6px 12px";
        toggleButton.style.borderRadius = "6px";
        toggleButton.style.cursor = "pointer";
        toggleButton.style.fontWeight = "bold";
        toggleButton.style.color = "white";

        toggleButton.onclick = () => {
            updateState(!enabled);
        };

        panel.appendChild(label);
        panel.appendChild(toggleButton);
        document.body.appendChild(panel);

        updateState(enabled);
    }

    let toggleButton;

    function init() {
        createControlPanel();

        setTimeout(() => {
            if (enabled) censorInteractiveBoxes();
        }, 400);

        const observer = new MutationObserver(() => {
            if (enabled) censorInteractiveBoxes();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
