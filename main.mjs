import { CharacterGenerator } from './webchargen.mjs';

document.addEventListener('DOMContentLoaded', () => {
  const generatorApp = new CharacterGenerator();
  generatorApp.init();
});
