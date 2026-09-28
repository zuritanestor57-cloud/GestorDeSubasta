import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.ts';
import { getInitials } from '../utils/format.ts';
import CategoriesSection from '../components/admin/CategoriesSection.tsx';
import AuctionsModerationSection from '../components/admin/AuctionsModerationSection.tsx';
import UsersSection from '../components/admin/UsersSection.tsx';
import AuditSection from '../components/admin/AuditSection.tsx';
import { AlertTriangleIcon, ArrowLeftIcon, ClipboardIcon, PackageIcon, RefreshIcon, ShieldIcon, UserIcon } from '../components/icons.tsx';
import styles from './AdminDashboardPage.module.css';

type Section = 'categories' | 'auctions' | 'users' | 'audit';

const SECTIONS: { key: Section; label: string; icon: typeof ShieldIcon }[] = [
  { key: 'categories', label: 'Gestión de Categorías', icon: PackageIcon },
  { key: 'auctions', label: 'Moderación de Subastas', icon: AlertTriangleIcon },
  { key: 'users', label: 'Control de Usuarios', icon: UserIcon },
  { key: 'audit', label: 'Auditoría & Ledger', icon: ClipboardIcon },
];

// La sesión y el rol Administrator ya están garantizados por ProtectedRoute
// (ver App.tsx): acá currentUser siempre existe y es admin.
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser()!;

  const [activeSection, setActiveSection] = useState<Section>('categories');
  // "Refrescar" fuerza un remount de la sección activa (cada sección carga
  // sus propios datos en su efecto de montaje), sin coordinar estado entre
  // el padre y 4 componentes hijos distintos.
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
            <ArrowLeftIcon width={16} height={16} />
            Volver a SubastaYa
          </button>
          <span className={styles.divider} />
          <div className={styles.logoRow}>
            <span className={styles.logoIcon}>
              <ShieldIcon width={15} height={15} />
            </span>
            <span className={styles.logoText}>
              Subasta<span>Ya</span> Admin
            </span>
          </div>
        </div>

        <div className={styles.topBarRight}>
          <span className={styles.roleBadge}>Rol: Administrador</span>
          <div className={styles.adminTexts}>
            <span className={styles.adminName}>{currentUser.name}</span>
            <span className={styles.adminEmail}>{currentUser.email}</span>
          </div>
          <span className={styles.avatar}>{getInitials(currentUser.name)}</span>
        </div>
      </div>

      <div className={styles.headerCard}>
        <div className={styles.headerTexts}>
          <span className={styles.panelBadge}>
            <AlertTriangleIcon width={14} height={14} />
            Consola de Gestión Administrativa
          </span>
          <h1 className={styles.title}>Panel de Administración General</h1>
          <p className={styles.subtitle}>
            Gestioná categorías, moderá subastas, controlá usuarios y auditá los eventos del sistema.
          </p>
        </div>
        <button type="button" className={styles.refreshButton} onClick={() => setRefreshKey((k) => k + 1)}>
          <RefreshIcon width={15} height={15} />
          Refrescar
        </button>
      </div>

      <div className={styles.tabs}>
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.key}
              type="button"
              className={`${styles.tab} ${activeSection === section.key ? styles.tabActive : ''}`}
              onClick={() => setActiveSection(section.key)}
            >
              <Icon width={16} height={16} />
              {section.label}
            </button>
          );
        })}
      </div>

      {activeSection === 'categories' && <CategoriesSection key={`categories-${refreshKey}`} />}
      {activeSection === 'auctions' && <AuctionsModerationSection key={`auctions-${refreshKey}`} />}
      {activeSection === 'users' && <UsersSection key={`users-${refreshKey}`} />}
      {activeSection === 'audit' && <AuditSection key={`audit-${refreshKey}`} />}
    </div>
  );
}
