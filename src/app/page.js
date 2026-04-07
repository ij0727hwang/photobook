import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.heroLabel}>
              ✨ SweetBook API 기반 포토북 서비스
            </div>
            <h1 className={styles.heroTitle}>
              사진을 올리면<br />
              <span>나만의 포토북</span>이<br />
              완성됩니다
            </h1>
            <p className={styles.heroDesc}>
              소중한 순간을 담은 사진들을 업로드하세요.
              아름다운 레이아웃의 포토북으로 제작하여
              실물로 받아보실 수 있습니다.
            </p>
            <div className={styles.heroBtns}>
              <Link href="/create" className="btn btn-primary btn-lg">
                포토북 만들기 →
              </Link>
              <Link href="/orders" className="btn btn-secondary btn-lg">
                주문 내역
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.bookShowcase}>
              <div className={styles.bookCard}>
                <div className={styles.bookCardOverlay}>🌸</div>
              </div>
              <div className={styles.bookCard}>
                <div className={styles.bookCardOverlay}>📷</div>
              </div>
              <div className={styles.bookCard}>
                <div className={styles.bookCardOverlay}>✈️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>3단계로 완성하는 포토북</h2>
        <p className={styles.sectionSub}>복잡한 편집 없이, 사진만 올리면 끝!</p>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>판형 & 템플릿 선택</h3>
            <p className={styles.stepDesc}>
              A4, A5, 스퀘어 중 원하는 판형을 선택하고
              마음에 드는 디자인 템플릿을 골라보세요.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>사진 업로드</h3>
            <p className={styles.stepDesc}>
              드래그 앤 드롭으로 간편하게 사진을 올려주세요.
              자동으로 아름다운 레이아웃으로 배치됩니다.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>주문 & 배송</h3>
            <p className={styles.stepDesc}>
              배송 정보를 입력하고 주문하면 끝!
              고품질 포토북이 집으로 배송됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>왜 MyPhotoBook인가요?</h2>
        <p className={styles.sectionSub}>포토북 제작이 이렇게 쉬웠던 적이 없습니다</p>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🎨</div>
            <h3 className={styles.featureTitle}>다양한 판형</h3>
            <p className={styles.featureDesc}>
              A4, A5, 스퀘어 하드커버 등 용도에 맞는
              판형을 자유롭게 선택할 수 있습니다.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📐</div>
            <h3 className={styles.featureTitle}>프로 템플릿</h3>
            <p className={styles.featureDesc}>
              디자이너가 만든 전문 템플릿으로
              사진만 올리면 감성 포토북이 완성됩니다.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🖨️</div>
            <h3 className={styles.featureTitle}>고품질 인쇄</h3>
            <p className={styles.featureDesc}>
              전문 인쇄 시설에서 제작되는
              선명하고 아름다운 인쇄 품질을 자랑합니다.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🚚</div>
            <h3 className={styles.featureTitle}>빠른 배송</h3>
            <p className={styles.featureDesc}>
              주문 후 제작에서 배송까지
              신속하게 처리됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>지금 바로 시작하세요</h2>
        <p className={styles.ctaDesc}>소중한 순간을 포토북으로 영원히 간직하세요.</p>
        <Link href="/create" className="btn btn-primary btn-lg">
          무료로 시작하기 →
        </Link>
      </section>
    </>
  );
}
