function isEditorChanged(editor) {
  return editor.textarea.value !== editor.savedCss;
}

function refreshSaveButton(editor) {
  if (!editor.saveButton) return;
  editor.saveButton.textContent = textsForLocale().save;
  editor.saveButton.disabled = !isEditorChanged(editor);
}

function previewEditor(editor) {
  setStyles(withSiteCss(editor.savedStyles, editor.host, editor.textarea.value));
  refreshSaveButton(editor);
}

function restoreSaved(editor) {
  setStyles(editor.savedStyles);
}

function dismissEditor(editor) {
  restoreSaved(editor);
  closePanel();
}

function markSaved(editor) {
  editor.saveButton.textContent = textsForLocale().saved;
  editor.saveButton.disabled = true;
}

function commitSave(editor, styles, text) {
  editor.savedStyles = styles;
  editor.savedCss = text;
  editor.view.messages.replaceChildren();
  previewEditor(editor);
  if (editor.textarea.value === text) markSaved(editor);
}

async function saveEditor(editor) {
  const text = editor.textarea.value;
  const styles = withSiteCss(editor.savedStyles, editor.host, text);
  const error = await saveStyles(styles);
  if (error !== null) return setMessage(editor.view, error, "negative");
  commitSave(editor, styles, text);
}

function showEditorFooter(editor) {
  const close = createButton(textsForLocale().close, requestClose, false);
  if (kondor.isPrivate) return setFooter(editor.view, [close]);
  editor.saveButton = createButton(textsForLocale().save, () => saveEditor(editor), true);
  setFooter(editor.view, [editor.saveButton, close]);
  refreshSaveButton(editor);
}

function resumeEditing(editor) {
  showEditorFooter(editor);
  editor.textarea.focus();
}

function createQuestion(text) {
  const question = createNode("span", "start", text);
  question.setAttribute("role", "alert");
  return question;
}

function discardAndProceed(editor, proceed) {
  restoreSaved(editor);
  proceed();
}

function askDiscard(editor, proceed) {
  const texts = textsForLocale();
  const discard = createButton(texts.discard, () => discardAndProceed(editor, proceed), false);
  const keep = createButton(texts.keepEditing, () => resumeEditing(editor), true);
  setFooter(editor.view, [createQuestion(texts.discardQuestion), discard, keep]);
  keep.focus();
}

function createEditorField(editor) {
  const textarea = createNode("textarea", "field editor", "");
  textarea.value = editor.savedCss;
  setAttributes(textarea, { spellcheck: "false", "aria-label": textsForLocale().cssField });
  textarea.addEventListener("input", () => previewEditor(editor));
  return textarea;
}

function wireEditorView(editor) {
  editor.view.isDirty = () => !kondor.isPrivate && isEditorChanged(editor);
  editor.view.askDiscard = (proceed) => askDiscard(editor, proceed);
  editor.view.dismiss = () => dismissEditor(editor);
}

function showEditor() {
  const host = location.hostname;
  const title = fillText(textsForLocale().editorTitle, [host]);
  const editor = { host, savedStyles: state.styles, savedCss: findSiteCss(state.styles, host), view: openPanel(title) };
  editor.textarea = createEditorField(editor);
  editor.view.body.append(editor.textarea);
  wireEditorView(editor);
  if (kondor.isPrivate) setMessage(editor.view, textsForLocale().privateEditor, "neutral");
  showEditorFooter(editor);
  editor.textarea.focus();
}

function openEditor() {
  switchView(showEditor);
}
