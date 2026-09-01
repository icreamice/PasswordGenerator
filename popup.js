const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SETTINGS_KEY = "passwordGeneratorSettings";

const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const startWithLetterInput = document.getElementById("startWithLetter");
const useNumbersInput = document.getElementById("useNumbers");
const lengthInputs = [...document.querySelectorAll('input[name="length"]')];
const symbolInputs = [...document.querySelectorAll('input[name="symbol"]')];

function randomIndex(max) {
  const values = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;

  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % max;
}

function pick(chars) {
  return chars[randomIndex(chars.length)];
}

function shuffle(chars) {
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }

  return chars;
}

function selectedLength() {
  return Number(lengthInputs.find((input) => input.checked)?.value ?? 8);
}

function selectedSymbols() {
  return symbolInputs
    .filter((input) => input.checked)
    .map((input) => input.value)
    .join("");
}

function settings() {
  return {
    length: selectedLength(),
    startWithLetter: startWithLetterInput.checked,
    useNumbers: useNumbersInput.checked,
    symbols: selectedSymbols()
  };
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings()));
}

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
  if (!saved) return;

  const lengthInput = lengthInputs.find((input) => input.value === String(saved.length));
  if (lengthInput) lengthInput.checked = true;

  if (typeof saved.startWithLetter === "boolean") {
    startWithLetterInput.checked = saved.startWithLetter;
  }

  if (typeof saved.useNumbers === "boolean") {
    useNumbersInput.checked = saved.useNumbers;
  }

  if (typeof saved.symbols === "string") {
    symbolInputs.forEach((input) => {
      input.checked = saved.symbols.includes(input.value);
    });
  }
}

function generatePassword() {
  const length = selectedLength();
  const symbols = selectedSymbols();
  const required = [];
  let pool = LETTERS;
  let firstChar = "";

  if (startWithLetterInput.checked) {
    firstChar = pick(LETTERS);
  }

  if (useNumbersInput.checked) {
    pool += NUMBERS;
    required.push(pick(NUMBERS));
  }

  if (symbols) {
    pool += symbols;
    required.push(pick(symbols));
  }

  const chars = [...required];
  while (chars.length < length - firstChar.length) {
    chars.push(pick(pool));
  }

  passwordInput.value = firstChar + shuffle(chars).join("");
  message.textContent = "";
  saveSettings();
}

async function copyPassword() {
  if (!passwordInput.value) generatePassword();

  await navigator.clipboard.writeText(passwordInput.value);
  message.textContent = "Copied.";
}

document.getElementById("generate").addEventListener("click", generatePassword);
document.getElementById("copy").addEventListener("click", copyPassword);

[...lengthInputs, ...symbolInputs, startWithLetterInput, useNumbersInput].forEach((input) => {
  input.addEventListener("change", generatePassword);
});

loadSettings();
generatePassword();
