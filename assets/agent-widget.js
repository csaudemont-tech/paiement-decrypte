/**
 * Paiement Décrypté — widget d'assistant conversationnel (façade)
 * -----------------------------------------------------------------
 * Fichier unique, autonome, sans dépendance — cohérent avec la doctrine
 * du site ("un outil/composant = un fichier"). S'intègre en une ligne :
 *
 *   <script src="assets/agent-widget.js" data-api-url="https://paiement-decrypte-agent.TON-SOUS-DOMAINE.workers.dev/api/chat"></script>
 *
 * à ajouter juste avant </body> de la page où le widget doit apparaître
 * (typiquement outils/emv-parser.html). Le script s'auto-monte : rien
 * d'autre à faire côté HTML.
 *
 * Reprend les tokens visuels du site (couleurs, polices) — aucune
 * dépendance à un projet tiers.
 */
(function () {
  'use strict';

  const scriptTag = document.currentScript;
  const API_URL = scriptTag && scriptTag.getAttribute('data-api-url');
  if (!API_URL) {
    console.warn('[agent-widget] data-api-url manquant sur la balise <script> — widget non initialisé.');
    return;
  }

  const STORAGE_KEY = 'pd_agent_conversation_v1';
  const MAX_HISTORY = 14;

  // --- Styles ------------------------------------------------------------
  const css = `
  .pd-agent-fab{
    position:fixed;right:18px;bottom:18px;z-index:9999;
    width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;
    background:#1F4FD8;color:#fff;box-shadow:0 6px 20px rgba(14,27,44,.25);
    display:flex;align-items:center;justify-content:center;
    font-family:'Instrument Sans',system-ui,sans-serif;
    transition:transform .15s ease;
  }
  .pd-agent-fab:hover{transform:scale(1.06)}
  .pd-agent-fab svg{width:24px;height:24px}
  .pd-agent-panel{
    position:fixed;right:18px;bottom:86px;z-index:9999;
    width:min(360px, calc(100vw - 36px));height:min(480px, calc(100vh - 140px));
    background:#F2F4F8;border:1px solid #D8DEE9;border-radius:18px;
    box-shadow:0 12px 40px rgba(14,27,44,.22);
    display:none;flex-direction:column;overflow:hidden;
    font-family:'Instrument Sans',system-ui,sans-serif;color:#0E1B2C;
  }
  .pd-agent-panel.open{display:flex}
  .pd-agent-head{
    background:#0E1B2C;color:#fff;padding:14px 16px;
    display:flex;align-items:center;justify-content:space-between;flex-shrink:0;
  }
  .pd-agent-head .t{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:14.5px}
  .pd-agent-head .s{font-size:11px;color:#B9C4D4;margin-top:2px}
  .pd-agent-close{background:none;border:none;color:#B9C4D4;cursor:pointer;font-size:18px;line-height:1;padding:4px}
  .pd-agent-close:hover{color:#fff}
  .pd-agent-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
  .pd-agent-msg{max-width:85%;padding:9px 12px;border-radius:12px;font-size:13.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}
  .pd-agent-msg.user{align-self:flex-end;background:#1F4FD8;color:#fff;border-bottom-right-radius:3px}
  .pd-agent-msg.assistant{align-self:flex-start;background:#fff;border:1px solid #D8DEE9;border-bottom-left-radius:3px}
  .pd-agent-msg.system-note{align-self:center;background:transparent;color:#4A5A70;font-size:11.5px;font-style:italic;text-align:center;max-width:100%}
  .pd-agent-intro{font-size:12px;color:#4A5A70;padding:2px 2px 4px}
  .pd-agent-form{display:flex;gap:8px;padding:10px;border-top:1px solid #D8DEE9;background:#fff;flex-shrink:0}
  .pd-agent-input{
    flex:1;font:inherit;font-size:13.5px;padding:9px 11px;border-radius:10px;
    border:1.5px solid #D8DEE9;outline:none;resize:none;max-height:80px;
  }
  .pd-agent-input:focus{border-color:#1F4FD8}
  .pd-agent-send{
    background:#17B587;border:none;border-radius:10px;color:#fff;font-weight:700;
    width:38px;flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;
  }
  .pd-agent-send:disabled{opacity:.5;cursor:default}
  .pd-agent-foot{font-size:10px;color:#8A97AA;text-align:center;padding:6px 10px 10px;background:#fff}
  .pd-agent-typing{display:inline-flex;gap:3px;align-items:center;padding:2px 0}
  .pd-agent-typing span{width:5px;height:5px;border-radius:50%;background:#4A5A70;animation:pdAgentBlink 1.1s infinite ease-in-out}
  .pd-agent-typing span:nth-child(2){animation-delay:.15s}
  .pd-agent-typing span:nth-child(3){animation-delay:.3s}
  @keyframes pdAgentBlink{0%,80%,100%{opacity:.25}40%{opacity:1}}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // --- DOM -----------------------------------------------------------
  const fab = document.createElement('button');
  fab.className = 'pd-agent-fab';
  fab.setAttribute('aria-label', 'Ouvrir l\'assistant Paiement Décrypté');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.2 0-2.35-.26-3.38-.73L3 21l1.73-6.12A8.5 8.5 0 1 1 21 11.5Z"/></svg>';

  const panel = document.createElement('div');
  panel.className = 'pd-agent-panel';
  panel.innerHTML = `
    <div class="pd-agent-head">
      <div>
        <div class="t">Une question ?</div>
        <div class="s">Assistant Paiement Décrypté · réponses IA</div>
      </div>
      <button class="pd-agent-close" aria-label="Fermer">✕</button>
    </div>
    <div class="pd-agent-msgs" id="pd-agent-msgs">
      <div class="pd-agent-intro">Pose une question sur un tag EMV, une notion de paiement liée, ou ce que tu viens de voir dans l'outil. Réponses générées automatiquement — vérifie les points sensibles.</div>
    </div>
    <form class="pd-agent-form" id="pd-agent-form">
      <textarea class="pd-agent-input" id="pd-agent-input" rows="1" placeholder="Écris ta question…" maxlength="2000"></textarea>
      <button class="pd-agent-send" type="submit" aria-label="Envoyer">→</button>
    </form>
    <div class="pd-agent-foot"><a href="/#inscription" style="color:#1F4FD8">S'inscrire à la newsletter</a></div>
  `;

  document.body.appendChild(panel);
  document.body.appendChild(fab);

  const msgsEl = panel.querySelector('#pd-agent-msgs');
  const formEl = panel.querySelector('#pd-agent-form');
  const inputEl = panel.querySelector('#pd-agent-input');
  const sendBtn = panel.querySelector('.pd-agent-send');
  const closeBtn = panel.querySelector('.pd-agent-close');

  // --- State -----------------------------------------------------------
  let history = loadHistory();
  history.forEach(m => renderMessage(m.role, m.content));

  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) inputEl.focus();
  });
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
  });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formEl.requestSubmit();
    }
  });

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    addMessage('user', text);

    const typingEl = renderTyping();
    setFormDisabled(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-MAX_HISTORY) }),
      });
      const data = await res.json().catch(() => ({}));
      typingEl.remove();

      if (data.reply) {
        addMessage('assistant', data.reply);
      } else if (data.message) {
        renderMessage('system-note', data.message);
      } else {
        renderMessage('system-note', "Erreur inattendue, réessaie dans un instant.");
      }
    } catch (err) {
      typingEl.remove();
      renderMessage('system-note', "Impossible de joindre l'assistant, vérifie ta connexion et réessaie.");
    } finally {
      setFormDisabled(false);
      inputEl.focus();
    }
  });

  // --- Helpers -----------------------------------------------------------
  function setFormDisabled(disabled) {
    inputEl.disabled = disabled;
    sendBtn.disabled = disabled;
  }

  function addMessage(role, content) {
    history.push({ role, content });
    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
    saveHistory(history);
    renderMessage(role, content);
  }

  function renderMessage(role, content) {
    const el = document.createElement('div');
    el.className = 'pd-agent-msg ' + (role === 'user' ? 'user' : role === 'assistant' ? 'assistant' : 'system-note');
    el.textContent = content;
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return el;
  }

  function renderTyping() {
    const el = document.createElement('div');
    el.className = 'pd-agent-msg assistant';
    el.innerHTML = '<span class="pd-agent-typing"><span></span><span></span><span></span></span>';
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return el;
  }

  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function saveHistory(h) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(h)); } catch {}
  }
})();
