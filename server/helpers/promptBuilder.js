function buildSystemPrompt({ templateHtml, preferencesText, patient, language }) {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let systemPrompt = `You are a clinical-note generator.\n`;
  systemPrompt += `Output **only** HTML. Use:\n`;
  systemPrompt += `• <h2> for section titles\n`;
  systemPrompt += `• <ul> around each set of fields\n`;
  systemPrompt += `• <li> for each field line, filling the value after the colon\n`;
  systemPrompt += `Do not emit any Markdown or code fences—only HTML tags.\n\n`;

  if (language.startsWith('ar')) {
    systemPrompt += `🔠 Generate all output in **Arabic**.\nUse Arabic medical terms and section headings.\nReturn your entire reply in Arabic.\n\n`;
  } else {
    systemPrompt += `🔠 Generate all output in **English**.\n\n`;
  }

  systemPrompt += templateHtml + `\n\n`;

  systemPrompt += `Special Instructions:\n`;
  systemPrompt += `1. If a field isn’t mentioned in the transcript, leave its <li> blank after the colon.\n`;
  systemPrompt += `2. If Date/Time are missing, use ${date} and ${time}.\n`;
  systemPrompt += `3. If Name are missing, use ${patient}.\n\n`;

  systemPrompt += `General Guidelines:\n${preferencesText}\n\n`;

  return systemPrompt;
}

// Export the function
module.exports = { buildSystemPrompt };
