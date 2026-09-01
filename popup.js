const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const LEGACY_SETTINGS_KEY = "passwordGeneratorSettings";

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
  const selected = lengthInputs.find((input) => input.checked);
  return selected ? Number(selected.value) : null;
}

function selectedSymbols() {
  return symbolInputs
    .filter((input) => input.checked)
    .map((input) => input.value)
    .join("");
}

function clearSavedOptions() {
  localStorage.removeItem(LEGACY_SETTINGS_KEY);
}

function generatePassword() {
  const length = selectedLength();
  const symbols = selectedSymbols();
  const required = [];
  let pool = LETTERS;
  let firstChar = "";

  if (!length) {
    passwordInput.value = "";
    message.textContent = "";
    return;
  }

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
}

async function copyPassword() {
  if (!passwordInput.value) generatePassword();
  if (!passwordInput.value) return;

  await navigator.clipboard.writeText(passwordInput.value);
  message.textContent = "Copied.";
}

document.getElementById("generate").addEventListener("click", generatePassword);
document.getElementById("copy").addEventListener("click", copyPassword);

[...lengthInputs, ...symbolInputs, startWithLetterInput, useNumbersInput].forEach((input) => {
  input.addEventListener("change", generatePassword);
});

clearSavedOptions();
generatePassword();
