'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>📖</span>
          MyPhotoBook
        </Link>
        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}
          >
            홈
          </Link>
          <Link
            href="/create"
            className={`${styles.navLink} ${pathname === '/create' ? styles.navLinkActive : ''}`}
          >
            포토북 만들기
          </Link>
          <Link href="/create" className={`btn btn-primary btn-sm ${styles.ctaBtn}`}>
            시작하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
