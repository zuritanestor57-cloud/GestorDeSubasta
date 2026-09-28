import { useState } from 'react';
import { ImageOffIcon } from '../icons.tsx';
import styles from './ImagePreview.module.css';

// Vista previa en vivo de la URL de imagen. Si está vacía o rota (onError),
// cae al placeholder sin romper el formulario. Se guarda cuál URL falló (en
// vez de un simple booleano) para no necesitar un efecto que lo resetee
// cuando el usuario corrige el campo: alcanza con comparar contra la actual.
export default function ImagePreview({ imageUrl }: { imageUrl: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = imageUrl.trim().length > 0 && imageUrl !== failedUrl;

  return (
    <div className={styles.wrap}>
      {showImage ? (
        <img
          src={imageUrl}
          alt="Vista previa del producto"
          className={styles.image}
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <div className={styles.placeholder}>
          <ImageOffIcon width={26} height={26} />
          <span>Vista previa</span>
        </div>
      )}
      {!showImage && <span className={styles.badge}>Imagen por defecto</span>}
    </div>
  );
}
