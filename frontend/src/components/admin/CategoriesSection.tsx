import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { adminService } from '../../services/adminService.ts';
import { auctionService } from '../../services/auctionService.ts';
import type { CategoryDto } from '../../types/index.ts';
import { useToasts } from '../../hooks/useToasts.ts';
import ToastStack from '../ToastStack.tsx';
import Modal from '../Modal.tsx';
import { AlertTriangleIcon, PencilIcon, SearchIcon, TrashIcon } from '../icons.tsx';
import styles from './AdminTable.module.css';

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

export default function CategoriesSection() {
  const { toasts, push, dismiss } = useToasts();

  const [categories, setCategories] = useState<CategoryDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      // Público, pero es la misma fuente que ya usa el catálogo: no hay un
      // endpoint de admin separado para listar categorías.
      setCategories(await auctionService.getCategories());
      setLoadError(null);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'No se pudieron cargar las categorías.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  const filtered = useMemo(() => {
    if (!categories) return [];
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(term));
  }, [categories, search]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (newName.trim().length < 3) {
      setCreateError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    setCreateError(null);
    setCreating(true);
    try {
      const created = await adminService.createCategory(newName.trim());
      setCategories((prev) => (prev ? [...prev, created] : [created]));
      setNewName('');
      push('success', `Categoría "${created.name}" creada.`);
    } catch (err) {
      setCreateError(getErrorMessage(err, 'No se pudo crear la categoría.'));
    } finally {
      setCreating(false);
    }
  }

  function openEdit(category: CategoryDto) {
    setEditingCategory(category);
    setEditName(category.name);
    setEditError(null);
  }

  async function handleSaveEdit() {
    if (!editingCategory) return;
    if (editName.trim().length < 3) {
      setEditError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    setSaving(true);
    try {
      const updated = await adminService.updateCategory(editingCategory.id, editName.trim());
      setCategories((prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? prev);
      push('success', 'Categoría actualizada.');
      setEditingCategory(null);
    } catch (err) {
      setEditError(getErrorMessage(err, 'No se pudo actualizar la categoría.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: CategoryDto) {
    const confirmed = window.confirm(`¿Eliminar la categoría "${category.name}"?`);
    if (!confirmed) return;
    setDeletingId(category.id);
    try {
      await adminService.deleteCategory(category.id);
      setCategories((prev) => prev?.filter((c) => c.id !== category.id) ?? prev);
      push('success', 'Categoría eliminada.');
    } catch (err) {
      // Falla con 400 si tiene subastas asociadas (cualquier estado, no solo activas).
      push('error', getErrorMessage(err, 'No se pudo eliminar la categoría.'));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className={styles.centerState}>
        <span className={styles.spinner} />
        <span className={styles.centerText}>Cargando categorías…</span>
      </div>
    );
  }

  if (loadError || !categories) {
    return (
      <div className={styles.centerState}>
        <AlertTriangleIcon width={28} height={28} />
        <span className={styles.centerText}>{loadError}</span>
        <button type="button" className={styles.secondaryButton} onClick={() => void load()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <form className={styles.banner} onSubmit={handleCreate}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <input
            className={styles.formInput}
            placeholder="Nombre de la nueva categoría…"
            value={newName}
            disabled={creating}
            onChange={(e) => {
              setNewName(e.target.value);
              setCreateError(null);
            }}
          />
          {createError && <div className={styles.formError}>{createError}</div>}
        </div>
        <button type="submit" className={styles.actionButton} disabled={creating}>
          {creating ? 'Creando…' : 'Crear Categoría'}
        </button>
      </form>

      <div className={styles.searchRow}>
        <span className={styles.searchIcon}>
          <SearchIcon width={16} height={16} />
        </span>
        <input
          className={styles.searchInput}
          placeholder="Buscar por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>No hay categorías que coincidan.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((category) => (
                <tr key={category.id}>
                  <td className={styles.mono}>#{category.id}</td>
                  <td style={{ fontWeight: 700 }}>{category.name}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.iconButton} onClick={() => openEdit(category)}>
                        <PencilIcon width={13} height={13} />
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                        disabled={deletingId === category.id}
                        onClick={() => void handleDelete(category)}
                      >
                        <TrashIcon width={13} height={13} />
                        {deletingId === category.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingCategory && (
        <Modal title="Editar categoría" onClose={() => setEditingCategory(null)}>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="edit-category-name">
              Nombre
            </label>
            <input
              id="edit-category-name"
              className={styles.formInput}
              value={editName}
              disabled={saving}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditError(null);
              }}
            />
            {editError && <span className={styles.formError}>{editError}</span>}
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setEditingCategory(null)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="button" className={styles.actionButton} onClick={() => void handleSaveEdit()} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
