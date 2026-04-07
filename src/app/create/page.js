'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const STEPS = [
  { label: '사진 업로드', icon: '📷' },
  { label: '표지 정보', icon: '📖' },
  { label: '미리보기', icon: '👁️' },
  { label: '주문하기', icon: '🛒' },
];

export default function CreatePage() {
  const [step, setStep] = useState(0);

  // Photo states
  const [pageCount, setPageCount] = useState(24);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [backPhoto, setBackPhoto] = useState(null);
  const [contentPhotos, setContentPhotos] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  // Text states
  const [coverInfo, setCoverInfo] = useState({ subtitle: '', dateRange: '' });
  const [backInfo, setBackInfo] = useState({
    title: '', publishDate: '', author: '', hashtags: '', publisher: '',
  });

  // Order states
  const [shipping, setShipping] = useState({
    recipientName: '', recipientPhone: '', postalCode: '',
    address1: '', address2: '', memo: '',
  });
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ show: false, text: '', pct: 0 });
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null);
  const [bookUid, setBookUid] = useState(null);

  const fileInputRefCover = useRef(null);
  const fileInputRefBack = useRef(null);
  const fileInputRefContent = useRef(null);

  // ─── Helpers ───
  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const pickSingleFile = (files, setter) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;
    const f = valid[0];
    setter({ file: f, preview: URL.createObjectURL(f), name: f.name });
  };

  const addContentFiles = useCallback((files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;
    const newPhotos = valid.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setContentPhotos(prev => [...prev, ...newPhotos]);
  }, []);

  const removeContentPhoto = (id) => {
    setContentPhotos(prev => {
      const p = prev.find(x => x.id === id);
      if (p) URL.revokeObjectURL(p.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    addContentFiles(e.dataTransfer.files);
  }, [addContentFiles]);

  // ─── processBook ───
  const processBook = async () => {
    if (!coverPhoto || !backPhoto || contentPhotos.length < pageCount) {
      showToast('모든 사진을 올바르게 등록해주세요. 내지 사진은 페이지 수 이상이어야 합니다.');
      return;
    }
    setProgress({ show: true, text: '포토북을 생성하고 있습니다...', pct: 5 });

    try {
      // 1. Create book
      setProgress({ show: true, text: '스퀘어북을 생성하고 있습니다...', pct: 8 });
      const bookRes = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: backInfo.title || '나의 포토북',
          bookSpecUid: 'SQUAREBOOK_HC',
          bookAuthor: backInfo.author || '',
        }),
      });
      const bookData = await bookRes.json();
      if (!bookData.success) throw new Error(bookData.message || '책 생성 실패');
      const uid = bookData.data.bookUid;
      setBookUid(uid);

      // 2. Upload ALL photos (cover + back + contents)
      const totalUploads = 2 + contentPhotos.length;
      let uploadIdx = 0;

      const uploadOne = async (photoObj) => {
        const fd = new FormData();
        fd.append('file', photoObj.file);
        const res = await fetch(`/api/books/${uid}/photos`, { method: 'POST', body: fd });
        const d = await res.json();
        if (d.success && d.data?.fileName) return d.data.fileName;
        if (d.success && d.data?.photos?.[0]?.fileName) return d.data.photos[0].fileName;
        throw new Error(`사진 업로드 실패: ${photoObj.name}`);
      };

      setProgress({ show: true, text: `앞표지 사진 업로드 중...`, pct: 12 });
      const uploadedCover = await uploadOne(coverPhoto);
      uploadIdx++;

      setProgress({ show: true, text: `뒷표지 사진 업로드 중...`, pct: 15 });
      const uploadedBack = await uploadOne(backPhoto);
      uploadIdx++;

      const uploadedContents = [];
      for (let i = 0; i < contentPhotos.length; i++) {
        uploadIdx++;
        const pct = 15 + Math.round((uploadIdx / totalUploads) * 40);
        setProgress({ show: true, text: `내지 사진 업로드 중... (${i + 1}/${contentPhotos.length})`, pct });
        uploadedContents.push(await uploadOne(contentPhotos[i]));
      }

      // 3. Front cover
      setProgress({ show: true, text: '앞표지를 구성하고 있습니다...', pct: 58 });
      const coverFd = new FormData();
      coverFd.append('templateUid', '4Fy1mpIlm1ek');
      coverFd.append('parameters', JSON.stringify({
        coverPhoto: uploadedCover,
        subtitle: coverInfo.subtitle || '',
        dateRange: coverInfo.dateRange || '',
      }));
      await fetch(`/api/books/${uid}/cover`, { method: 'POST', body: coverFd });

      // 4. Content pages — distribute photos across (pageCount - 1) pages
      const innerPageCount = pageCount - 1; // last page reserved for back cover
      const chunks = Array.from({ length: innerPageCount }, () => []);
      uploadedContents.forEach((name, idx) => {
        chunks[idx % innerPageCount].push(name);
      });

      for (let i = 0; i < chunks.length; i++) {
        const pct = 60 + Math.round((i / chunks.length) * 22);
        setProgress({ show: true, text: `내지 페이지 추가 중... (${i + 1}/${chunks.length})`, pct });
        const fd = new FormData();
        fd.append('templateUid', '6OT6J6AGlnyE');
        fd.append('parameters', JSON.stringify({ photos: chunks[i] }));
        await fetch(`/api/books/${uid}/contents?breakBefore=page`, { method: 'POST', body: fd });
      }

      // 5. Back cover (as last content page)
      setProgress({ show: true, text: '뒷표지를 구성하고 있습니다...', pct: 85 });
      const backFd = new FormData();
      backFd.append('templateUid', '5oRDpEfVerdC');
      backFd.append('parameters', JSON.stringify({
        photo: uploadedBack,
        title: backInfo.title || '',
        publishDate: backInfo.publishDate || '',
        author: backInfo.author || '',
        hashtags: backInfo.hashtags || '',
        publisher: backInfo.publisher || '',
      }));
      await fetch(`/api/books/${uid}/contents?breakBefore=page`, { method: 'POST', body: backFd });

      // 6. Finalize
      setProgress({ show: true, text: '포토북을 최종화하고 있습니다...', pct: 90 });
      const finalRes = await fetch(`/api/books/${uid}/finalize`, { method: 'POST' });
      const finalData = await finalRes.json();
      if (!finalData.success) throw new Error(finalData.message || '최종화 실패');

      // 7. Estimate
      setProgress({ show: true, text: '견적을 조회하고 있습니다...', pct: 95 });
      const estRes = await fetch('/api/orders/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ bookUid: uid, quantity: 1 }] }),
      });
      const estData = await estRes.json();
      if (estData.success) setEstimate(estData.data);

      setProgress({ show: false, text: '', pct: 100 });
      setStep(3);
    } catch (err) {
      setProgress({ show: false, text: '', pct: 0 });
      showToast(err.message || '포토북 생성 중 오류가 발생했습니다.');
    }
  };

  // ─── Place order ───
  const placeOrder = async () => {
    if (!bookUid) return;
    if (!shipping.recipientName || !shipping.recipientPhone || !shipping.postalCode || !shipping.address1) {
      showToast('배송 정보를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `order-${bookUid}-${Date.now()}`,
        },
        body: JSON.stringify({ items: [{ bookUid, quantity: 1 }], shipping }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || '주문 생성 실패');
      setResult({
        orderUid: data.data.orderUid,
        totalAmount: data.data.totalAmount,
        paidCreditAmount: data.data.paidCreditAmount,
      });
      setStep(4);
    } catch (err) {
      showToast(err.message || '주문 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Navigation ───
  const canNext = () => {
    if (step === 0) return coverPhoto && backPhoto && contentPhotos.length >= pageCount && pageCount >= 24 && pageCount <= 130;
    if (step === 1) return coverInfo.subtitle && coverInfo.dateRange && backInfo.title && backInfo.author;
    return true;
  };

  const goNext = () => {
    if (step === 2) { processBook(); return; }
    if (canNext()) setStep(s => s + 1);
    else showToast('필수 정보를 모두 입력해주세요.');
  };
  const goPrev = () => { if (step > 0) setStep(s => s - 1); };

  // ─── Validation UI helpers ───
  const pageValid = pageCount >= 24 && pageCount <= 130;
  const photosEnough = contentPhotos.length >= pageCount;

  // ══════════════════════════════════════════════════════════════════
  //  RENDER: Step 0 — Photo Upload & Page Settings
  // ══════════════════════════════════════════════════════════════════
  const renderPhotoStep = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>사진 업로드 및 페이지 설정</h2>
      <p className={styles.stepSubtitle}>
        고화질 스퀘어북 (하드커버, 243×248mm)에 들어갈 사진을 등록하세요.
      </p>

      {/* Page count */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>📐 목표 페이지 수</span>
          <input
            type="number"
            min="24"
            max="130"
            step="2"
            className="input"
            style={{ width: 100, textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}
            value={pageCount}
            onChange={(e) => setPageCount(Math.max(0, Number(e.target.value) || 0))}
          />
          <span style={{ fontSize: '0.85rem', color: pageValid ? 'var(--text-muted)' : 'var(--error)' }}>
            {pageValid ? '(24 ~ 130페이지)' : '⚠️ 24 ~ 130 사이 값을 입력해주세요'}
          </span>
        </div>
      </div>

      {/* Cover photos: front + back */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Front cover */}
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <h4 style={{ marginBottom: 12, fontWeight: 700 }}>📕 앞표지 사진</h4>
          <input type="file" ref={fileInputRefCover} style={{ display: 'none' }} accept="image/*"
            onChange={(e) => pickSingleFile(e.target.files, setCoverPhoto)} />
          {coverPhoto ? (
            <div style={{ position: 'relative' }}>
              <img src={coverPhoto.preview} alt="앞표지"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12, border: '2px solid var(--border-accent)' }} />
              <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{coverPhoto.name}</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}
                onClick={() => fileInputRefCover.current?.click()}>변경</button>
            </div>
          ) : (
            <div className={styles.uploadZone} onClick={() => fileInputRefCover.current?.click()}
              style={{ padding: 32 }}>
              <div className={styles.uploadIcon}>🖼️</div>
              <div className={styles.uploadText}>사진을 선택하세요</div>
              <div className={styles.uploadSub}>앞표지에 들어갈 대표 사진</div>
            </div>
          )}
        </div>

        {/* Back cover */}
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <h4 style={{ marginBottom: 12, fontWeight: 700 }}>📗 뒷표지 사진</h4>
          <input type="file" ref={fileInputRefBack} style={{ display: 'none' }} accept="image/*"
            onChange={(e) => pickSingleFile(e.target.files, setBackPhoto)} />
          {backPhoto ? (
            <div style={{ position: 'relative' }}>
              <img src={backPhoto.preview} alt="뒷표지"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12, border: '2px solid var(--accent-secondary)', borderColor: 'rgba(139,92,246,0.4)' }} />
              <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{backPhoto.name}</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}
                onClick={() => fileInputRefBack.current?.click()}>변경</button>
            </div>
          ) : (
            <div className={styles.uploadZone} onClick={() => fileInputRefBack.current?.click()}
              style={{ padding: 32 }}>
              <div className={styles.uploadIcon}>🖼️</div>
              <div className={styles.uploadText}>사진을 선택하세요</div>
              <div className={styles.uploadSub}>뒷표지에 들어갈 사진</div>
            </div>
          )}
        </div>
      </div>

      {/* Content photos — drag & drop */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h4 style={{ fontWeight: 700 }}>📷 내지 사진</h4>
          <span className={`badge ${photosEnough ? 'badge-success' : 'badge-warning'}`}>
            {contentPhotos.length}장 / 최소 {pageCount}장 필요
          </span>
        </div>

        <div
          className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRefContent.current?.click()}
        >
          <input ref={fileInputRefContent} type="file" accept="image/*" multiple
            style={{ display: 'none' }}
            onChange={(e) => addContentFiles(e.target.files)} />
          <div className={styles.uploadIcon}>📸</div>
          <div className={styles.uploadText}>클릭하거나 드래그하여 사진을 업로드하세요</div>
          <div className={styles.uploadSub}>JPG, PNG, WebP, HEIC 지원 · 최대 50MB/장 · 여러장 동시 선택 가능</div>
        </div>

        {contentPhotos.length > 0 && (
          <>
            <div className={styles.photoCount}>
              📷 {contentPhotos.length}장 선택됨
              {!photosEnough && (
                <span style={{ color: 'var(--warning)', marginLeft: 8 }}>
                  (아직 {pageCount - contentPhotos.length}장 더 필요합니다)
                </span>
              )}
            </div>
            <div className={styles.photoGrid}>
              {contentPhotos.map((photo) => (
                <div key={photo.id} className={styles.photoItem}>
                  <img src={photo.preview} alt={photo.name} />
                  <button className={styles.photoRemove}
                    onClick={(e) => { e.stopPropagation(); removeContentPhoto(photo.id); }}>✕</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  //  RENDER: Step 1 — Cover & Back Cover Text Info
  // ══════════════════════════════════════════════════════════════════
  const renderInfoStep = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>표지 정보를 입력하세요</h2>
      <p className={styles.stepSubtitle}>포토북 앞표지와 뒷표지에 표시될 정보를 입력합니다.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Front cover info */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            📕 앞표지
          </h3>
          {coverPhoto && (
            <div style={{ marginBottom: 16 }}>
              <img src={coverPhoto.preview} alt="앞표지 미리보기"
                style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12, opacity: 0.7 }} />
            </div>
          )}
          <div className="input-group">
            <label>부제목 *</label>
            <input className="input" value={coverInfo.subtitle}
              onChange={e => setCoverInfo({ ...coverInfo, subtitle: e.target.value })}
              placeholder="예: 나의 모든 순간들" />
          </div>
          <div className="input-group">
            <label>날짜 범위 *</label>
            <input className="input" value={coverInfo.dateRange}
              onChange={e => setCoverInfo({ ...coverInfo, dateRange: e.target.value })}
              placeholder="예: 2024.06 - 2025.12" />
          </div>
        </div>

        {/* Back cover info */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            📗 뒷표지
          </h3>
          {backPhoto && (
            <div style={{ marginBottom: 16 }}>
              <img src={backPhoto.preview} alt="뒷표지 미리보기"
                style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12, opacity: 0.7 }} />
            </div>
          )}
          <div className="input-group">
            <label>책 제목 *</label>
            <input className="input" value={backInfo.title}
              onChange={e => setBackInfo({ ...backInfo, title: e.target.value })}
              placeholder="예: 우리 가족 이야기" />
          </div>
          <div className="input-group">
            <label>발행일</label>
            <input className="input" value={backInfo.publishDate}
              onChange={e => setBackInfo({ ...backInfo, publishDate: e.target.value })}
              placeholder="예: 2026.04" />
          </div>
          <div className="input-group">
            <label>만든이 *</label>
            <input className="input" value={backInfo.author}
              onChange={e => setBackInfo({ ...backInfo, author: e.target.value })}
              placeholder="예: 홍길동" />
          </div>
          <div className="input-group">
            <label>해시태그</label>
            <input className="input" value={backInfo.hashtags}
              onChange={e => setBackInfo({ ...backInfo, hashtags: e.target.value })}
              placeholder="예: #여행 #추억 #2026" />
          </div>
          <div className="input-group">
            <label>제작사</label>
            <input className="input" value={backInfo.publisher}
              onChange={e => setBackInfo({ ...backInfo, publisher: e.target.value })}
              placeholder="예: (주)스위트북" />
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  //  RENDER: Step 2 — Preview / Confirm
  // ══════════════════════════════════════════════════════════════════
  const renderPreviewStep = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>미리보기</h2>
      <p className={styles.stepSubtitle}>설정을 확인하고 포토북 제작을 시작합니다.</p>

      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.95rem' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>판형: </span><strong>고화질 스퀘어북 (하드커버)</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>페이지 수: </span><strong>{pageCount}페이지</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>내지 사진: </span><strong>{contentPhotos.length}장</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>부제목: </span><strong>{coverInfo.subtitle || '(없음)'}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>책 제목: </span><strong>{backInfo.title || '(없음)'}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>만든이: </span><strong>{backInfo.author || '(없음)'}</strong></div>
        </div>
      </div>

      {/* Preview grid showing cover + a few content + back */}
      <h3 style={{ marginBottom: 16, fontWeight: 600 }}>사진 미리보기</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {coverPhoto && (
          <div style={{ position: 'relative' }}>
            <img src={coverPhoto.preview} alt="앞표지"
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12, border: '2px solid var(--accent-primary)' }} />
            <span className="badge badge-warning" style={{ position: 'absolute', top: 6, left: 6, fontSize: '0.65rem' }}>앞표지</span>
          </div>
        )}
        {contentPhotos.slice(0, 10).map(p => (
          <img key={p.id} src={p.preview} alt={p.name}
            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
        ))}
        {contentPhotos.length > 10 && (
          <div style={{
            aspectRatio: '1', borderRadius: 8, background: 'var(--bg-glass)',
            border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>+{contentPhotos.length - 10}</span>
            <span>더 있음</span>
          </div>
        )}
        {backPhoto && (
          <div style={{ position: 'relative' }}>
            <img src={backPhoto.preview} alt="뒷표지"
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12, border: '2px solid var(--accent-secondary)', borderColor: 'rgba(139,92,246,0.4)' }} />
            <span className="badge badge-info" style={{ position: 'absolute', top: 6, left: 6, fontSize: '0.65rem' }}>뒷표지</span>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        &#8251; &quot;생성하기&quot;를 누르면 {contentPhotos.length}장의 사진이 {pageCount}개 페이지에 자동 분배됩니다.
      </p>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  //  RENDER: Step 3 — Order
  // ══════════════════════════════════════════════════════════════════
  const renderOrderStep = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>주문 및 배송 정보</h2>
      <p className={styles.stepSubtitle}>배송받을 주소와 수령인 정보를 입력한 뒤 주문을 완료하세요.</p>

      <div className={styles.orderSection}>
        <div className={styles.orderFormPanel}>
          <div className={styles.orderFormTitle}>📦 배송 정보</div>
          <div className="input-group"><label>수령인 *</label>
            <input className="input" placeholder="홍길동" value={shipping.recipientName}
              onChange={e => setShipping({ ...shipping, recipientName: e.target.value })} /></div>
          <div className="input-group"><label>연락처 *</label>
            <input className="input" placeholder="010-1234-5678" value={shipping.recipientPhone}
              onChange={e => setShipping({ ...shipping, recipientPhone: e.target.value })} /></div>
          <div className="input-group"><label>우편번호 *</label>
            <input className="input" placeholder="06236" value={shipping.postalCode}
              onChange={e => setShipping({ ...shipping, postalCode: e.target.value })} /></div>
          <div className="input-group"><label>주소 *</label>
            <input className="input" placeholder="서울특별시 강남구 테헤란로 123" value={shipping.address1}
              onChange={e => setShipping({ ...shipping, address1: e.target.value })} /></div>
          <div className="input-group"><label>상세 주소</label>
            <input className="input" placeholder="4층 401호" value={shipping.address2}
              onChange={e => setShipping({ ...shipping, address2: e.target.value })} /></div>
          <div className="input-group"><label>배송 메모</label>
            <input className="input" placeholder="부재시 경비실" value={shipping.memo}
              onChange={e => setShipping({ ...shipping, memo: e.target.value })} /></div>
        </div>

        <div className={styles.estimatePanel}>
          <div className={styles.orderFormTitle}>💰 주문 요약</div>
          {estimate ? (
            <>
              <div className={styles.estimateRow}>
                <span>상품 금액</span>
                <span>{(estimate.productAmount || 0).toLocaleString()}원</span>
              </div>
              <div className={styles.estimateRow}>
                <span>배송비</span>
                <span>{(estimate.shippingFee || 0).toLocaleString()}원</span>
              </div>
              {(estimate.packagingFee || 0) > 0 && (
                <div className={styles.estimateRow}>
                  <span>포장비</span>
                  <span>{estimate.packagingFee.toLocaleString()}원</span>
                </div>
              )}
              <div className={`${styles.estimateRow} ${styles.total}`}>
                <span>총 결제 금액</span>
                <span className={styles.estimateTotal}>
                  {(estimate.paidCreditAmount || estimate.totalAmount || 0).toLocaleString()}원
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
                * Sandbox 환경에서는 테스트 가격이 적용됩니다.
              </p>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              견적 정보를 불러오는 중...
            </p>
          )}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 24 }}
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? '주문 처리 중...' : '결제 및 주문하기'}
          </button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  //  RENDER: Step 4 — Result
  // ══════════════════════════════════════════════════════════════════
  const renderResultStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.resultSection}>
        <div className={styles.resultIcon}>🎉</div>
        <h2 className={styles.resultTitle}>주문이 완료되었습니다!</h2>
        <p className={styles.resultDesc}>포토북 제작이 시작됩니다. 주문 내역에서 진행 상황을 확인할 수 있습니다.</p>
        <div className={styles.resultInfo}>
          <div className={styles.resultInfoRow}>
            <span className={styles.resultInfoLabel}>주문번호</span>
            <span>{result?.orderUid}</span>
          </div>
          <div className={styles.resultInfoRow}>
            <span className={styles.resultInfoLabel}>결제 금액</span>
            <span>{(result?.paidCreditAmount || result?.totalAmount || 0).toLocaleString()}원</span>
          </div>
        </div>
        <div className={styles.resultBtns}>
          <Link href="/orders" className="btn btn-primary">주문 내역 보기</Link>
          <Link href="/create" className="btn btn-secondary" onClick={() => window.location.reload()}>새 포토북 만들기</Link>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className={styles.createPage}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {toast.msg}
        </div>
      )}

      {/* Progress Overlay */}
      {progress.show && (
        <div className={styles.progressOverlay}>
          <div className="spinner" style={{ width: 48, height: 48 }}></div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>{progress.text}</h3>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress.pct}%` }} />
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{progress.pct}%</div>
        </div>
      )}

      <div className="container">
        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          {STEPS.map((s, idx) => {
            const circle = (
              <div className={styles.stepDot} key={`dot-${idx}`}>
                <div className={`${styles.stepDotCircle} ${step === idx ? styles.active : ''} ${step > idx ? styles.done : ''}`}>
                  {step > idx ? '✓' : s.icon}
                </div>
                <span className={`${styles.stepDotLabel} ${step === idx ? styles.active : ''}`}>{s.label}</span>
              </div>
            );
            if (idx === 0) return circle;
            return [
              <div key={`line-${idx}`} className={`${styles.stepLine} ${step > idx - 1 ? styles.done : ''}`} />,
              circle,
            ];
          })}
        </div>

        {/* Step Content */}
        {step === 0 && renderPhotoStep()}
        {step === 1 && renderInfoStep()}
        {step === 2 && renderPreviewStep()}
        {step === 3 && renderOrderStep()}
        {step === 4 && renderResultStep()}

        {/* Navigation */}
        {step < 3 && (
          <div className={styles.stepNav}>
            <button className="btn btn-secondary" onClick={goPrev} disabled={step === 0 || progress.show}>
              ← 이전
            </button>
            <button
              className="btn btn-primary"
              onClick={goNext}
              disabled={!canNext() || progress.show}
            >
              {step === 2 ? '📖 포토북 생성하기' : '다음 →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
