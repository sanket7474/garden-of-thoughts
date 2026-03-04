const configurations = {
  darkMode: 'dark-mode',
  rainbows: 'rainbows',
  cursorTrails: 'cursor-trails',
};
const checkboxValues = {
  [configurations.darkMode]: false,
  [configurations.rainbows]: false,
  [configurations.cursorTrails]: false,
};

let trailsScriptsInjected = false;

function disableOption(option) {
  document.documentElement.classList.remove(option);
  if (option === configurations.darkMode)
    document.documentElement.style.colorScheme = 'light';
  window.localStorage.setItem(option, 'false');
}
function enableOption(option) {
  document.documentElement.classList.add(option);
  if (option === configurations.darkMode)
    document.documentElement.style.colorScheme = 'dark';
  window.localStorage.setItem(option, 'true');
  if (option === configurations.cursorTrails && !trailsScriptsInjected) {
    // No trails on small screens
    if (document.documentElement.clientWidth < 640) return;
    var pixiScript = document.createElement('script');
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

for (const option of Object.values(configurations)) {
  const localStorageValue = window.localStorage.getItem(option);
  if (localStorageValue === 'true') {
    enableOption(option);
    checkboxValues[option] = true;
  } else if (localStorageValue === 'false') {
    disableOption(option);
    checkboxValues[option] = false;
  } else {
    // defaults
    switch (option) {
      case configurations.darkMode:
        if (
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
          enableOption(option);
        } else {
          disableOption(option);
        }
        break;
      case configurations.rainbows:
        enableOption(option);
        checkboxValues[option] = true;
        break;
      case configurations.cursorTrails:
        // respect reduced motion
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
    }
  }
}

addEventListener('DOMContentLoaded', (event) => {

    console.log('Configurations loaded');
  for (const option of Object.values(configurations)) {
    const checkbox = document.getElementById(option) as HTMLInputElement;
    if (checkbox) {
      checkbox.addEventListener('click', () => {
        if (checkbox.checked) {
          enableOption(option);
        } else {
          disableOption(option);
        }
      });
    }

    // Make sure the UI reflects the current state.
    if (checkboxValues[option]) {
      checkbox.checked = true;
    }
  }
});
