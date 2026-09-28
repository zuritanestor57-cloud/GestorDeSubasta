import { useEffect, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.ts';
import { auctionService } from '../services/auctionService.ts';
import type { CategoryDto } from '../types/index.ts';
import { getInitials } from '../utils/format.ts';
import { nowMs } from '../utils/time.ts';
import CategoryMultiSelect from '../components/createAuction/CategoryMultiSelect.tsx';
import ImagePreview from '../components/createAuction/ImagePreview.tsx';
import { AlertTriangleIcon, ArrowLeftIcon, HammerIcon, ShieldIcon, SparklesIcon } from '../components/icons.tsx';
import styles from './CreateAuctionPage.module.css';

// El input datetime-local ya da la hora tal cual la eligió el usuario, sin
// zona horaria ("2026-09-27T23:10"). Si se pasara por `new Date(...).toISOString()`,
// el navegador la reinterpreta como hora local y la convierte a UTC antes de
// mandarla — el backend la guarda igual, tal cual, sin volver a convertirla,
// así que el corrimiento de horas (y a veces de día) queda pegado para
// siempre. Por eso viaja como texto, sin pasar por Date en ningún momento.
function toBackendDateTime(datetimeLocalValue: string): string {
  return datetimeLocalValue.length === 16 ? `${datetimeLocalValue}:00` : datetimeLocalValue;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

interface FormValues {
  title: string;
  categoryIds: number[];
  description: string;
  basePrice: string;
  minimumIncrement: string;
  startDate: string;
  endDate: string;
}

// Función de módulo (no vive dentro del componente): evita que el linter de
// pureza de React marque el uso de `Date.now()` como un efecto secundario
// durante el render. Mezcla lo que el backend ya exige (RF-15, RF-16, en
// AuctionService.CreateAuctionAsync) con guardrails extra de UX (largo de
// título/descripción, categoría obligatoria, fecha de inicio no pasada).
function validateAuctionForm(values: FormValues, now: number): string | null {
  if (values.title.trim().length < 5) return 'El título debe tener al menos 5 caracteres.';
  if (values.categoryIds.length === 0) return 'Seleccioná al menos una categoría.';
  if (values.description.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres.';

  const base = Number(values.basePrice);
  if (!values.basePrice || Number.isNaN(base) || base <= 0) {
    return 'El precio base debe ser un valor positivo mayor a cero.';
  }

  const increment = Number(values.minimumIncrement);
  if (!values.minimumIncrement || Number.isNaN(increment) || increment <= 0) {
    return 'El incremento mínimo por puja debe ser un valor positivo mayor a cero.';
  }

  if (!values.startDate) return 'Elegí la fecha y hora de inicio.';
  if (!values.endDate) return 'Elegí la fecha y hora de finalización.';

  const start = new Date(values.startDate);
  const end = new Date(values.endDate);
  if (start.getTime() < now) return 'La fecha de inicio no puede ser anterior a la hora actual.';
  if (end.getTime() <= start.getTime()) return 'La fecha de cierre debe ser estrictamente posterior a la de inicio.';

  return null;
}

// La sesión y el rol (Seller o BuyerAndSeller) ya están garantizados por
// ProtectedRoute (ver App.tsx): acá currentUser siempre existe y puede vender.
export default function CreateAuctionPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser()!;

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [minimumIncrement, setMinimumIncrement] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    auctionService
      .getCategories()
      .then(setCategories)
      .finally(() => setCategoriesLoading(false));
  }, []);

  function toggleCategory(id: number) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validateAuctionForm(
      { title, categoryIds, description, basePrice, minimumIncrement, startDate, endDate },
      nowMs(),
    );
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      const created = await auctionService.create({
        userId: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        categoryIds,
        basePrice: Number(basePrice),
        minimumIncrement: Number(minimumIncrement),
        startDate: toBackendDateTime(startDate),
        endDate: toBackendDateTime(endDate),
      });
      navigate(`/auctions/${created.id}`);
    } catch (err) {
      setFormError(getErrorMessage(err, 'No se pudo publicar la subasta.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button type="button" className={styles.backButton} aria-label="Volver" onClick={() => navigate('/')}>
            <ArrowLeftIcon width={18} height={18} />
          </button>
          <span className={styles.divider} />
          <div className={styles.logoRow}>
            <span className={styles.logoIcon}>
              <HammerIcon width={15} height={15} />
            </span>
            <span className={styles.logoText}>
              Subasta<span>Ya</span> Publicar
            </span>
          </div>
        </div>

        <div className={styles.sellerCard}>
          <span className={styles.verifiedBadge}>
            <ShieldIcon width={14} height={14} />
            Vendedor Verificado
          </span>
          <span className={styles.avatar}>{getInitials(currentUser.name)}</span>
        </div>
      </div>

      <div className={styles.headerCard}>
        <span className={styles.panelBadge}>
          <SparklesIcon width={14} height={14} />
          Panel de Publicación de Lotes
        </span>
        <h1 className={styles.title}>Crear y Publicar Nueva Subasta</h1>
        <p className={styles.subtitle}>
          Completá los datos del producto, la configuración económica y la ventana temporal.
        </p>
      </div>

      {formError && (
        <div className={styles.errorBox}>
          <AlertTriangleIcon width={16} height={16} />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className={styles.section}>
          <span className={styles.sectionHeader}>Paso 1 de 3 · Información del producto</span>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ca-title">
              Título <span className={styles.required}>*</span>
            </label>
            <input
              id="ca-title"
              className={styles.input}
              placeholder="Ej. Cronógrafo Automático Suizo 1974 - Edición Coleccionista"
              value={title}
              disabled={submitting}
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className={styles.helper}>
              Mínimo 5 caracteres. Sé descriptivo: es lo primero que ven los postores.
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Categorías <span className={styles.required}>*</span>
            </label>
            <CategoryMultiSelect
              categories={categories}
              loading={categoriesLoading}
              selectedIds={categoryIds}
              onToggle={toggleCategory}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ca-description">
              Descripción detallada <span className={styles.required}>*</span>
            </label>
            <textarea
              id="ca-description"
              className={styles.textarea}
              rows={4}
              placeholder="Detalles técnicos, historial, accesorios incluidos y estado de conservación…"
              value={description}
              disabled={submitting}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.imageRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ca-image">
                URL de imagen
              </label>
              <input
                id="ca-image"
                type="url"
                className={styles.input}
                placeholder="https://…"
                value={imageUrl}
                disabled={submitting}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <span className={styles.helper}>Opcional: si no ponés una, se muestra una imagen por defecto.</span>
            </div>
            <ImagePreview imageUrl={imageUrl} />
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionHeader}>Paso 2 de 3 · Configuración económica</span>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ca-base-price">
                Precio base inicial ($) <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputRow}>
                <span className={styles.prefix}>$</span>
                <input
                  id="ca-base-price"
                  type="number"
                  min={0}
                  className={`${styles.input} ${styles.inputWithPrefix} ${styles.mono}`}
                  value={basePrice}
                  disabled={submitting}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ca-increment">
                Incremento mínimo por puja ($) <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputRow}>
                <span className={styles.prefix}>$</span>
                <input
                  id="ca-increment"
                  type="number"
                  min={1}
                  className={`${styles.input} ${styles.inputWithPrefix} ${styles.mono}`}
                  value={minimumIncrement}
                  disabled={submitting}
                  onChange={(e) => setMinimumIncrement(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionHeader}>Paso 3 de 3 · Ventana temporal de vigencia</span>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ca-start">
                Fecha y hora de inicio <span className={styles.required}>*</span>
              </label>
              <input
                id="ca-start"
                type="datetime-local"
                className={`${styles.input} ${styles.mono}`}
                value={startDate}
                disabled={submitting}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ca-end">
                Fecha y hora de finalización <span className={styles.required}>*</span>
              </label>
              <input
                id="ca-end"
                type="datetime-local"
                className={`${styles.input} ${styles.mono}`}
                value={endDate}
                disabled={submitting}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <p className={styles.infoNote}>
            La subasta se publica como <b>Próxima</b>. Se activa sola en cuanto llega la fecha de inicio (puede
            tardar hasta 30 segundos en pasar a Activa).
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={() => navigate('/')} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? (
              <>
                <span className={styles.spinner} />
                Publicando subasta…
              </>
            ) : (
              'Publicar Subasta'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
