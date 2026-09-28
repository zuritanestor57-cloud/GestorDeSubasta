import type { CategoryDto } from '../../types/index.ts';
import styles from './CategoryMultiSelect.module.css';

interface Props {
  categories: CategoryDto[];
  loading: boolean;
  selectedIds: number[];
  onToggle: (id: number) => void;
}

// El backend acepta varias categorías por subasta (CreateAuctionDto.categoryIds
// es un array), por eso es selección múltiple y no un <select> de una sola opción.
export default function CategoryMultiSelect({ categories, loading, selectedIds, onToggle }: Props) {
  if (loading) {
    return <span className={styles.loading}>Cargando categorías…</span>;
  }

  return (
    <div className={styles.grid}>
      {categories.map((category) => {
        const active = selectedIds.includes(category.id);
        return (
          <button
            key={category.id}
            type="button"
            className={`${styles.chip} ${active ? styles.chipActive : ''}`}
            onClick={() => onToggle(category.id)}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
