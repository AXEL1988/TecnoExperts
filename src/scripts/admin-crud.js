/** CRUD genérico del panel: funciona con cualquier entidad declarada en src/lib/entities.ts. */
export function initCrud() {
  const form = document.querySelector('#entity-form');
  const editor = document.querySelector('#editor');
  const tbody = document.querySelector('#entity-body');
  if (!form || !editor || !tbody) return;

  const entity = form.dataset.entity;
  const idInput = form.querySelector('#entity-id');
  const inputs = [...form.querySelectorAll('[data-field]')];
  const title = document.querySelector('#editor-title');
  const feedback = document.querySelector('#editor-feedback');

  const showFeedback = (message) => {
    if (!feedback) return;
    feedback.textContent = message ?? '';
    feedback.classList.toggle('hidden', !message);
  };

  function openEditor(item) {
    idInput.value = item?.id ?? '';
    for (const input of inputs) {
      const value = item ? item[input.dataset.field] : input.dataset.default;
      input.value = value ?? '';
    }
    title.textContent = item ? form.dataset.editLabel : form.dataset.newLabel;
    showFeedback(null);
    editor.classList.remove('hidden');
    editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.querySelector('#new-entity').addEventListener('click', () => openEditor(null));
  document.querySelector('#cancel-edit').addEventListener('click', () => editor.classList.add('hidden'));

  tbody.addEventListener('click', async (event) => {
    const row = event.target.closest('tr[data-id]');
    if (!row) return;
    const id = row.dataset.id;

    if (event.target.closest('.edit-btn')) {
      const response = await fetch(`/api/admin/${entity}/${id}`);
      if (!response.ok) return alert('No fue posible cargar el registro.');
      return openEditor(await response.json());
    }

    if (event.target.closest('.delete-btn')) {
      if (!confirm(form.dataset.deleteLabel)) return;
      const response = await fetch(`/api/admin/${entity}/${id}`, { method: 'DELETE' });
      if (response.ok) row.remove();
      else alert('No fue posible eliminar el registro.');
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(inputs.map((input) => [input.dataset.field, input.value]));
    const id = idInput.value;
    const response = await fetch(id ? `/api/admin/${entity}/${id}` : `/api/admin/${entity}`, {
      method: id ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) return location.reload();
    const data = await response.json().catch(() => ({}));
    showFeedback(data.message ?? 'No fue posible guardar el registro.');
  });
}
