const configurations = {
  darkMode: 'dark-mode',
  cursorTrails: 'cursor-trails',
  vines: 'vines',
};

const checkboxValues = {
  [configurations.darkMode]: false,
  [configurations.cursorTrails]: false,
  [configurations.vines]: false,
};

let trailsScriptsInjected = false;

function disableOption(option) {
  document.documentElement.classList.add('rainbows');
  document.documentElement.classList.remove(option);

  if (option === configurations.darkMode) {
    document.documentElement.style.colorScheme = 'light';
  }

  window.localStorage.setItem(option, 'false');

  if (option === configurations.cursorTrails) {
    window.setCursorTrailsEnabled?.(false);
  }

  if (option === configurations.vines) {
    const canvas = document.querySelector('#vineCanvas');
    canvas?.classList.add('hide');
    window.setVineAnimation?.(false);
  }
}

function enableOption(option) {
  document.documentElement.classList.add('rainbows');
  document.documentElement.classList.add(option);

  if (option === configurations.darkMode) {
    document.documentElement.style.colorScheme = 'dark';
  }

  window.localStorage.setItem(option, 'true');

  if (option === configurations.cursorTrails) {
    window.setCursorTrailsEnabled?.(true);
  }

  if (option === configurations.cursorTrails && !trailsScriptsInjected) {
    const isSmallScreen = document.documentElement.clientWidth < 640;
    const isTouchDevice =
      window.matchMedia('(pointer: coarse)').matches ||
      navigator.maxTouchPoints > 0;

    if (!isSmallScreen && !isTouchDevice) {
      const pixiScript = document.createElement('script');
      pixiScript.onload = function () {
        const trailsScript = document.createElement('script');
        trailsScript.src = '/assets/scripts/cursorTrails.js';
        document.head.appendChild(trailsScript);
        trailsScriptsInjected = true;
      };
      pixiScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.1/pixi.min.js';
      document.head.appendChild(pixiScript);
    }
  }

  if (option === configurations.vines) {
    window.setVineAnimation?.(true);
    const canvas = document.querySelector('#vineCanvas');
    canvas?.classList.add('show');
  }
}

for (const option of Object.values(configurations)) {
  const localStorageValue = window.localStorage.getItem(option);

  if (localStorageValue === 'true') {
    enableOption(option);
    checkboxValues[option] = true;
  } else if (localStorageValue === 'false') {
    disableOption(option);
    checkboxValues[option] = false;
  } else {
    switch (option) {
      case configurations.darkMode:
        if (
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
          enableOption(option);
          checkboxValues[option] = true;
        } else {
          disableOption(option);
        }
        break;
      case configurations.cursorTrails:
        if (
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: no-preference)').matches
        ) {
          enableOption(option);
          checkboxValues[option] = true;
        } else {
          disableOption(option);
        }
        break;
      case configurations.vines:
        disableOption(option);
        break;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  for (const option of Object.values(configurations)) {
    const checkbox = document.getElementById(option);

    if (option === configurations.vines) {
      if (checkboxValues[option]) {
        window.setVineAnimation?.(true);
      } else {
        window.setVineAnimation?.(false);
      }
    }

    if (checkbox) {
      checkbox.addEventListener('click', () => {
        if (checkbox.checked) {
          enableOption(option);
        } else {
          disableOption(option);
        }
      });

      checkbox.checked = Boolean(checkboxValues[option]);
    }
  }
});
